const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  LevelFormat,
  BorderStyle,
  WidthType,
  ShadingType,
  VerticalAlign,
  PageBreak,
  Header,
  Footer,
} = require("docx");
const fs = require("fs");

const BLUE = "2E75B6";
const ORANGE = "E87722";
const DARK = "1F2937";
const GRAY = "6B7280";
const WHITE = "FFFFFF";
const HEADER_BG = "2E75B6";
const ALT_ROW = "F3F4F6";
const BORDER_COL = "D1D5DB";

const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER_COL };
const allBorders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 100, bottom: 100, left: 140, right: 140 };

function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 320, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 28, color: BLUE, font: "Calibri" })],
  });
}

function subHeading(text) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: DARK, font: "Calibri" })],
  });
}

function body(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 22, color: DARK, font: "Calibri" })],
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 22, color: DARK, font: "Calibri" })],
  });
}

function spacer(pts = 120) {
  return new Paragraph({ spacing: { before: pts, after: 0 }, children: [] });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function headerCell(text, w) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: allBorders,
    shading: { fill: HEADER_BG, type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, color: WHITE, size: 20, font: "Calibri" })],
      }),
    ],
  });
}

function dataCell(text, w, shade = null) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: allBorders,
    shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        children: [new TextRun({ text, size: 20, color: DARK, font: "Calibri" })],
      }),
    ],
  });
}

function makeTable(headers, colWidths, rows) {
  return new Table({
    width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({ children: headers.map((h, i) => headerCell(h, colWidths[i])) }),
      ...rows.map((row, ri) =>
        new TableRow({
          children: row.map((cell, ci) => dataCell(cell, colWidths[ci], ri % 2 !== 0 ? ALT_ROW : null)),
        })
      ),
    ],
  });
}

function makeHeader(projectTitle) {
  return new Header({
    children: [
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE, space: 4 } },
        spacing: { before: 0, after: 120 },
        children: [
          new TextRun({ text: `${projectTitle} — Statement of Work`, size: 18, color: GRAY, font: "Calibri" }),
          new TextRun({ text: "        Confidential", size: 18, color: ORANGE, bold: true, font: "Calibri" }),
        ],
      }),
    ],
  });
}

function makeFooter(providerName) {
  return new Footer({
    children: [
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: BLUE, space: 4 } },
        alignment: AlignmentType.RIGHT,
        spacing: { before: 80, after: 0 },
        children: [new TextRun({ text: providerName, size: 18, color: GRAY, font: "Calibri" })],
      }),
    ],
  });
}

const projectTitle = "Atlas Geek Amplify Migration";
const providerName = "Mist Avinya";
const clientName = "Atlas Geek";
const outputPath =
  "/Users/rahul/Documents/GitHub/PRD_SOW_Agent/clients/Amplify/outputs/sow-amplify-2026-04-24.docx";

