#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { program } = require("commander");

const SowBuilder = require("./src/core/sow-builder");
const SlideDesigner = require("./src/core/slide-designer");
const PsfValidator = require("./src/core/psf-validator");
const { convertDocxToMarkdown } = require("./src/sync/docx-to-md");
const SyncWatcher = require("./src/sync/sync-watcher");
const BRAND = require("./src/templates/brand-theme");

program
  .name("sow-manager")
  .description("Atlas Geek SOW Manager — Google PSF/DAF Compliant SOW & Slide Deck Generator")
  .version("2.0.0");

const clientResolver = require("./src/core/client-resolver");

// Helper to ensure client directory structure
function getClientPaths(clientName) {
  const paths = clientResolver.getClientPaths(clientName);
  return {
    baseDir: paths.clientDir,
    inputsDir: paths.inputDir,
    outputsDir: paths.outputDir,
    clientName: paths.clientName,
  };
}

// Helper to scan PRD or input context if present
function loadClientContext(clientName, outputsDir) {
  let executiveSummary = null;
  let inScope = null;
  let outOfScope = null;

  // Check for existing PRD file in outputs
  if (fs.existsSync(outputsDir)) {
    const files = fs.readdirSync(outputsDir);
    const prdFile = files.find((f) => f.startsWith("prd-") && f.endsWith(".md"));
    if (prdFile) {
      const content = fs.readFileSync(path.join(outputsDir, prdFile), "utf-8");
      // Extract summary
      const execMatch = content.match(/## 1\. Executive Summary([\s\S]*?)(## 2|$)/i);
      if (execMatch) {
        executiveSummary = execMatch[1].replace(/\n+/g, " ").trim();
      }
    }
  }

  return { executiveSummary, inScope, outOfScope };
}

// ==========================================
// COMMAND: GENERATE (Full SOW + Slides + Audit)
// ==========================================
program
  .command("generate")
  .description("Generate complete SOW (.docx), Slide Deck (.pptx), Markdown sync, and Google PSF audit")
  .requiredOption("-c, --client <name>", "Client name / directory identifier")
  .option("-p, --project <name>", "Project title", "Google Cloud Modernization & Deployment")
  .option("-t, --type <type>", "Google PSF engagement type (Foundations/Migration/Implementation/Deployment)", "Implementation")
  .option("-f, --fee <number>", "Total engagement fixed fee in USD", (val) => parseInt(val, 10), 50000)
  .action(async (options) => {
    const { client, project, type, fee } = options;
    const dateStr = new Date().toISOString().split("T")[0];
    const { outputsDir } = getClientPaths(client);
    const context = loadClientContext(client, outputsDir);

    console.log(`\n======================================================`);
    console.log(`🚀 ATLAS GEEK SOW MANAGER — GOOGLE PSF/DAF PIPELINE`);
    console.log(`======================================================`);
    console.log(`Client:          ${client}`);
    console.log(`Project:         ${project}`);
    console.log(`Engagement Type: Google Cloud PSF: ${type}`);
    console.log(`Commercials:     Fixed Price $${fee.toLocaleString()} USD (70/30 PSF Split)`);
    console.log(`Output Folder:   ${outputsDir}\n`);

    // 1. Build SOW DOCX
    console.log(`📄 Step 1: Compiling Google PSF/DAF compliant SOW (.docx)...`);
    const sowBuilder = new SowBuilder({
      client,
      project,
      engagementType: type,
      totalFee: fee,
      date: dateStr,
    });

    const doc = sowBuilder.buildDocument({
      client,
      project,
      engagementType: type,
      totalFee: fee,
      executiveSummary: context.executiveSummary,
      inScope: context.inScope,
      outOfScope: context.outOfScope,
    });

    const docxFileName = `sow-${client.toLowerCase()}-${dateStr}.docx`;
    const docxPath = path.join(outputsDir, docxFileName);
    await sowBuilder.saveToFile(doc, docxPath);
    console.log(`   ✅ SOW DOCX created: ${docxFileName}`);

    // 2. Synchronize to Markdown for local parity
    console.log(`\n🔄 Step 2: Synchronizing SOW to local Markdown representation...`);
    const mdFileName = `sow-${client.toLowerCase()}-${dateStr}.md`;
    const mdPath = path.join(outputsDir, mdFileName);
    await convertDocxToMarkdown(docxPath, { outputPath: mdPath });
    console.log(`   ✅ Synced Markdown created: ${mdFileName}`);

    // 3. Generate Slide Presentation PPTX
    console.log(`\n📊 Step 3: Generating Executive Slide Presentation (.pptx / Google Slides)...`);
    const slideDesigner = new SlideDesigner({
      client,
      project,
      engagementType: type,
      totalFee: fee,
      date: dateStr,
    });

    const presentation = slideDesigner.createPresentation({
      client,
      project,
      engagementType: type,
      totalFee: fee,
      inScope: context.inScope,
      outOfScope: context.outOfScope,
    });

    const pptxFileName = `slides-${client.toLowerCase()}-${dateStr}.pptx`;
    const pptxPath = path.join(outputsDir, pptxFileName);
    await slideDesigner.saveToFile(presentation, pptxPath);
    console.log(`   ✅ Slide Presentation created: ${pptxFileName}`);

    // 4. Run Google PSF/DAF Checklist Audit
    console.log(`\n🔍 Step 4: Auditing against Google Cloud PSF/DAF Official Checklist...`);
    const mdContent = fs.readFileSync(mdPath, "utf-8");
    const validator = new PsfValidator();
    const validation = validator.validate(mdContent, {
      client,
      project,
      partner: BRAND.name,
    });

    const auditReport = validator.generateReport(validation, { client, project });
    const auditFileName = `psf-checklist-${client.toLowerCase()}-${dateStr}.md`;
    const auditPath = path.join(outputsDir, auditFileName);
    fs.writeFileSync(auditPath, auditReport, "utf-8");

    console.log(`   ✅ PSF Audit Score: ${validation.score}% (${validation.passedCount}/${validation.totalCount} checks passed)`);
    console.log(`   ✅ Audit Report saved: ${auditFileName}`);

    console.log(`\n======================================================`);
    console.log(`🎉 GENERATION COMPLETE & SYNC-READY!`);
    console.log(`======================================================`);
    console.log(`All files are located in:`);
    console.log(`📂 ${outputsDir}`);
    console.log(`\nCloud Sync Notes:`);
    console.log(`1. Google Drive Desktop will automatically upload these files to Google Drive.`);
    console.log(`2. Open '${docxFileName}' in Google Docs to edit or share with Google PSF reviewers.`);
    console.log(`3. Open '${pptxFileName}' in Google Slides for client/internal presentation.`);
    console.log(`4. Run 'node sow-cli.js watch --client ${client}' to monitor and auto-sync online edits back to local markdown.\n`);
  });

// ==========================================
// COMMAND: SLIDES (Only Slide Deck)
// ==========================================
program
  .command("slides")
  .description("Generate or refresh only the executive presentation slide deck (.pptx)")
  .requiredOption("-c, --client <name>", "Client name / directory identifier")
  .option("-p, --project <name>", "Project title", "Google Cloud Modernization")
  .option("-t, --type <type>", "Google PSF engagement type", "Implementation")
  .option("-f, --fee <number>", "Total engagement fixed fee in USD", (val) => parseInt(val, 10), 50000)
  .action(async (options) => {
    const { client, project, type, fee } = options;
    const dateStr = new Date().toISOString().split("T")[0];
    const { outputsDir } = getClientPaths(client);
    const context = loadClientContext(client, outputsDir);

    console.log(`📊 Generating executive presentation deck for ${client}...`);
    const slideDesigner = new SlideDesigner({ client, project, engagementType: type, totalFee: fee, date: dateStr });
    const presentation = slideDesigner.createPresentation({ client, project, engagementType: type, totalFee: fee, inScope: context.inScope, outOfScope: context.outOfScope });

    const pptxFileName = `slides-${client.toLowerCase()}-${dateStr}.pptx`;
    const pptxPath = path.join(outputsDir, pptxFileName);
    await slideDesigner.saveToFile(presentation, pptxPath);
    console.log(`✅ Slides successfully generated at: ${pptxPath}`);
  });

// ==========================================
// COMMAND: VALIDATE (PSF Checklist Audit)
// ==========================================
program
  .command("validate")
  .description("Audit an existing client SOW against Google Cloud PSF/DAF Checklist")
  .requiredOption("-c, --client <name>", "Client name")
  .action(async (options) => {
    const { client } = options;
    const { outputsDir } = getClientPaths(client);
    const files = fs.readdirSync(outputsDir);

    const docxFile = files.find((f) => f.startsWith("sow-") && f.endsWith(".docx"));
    if (!docxFile) {
      console.error(`❌ No SOW docx found in ${outputsDir}`);
      process.exit(1);
    }

    const docxPath = path.join(outputsDir, docxFile);
    const { markdown } = await convertDocxToMarkdown(docxPath);
    const validator = new PsfValidator();
    const result = validator.validate(markdown, { client, partner: BRAND.name });

    console.log(validator.generateReport(result, { client }));
  });

// ==========================================
// COMMAND: WATCH (Two-Way Sync Daemon)
// ==========================================
program
  .command("watch")
  .description("Watch Google Drive Desktop directory for changes made in Google Docs online and sync to local markdown")
  .option("-c, --client <name>", "Filter to a specific client")
  .action((options) => {
    const watcher = new SyncWatcher({ client: options.client });
    watcher.start();
  });

// ==========================================
// COMMAND: UI (Web Dashboard)
// ==========================================
program
  .command("ui")
  .description("Launch the interactive web dashboard for Atlas Geek SOW Manager")
  .option("-p, --port <number>", "Port number", 4100)
  .action((options) => {
    const server = require("./src/ui/server");
    const port = options.port || 4100;
    server.listen(port, () => {
      console.log(`\n======================================================`);
      console.log(`🌐 ATLAS GEEK SOW MANAGER WEB DASHBOARD IS LIVE!`);
      console.log(`======================================================`);
      console.log(`👉 Open in your browser: http://localhost:${port}`);
      console.log(`======================================================\n`);
    });
  });

program.parse(process.argv);
