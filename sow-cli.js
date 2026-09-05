#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { program } = require("commander");

const SowBuilder = require("./src/core/sow-builder");
const SowValidator = require("./src/core/sow-validator");
const clientResolver = require("./src/core/client-resolver");
const { convertDocxToMarkdown } = require("./src/sync/docx-to-md");
const SyncWatcher = require("./src/sync/sync-watcher");
const BRAND = require("./src/templates/brand-theme");
const HYPERSCALER_SPECS = require("./src/templates/hyperscaler-specs");

program
  .name("sow-manager")
  .description("Atlas Geek SOW Manager — Multi-Hyperscaler SOW Generator (Google Cloud, AWS, Azure, Agnostic)")
  .version("2.1.0");

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

// ==========================================
// COMMAND: GENERATE (Full Hyperscaler SOW + Audit)
// ==========================================
program
  .command("generate")
  .description("Generate complete SOW (.docx), Markdown sync, and Hyperscaler compliance audit")
  .requiredOption("-c, --client <name>", "Client name / directory identifier")
  .option("--provider <cloud>", "Cloud provider: google | aws | azure | agnostic", "google")
  .option("-p, --project <name>", "Project title")
  .option("-t, --type <type>", "Engagement scope type")
  .option("-f, --fee <number>", "Total engagement fixed fee in USD", (val) => parseInt(val, 10), 50000)
  .option("-n, --notes <text>", "Context notes or PRD summary text", "")
  .action(async (options) => {
    const { client, provider = "google", fee, notes = "" } = options;
    const spec = HYPERSCALER_SPECS[provider.toLowerCase()] || HYPERSCALER_SPECS.google;
    const project = options.project || `${spec.name} Modernization & Deployment`;
    const type = options.type || spec.defaultEngagementType;
    const dateStr = new Date().toISOString().split("T")[0];
    const { outputsDir } = getClientPaths(client);

    console.log(`\n======================================================`);
    console.log(`🚀 ATLAS GEEK SOW MANAGER — HYPERSCALER PIPELINE`);
    console.log(`======================================================`);
    console.log(`Client:          ${client}`);
    console.log(`Cloud Provider:  ${spec.name} (${provider.toUpperCase()})`);
    console.log(`Project:         ${project}`);
    console.log(`Engagement Type: ${type}`);
    console.log(`Commercials:     Fixed Price $${fee.toLocaleString()} USD (${spec.commercialModel})`);
    console.log(`Output Folder:   ${outputsDir}\n`);

    // 1. Build SOW DOCX
    console.log(`📄 Step 1: Compiling ${spec.name} compliant SOW (.docx)...`);
    const sowBuilder = new SowBuilder({
      client,
      provider,
      project,
      engagementType: type,
      totalFee: fee,
      date: dateStr,
      contextNotes: notes,
    });

    const doc = sowBuilder.buildDocument({
      client,
      provider,
      project,
      engagementType: type,
      totalFee: fee,
      contextNotes: notes,
    });

    const safeClientName = client.toLowerCase().replace(/[\s_-]+/g, "_");
    const docxFileName = `sow-${safeClientName}.docx`;
    const docxPath = path.join(outputsDir, docxFileName);
    await sowBuilder.saveToFile(doc, docxPath);
    console.log(`   ✅ SOW DOCX created: ${docxFileName}`);

    // 2. Perform In-Memory Hyperscaler Checklist Audit
    console.log(`\n🔍 Step 2: Auditing in-memory against ${spec.governingRules}...`);
    const { markdown } = await convertDocxToMarkdown(docxPath);
    const validator = new SowValidator();
    const validation = validator.validate(markdown, {
      client,
      provider,
      project,
      partner: BRAND.name,
    });

    console.log(`   ✅ Compliance Score: ${validation.score}% (${validation.passedCount}/${validation.totalCount} checks passed) — Status: ${validation.status}`);

    console.log(`\n======================================================`);
    console.log(`🎉 SOW GENERATION COMPLETE & SYNC-READY!`);
    console.log(`======================================================`);
    console.log(`Generated Deliverable:`);
    console.log(`📄 ${docxPath}`);
    console.log(`\nCloud Notes:`);
    console.log(`1. Google Drive Desktop will automatically upload '${docxFileName}' to Google Drive.`);
    console.log(`2. Open in Google Docs or Microsoft Word to review, sign, and share with stakeholders.\n`);
  });

// ==========================================
// COMMAND: VALIDATE (Hyperscaler Checklist Audit)
// ==========================================
program
  .command("validate")
  .description("Audit an existing client SOW against specified Hyperscaler Checklist")
  .requiredOption("-c, --client <name>", "Client name")
  .option("--provider <cloud>", "Cloud provider: google | aws | azure | agnostic", "google")
  .action(async (options) => {
    const { client, provider = "google" } = options;
    const { outputsDir } = getClientPaths(client);
    const files = fs.readdirSync(outputsDir);

    const docxFile = files.find((f) => f.startsWith("sow-") && f.endsWith(".docx") && (f.includes(provider) || !f.includes("-aws-") && !f.includes("-azure-")));
    if (!docxFile) {
      console.error(`❌ No SOW docx found in ${outputsDir}`);
      process.exit(1);
    }

    const docxPath = path.join(outputsDir, docxFile);
    const { markdown } = await convertDocxToMarkdown(docxPath);
    const validator = new SowValidator();
    const result = validator.validate(markdown, { client, provider, partner: BRAND.name });

    console.log(validator.generateReport(result, { client, provider }));
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