const sections = [
  new Paragraph({
    spacing: { before: 800, after: 160 },
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text: projectTitle, bold: true, size: 56, color: BLUE, font: "Calibri" })],
  }),
  new Paragraph({
    spacing: { before: 0, after: 120 },
    children: [new TextRun({ text: "Statement Of Work", size: 40, color: DARK, font: "Calibri" })],
  }),
  new Paragraph({ children: [new TextRun({ text: `Client: ${clientName}`, size: 22, color: GRAY, font: "Calibri" })] }),
  new Paragraph({ children: [new TextRun({ text: "Date: 2026-04-24", size: 22, color: GRAY, font: "Calibri" })] }),
  spacer(300),
  new Paragraph({
    border: { top: { style: BorderStyle.SINGLE, size: 6, color: ORANGE, space: 4 } },
    children: [new TextRun({ text: `Prepared by: ${providerName}`, size: 22, color: DARK, font: "Calibri" })],
  }),
  pageBreak(),
  sectionHeading("Table of Contents"),
  ...[
    "Executive Summary",
    "Business Objectives",
    "Project Overview",
    "Current Architecture and Challenges",
    "Proposed Architecture",
    "IN SCOPE",
    "OUT OF SCOPE",
    "Assumptions and Risk",
    "Acceptance and Success Criteria",
    "Timelines",
    "Deliverables",
    "Signature and Agreement",
  ].map((x) => body(x)),
  pageBreak(),
  body(
    "The following document memorializes the Statement of Work between Mist Avinya and Atlas Geek. This SOW is entered into as agreed by both parties on the effective date."
  ),
  sectionHeading("Executive Summary"),
  body(
    "Atlas Geek currently hosts 20-25 websites in a single AWS account using AWS Amplify. The Client requires migration of two key websites, Transcribers and Transcreators, into a dedicated AWS account for clear billing segregation and cost transparency."
  ),
  body(
    "The engagement includes migration of image storage from Azure Blob Storage to Amazon S3. Confirmed migration volume is 1.2 GB. The migration is urgent and includes staging validation before production cutover."
  ),
  sectionHeading("Business Objectives"),
  bullet("Migrate Transcribers and Transcreators to dedicated AWS Amplify account."),
  bullet("Migrate 1.2 GB of image assets from Azure Blob to Amazon S3."),
  bullet("Maintain zero-downtime cutover objective through staged validation."),
  bullet("Improve billing visibility for the two websites in the new account."),
  sectionHeading("Project Overview"),
  bullet("Frontend stack: Next.js"),
  bullet("CI/CD stack: GitHub Actions to AWS Amplify"),
  bullet("Database: Supabase remains unchanged and out of migration scope"),
  bullet("CloudFront explicitly out of scope for this phase"),
  sectionHeading("Current Architecture and Challenges"),
  body("Current setup runs multiple websites in one account, making site-level billing allocation difficult."),
  subHeading("Key Challenges"),
  bullet("Urgent timeline with multiple dependencies on client-side access."),
  bullet("Cross-cloud storage dependency between AWS frontend and Azure Blob assets."),
  bullet("Need for secure and validated DNS cutover without service disruption."),
  sectionHeading("Proposed Architecture"),
  body("Provision dedicated AWS account, configure Amplify for both sites, migrate images to S3, and execute controlled DNS cutover."),
  subHeading("Component Mapping"),
  makeTable(
    ["Component", "Current (Source)", "Recommended (Target)"],
    [2400, 3400, 3838],
    [
      ["Frontend Hosting", "AWS Amplify (shared account)", "AWS Amplify (dedicated account)"],
      ["Image Storage", "Azure Blob Storage", "Amazon S3"],
      ["CI/CD", "GitHub Actions to old Amplify", "GitHub Actions to new Amplify"],
      ["Database", "Supabase", "Supabase (no change)"],
      ["CDN", "None", "Out of scope in this phase"],
    ]
  ),
  pageBreak(),
  sectionHeading("IN SCOPE"),
  bullet("Configure dedicated AWS account baseline, IAM guardrails, and billing alarms."),
  bullet("Create and configure Amplify apps for Transcribers and Transcreators."),
  bullet("Update GitHub Actions deployment configuration to target new Amplify apps."),
  bullet("Create and secure S3 storage, migrate 1.2 GB assets from Azure Blob."),
  bullet("Update environment-variable based image URL configuration."),
  bullet("Execute staged validation and production DNS cutover with rollback plan."),
  sectionHeading("OUT OF SCOPE"),
  bullet("CloudFront setup and caching policy implementation."),
  bullet("Supabase migration or backend redesign."),
  bullet("Migration of websites other than Transcribers and Transcreators."),
  bullet("Post-handover managed services and non-migration feature development."),
  sectionHeading("ASSUMPTIONS & RISK"),
  subHeading("Key Risks"),
  bullet("Aggressive timeline may slip if required client access is delayed."),
  bullet("DNS cutover risk if approval or access is delayed during execution window."),
  bullet("CI/CD permission restrictions may delay deployment reconfiguration."),
  subHeading("Mitigation Measures"),
  bullet("Define daily dependency tracking and escalation to client decision-maker."),
  bullet("Prepare pre-validated rollback plan for cutover execution."),
  bullet("Perform early GitHub and IAM permission validation in build phase."),
  sectionHeading("Acceptance & Success Criteria"),
  bullet("Both sites run from target AWS account and resolve through production domains."),
  bullet("All image assets are served from Amazon S3 and no Azure Blob URL remains active."),
  bullet("At least one successful CI/CD deployment per application from main branch."),
  bullet("Client confirms cost visibility and billing segregation in new account."),
  sectionHeading("Timelines"),
  makeTable(
    ["Milestone", "Description", "Timeline"],
    [2800, 4838, 2000],
    [
      ["M-001", "Kickoff and access validation", "2026-04-27"],
      ["M-002", "Amplify and CI/CD setup complete", "2026-05-01"],
      ["M-003", "S3 migration complete", "2026-05-05"],
      ["M-004", "DNS cutover complete", "2026-05-07"],
      ["M-005", "Final handover and sign-off", "2026-05-11"],
    ]
  ),
  sectionHeading("Deliverables"),
  makeTable(
    ["Deliverable", "Description"],
    [3200, 6438],
    [
      ["D-001", "AWS account baseline and billing alarm configuration pack"],
      ["D-002", "Amplify app setup for Transcribers and Transcreators"],
      ["D-003", "CI/CD reconfiguration evidence and deployment logs"],
      ["D-004", "S3 migration completion report for 1.2 GB assets"],
      ["D-005", "DNS cutover report and rollback documentation"],
    ]
  ),
  pageBreak(),
  sectionHeading("Signature & Agreement"),
  body("By signing below, both parties agree to the terms and conditions set forth in this Statement of Work."),
  makeTable(
    ["Mist Avinya", "Atlas Geek"],
    [4819, 4819],
    [
      ["Signature: ___________________________", "Signature: ___________________________"],
      ["Name: ________________________________", "Name: ________________________________"],
      ["Title: _______________________________", "Title: _______________________________"],
      ["Date: ________________________________", "Date: ________________________________"],
    ]
  ),
];

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "\u2022",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  styles: {
    default: { document: { run: { font: "Calibri", size: 22, color: DARK } } },
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
        },
      },
      headers: { default: makeHeader(projectTitle) },
      footers: { default: makeFooter(providerName) },
      children: sections,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outputPath, buf);
  console.log(`SOW generated: ${outputPath}`);
});
