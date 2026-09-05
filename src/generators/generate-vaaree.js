const fs = require("fs");
const path = require("path");
const SowBuilder = require("../core/sow-builder");
const clientResolver = require("../core/client-resolver");
const SowValidator = require("../core/sow-validator");
const { convertDocxToMarkdown } = require("../sync/docx-to-md");
const BRAND = require("../templates/brand-theme");

async function generateVaareeSow() {
  const clientName = "Vaaree";
  const { outputDir } = clientResolver.getClientPaths(clientName);
  const targetDocx = path.join(outputDir, "sow-vaaree.docx");

  const sowData = {
    client: "Vaaree",
    project: "Google Cloud Gemini Enterprise Adoption & Antigravity Developer Migration",
    provider: "google",
    engagementType: "Implementation",
    totalFee: 48000,
    executiveSummary: "The primary objective of this engagement is to accelerate Customer digital transformation, operational efficiency, and deliver high-impact business outcomes through a strategic dual-track cloud and AI modernization initiative on Google Cloud for Vaaree (https://vaaree.com/). Track 1 unblocks and operationalizes Gemini Enterprise licensing across the engineering organization, migrating developer workflows from Cursor (Agent mode) to Google Antigravity (AGY CLI and Antigravity IDE), converting legacy .cursorrules into native Antigravity skills, rules, and MCP servers. Track 2 architects and implements Gemini Enterprise foundation models on Vertex AI within the Customer Tenant, establishing secure multimodal AI pipelines for catalog enrichment, visual discovery, and e-commerce conversational commerce.",

    inScope: [
      "Gemini Enterprise Licensing & Identity Federation: Configure Google Admin Console, assign Gemini Enterprise / Code Assist licenses to developer accounts, enable Cloud AI Companion API (cloudaicompanion.googleapis.com), and establish IAM role bindings (roles/cloudaicompanion.user) to fully resolve the Antigravity user login authentication blocker.",
      "Antigravity Developer Environment Provisioning: Deploy and configure Antigravity CLI (agy), Antigravity IDE, and IDE extensions across engineering workstations with enterprise project binding and policy compliance.",
      "Cursor to Antigravity Workflow Migration: Analyze existing Cursor Agent configurations, convert .cursorrules into Antigravity workspace rules (.gemini/rules), system prompts, and custom developer skills (.gemini/skills).",
      "Model Context Protocol (MCP) Server Integration: Design and integrate secure MCP servers connecting Antigravity agents to Vaaree internal dev databases, GCP Cloud SQL/BigQuery, and staging APIs.",
      "Vertex AI Gemini Enterprise Architecture & Foundation: Deploy Google Cloud foundation infrastructure (Terraform IaC) for Vertex AI Gemini models (Gemini 1.5/2.0 Flash and Pro) with private endpoint connectivity and quota management.",
      "E-Commerce Gemini Use-Case Enablement: Implement proof-of-concept AI pipelines for multimodal catalog tagging, semantic product search, and automated product description generation using Gemini 1.5/2.0 Flash and Pro.",
      "Developer Enablement & Knowledge Transfer: Conduct hands-on technical workshops, developer pairing sessions, and provide administrative operations runbooks for sustaining Antigravity adoption."
    ],

    outOfScope: [
      "Ongoing Google Cloud infrastructure consumption and Gemini API query token charges (billed directly to Customer Tenant)",
      "Procurement or commercial negotiation of additional Google Workspace / Gemini Enterprise licenses",
      "End-user customer support or legacy web store code maintenance outside agreed AI touchpoints",
      "Third-party tool licenses, external SaaS subscriptions, or Cursor contractual terminations",
      "24/7 ongoing managed application support or SRE operations (available under separate SLA)"
    ],

    architectureOverview: "The solution architecture spans two collaborative domains within the Vaaree Google Cloud Tenant: (1) Developer Platform Integration: Google Cloud Identity and IAM federate developer identities (@vaaree.com) with the Cloud AI Companion API and Vertex AI, providing secure, quota-governed access for the Antigravity CLI and Antigravity IDE with local sandbox isolation and zero-trust credentials. (2) Gemini Enterprise AI Foundation: Workloads on Vertex AI utilize Gemini 1.5/2.0 multimodal endpoints connected via Private Service Connect (PSC), integrating with Vaaree product databases and BigQuery for scalable catalog intelligence, visual search, and customer intelligence.",

    deliverablesTable: [
      ["Phase / Milestone", "Work Activities & Scope", "Concrete Deliverables", "Acceptance Criteria"],
      [
        "Phase 1: Licensing, Identity & Antigravity Login Unblocking",
        "Google Admin Console configuration, user license assignments, Gemini for Google Cloud API enablement, IAM role binding (Cloud AI Companion User), and Antigravity CLI/IDE login resolution.",
        "Antigravity Enterprise Authentication Guide, Validated Developer Login Verification Report, IAM Security Matrix.",
        "100% of in-scope engineers successfully authenticated into Antigravity CLI/IDE with enterprise license; Zero login blockers."
      ],
      [
        "Phase 2: Cursor Workflow Migration & Antigravity Tooling",
        "Audit existing Cursor Agent mode usage, translate .cursorrules into .gemini/rules, develop custom .gemini/skills for Vaaree tech stack, configure MCP servers for database/staging access.",
        "Migrated Antigravity Ruleset Repository, Custom Skills Library, MCP Integration Specs, Developer Quickstart Guide.",
        "Engineers successfully executing multi-step agentic workflows in Antigravity matching or exceeding Cursor capability."
      ],
      [
        "Phase 3: Vertex AI Gemini Foundation & E-Commerce Use Cases",
        "Vertex AI tenant setup, API quotas, VPC-SC boundaries, and implementation of Gemini catalog enrichment and multimodal search PoC.",
        "Vertex AI Architecture Specification, Terraform IaC Modules for AI Foundation, Deployed Catalog AI PoC.",
        "Demonstrated catalog enrichment pipeline processing sample SKU batches; Successful multimodal search query response verification."
      ],
      [
        "Phase 4: Developer Onboarding, Handover & PSF Sign-Off",
        "Interactive engineering onboarding workshops, train-the-trainer sessions, as-built documentation delivery, and GCP consumption verification.",
        "As-Built Technical Architecture Document, Operations & Admin Runbook, Recorded Workshop Sessions, Completion Sign-Off.",
        "Customer formal acceptance sign-off on all deliverables; Google Cloud PSF milestone submission verification."
      ]
    ],

    timelineTable: [
      ["Phase", "Estimated Duration", "Target Start Window", "Target Completion Window"],
      ["Phase 1: Licensing, Identity & Antigravity Login Unblocking", "1.5 Weeks", "T+0 (Post Google PSF Approval)", "T+1.5 Weeks"],
      ["Phase 2: Cursor Workflow Migration & Antigravity Tooling", "2.5 Weeks", "T+1.5 Weeks", "T+4 Weeks"],
      ["Phase 3: Vertex AI Gemini Foundation & E-Commerce Use Cases", "2 Weeks", "T+4 Weeks", "T+6 Weeks"],
      ["Phase 4: Developer Onboarding, Handover & PSF Sign-Off", "1 Week", "T+6 Weeks", "T+7 Weeks"]
    ],

    effortTable: [
      ["Role / Resource", "Core Responsibilities & Delivery Focus", "Estimated Hours", "Weekly Allocation"],
      ["Lead Cloud Architect (Certified Professional)", "Architecture design, security governance, Google PSF alignment, executive reviews", "60 Hours", "8–10 hrs/week"],
      ["Senior GenAI & Antigravity Solutions Engineer", "Antigravity login unblocking, Cursor rules translation, custom .gemini/skills, MCP setup", "120 Hours", "15–20 hrs/week"],
      ["Cloud DevOps & IAM Security Specialist", "Google Admin Console license mapping, Companion API enablement, IAM role bindings, Terraform IaC", "60 Hours", "8–10 hrs/week"],
      ["Total Technical Delivery Effort", "Estimated Professional Services Engineering Sizing", "240 Hours", "~35 hrs/week across team"]
    ],

    raciTable: [
      ["Project Activity", "Vaaree (Customer)", "Atlas Geek (Partner)", "Google Cloud (Hyperscaler)"],
      ["SOW Execution & PSF Approval", "Approve (A)", "Responsible (R)", "Grant Approval (Funder)"],
      ["Google Admin Console License Assignment", "Accountable / Responsible (A/R)", "Consulted / Guiding (C)", "None"],
      ["GCP Project IAM & Companion API Enablement", "Consulted (C)", "Responsible (R)", "None"],
      ["Antigravity CLI / IDE Configuration", "Informed (I)", "Responsible (R)", "None"],
      ["Cursor Rules Migration & Skill Engineering", "Consulted (C)", "Responsible (R)", "None"],
      ["Vertex AI Infrastructure & PoC Build", "Informed (I)", "Responsible (R)", "None"],
      ["Developer Workshop Participation", "Responsible (R)", "Accountable (A)", "None"],
      ["Deliverables Formal Sign-Off", "Accountable (A)", "Supportive (S)", "None"],
      ["Ongoing GCP Infrastructure Consumption Billing", "Accountable (A)", "Informed (I)", "Direct Billing"]
    ],

    prerequisites: [
      "Customer will grant Partner designated Cloud Identity / Google Workspace Admin privileges or coordinate real-time administrative access to assign Gemini Enterprise licenses to developer accounts.",
      "Customer will provide Google Cloud Project Owner / IAM Admin access to enable cloudaicompanion.googleapis.com and Vertex AI APIs within 3 business days of kickoff.",
      "Customer will provide access to existing code repositories and .cursorrules configurations for workflow translation.",
      "Customer will designate an Engineering Lead / Product Owner to participate in sprint reviews and milestone approvals.",
      "Partner will not introduce or utilize any third-party tools or SaaS solutions without explicit prior written consent from Customer."
    ],

    successCriteria: [
      "1. Antigravity User Login Unblocked: All in-scope developers successfully logged into Antigravity CLI and Antigravity IDE using their enterprise @vaaree.com Google credentials.",
      "2. Workflow Parity & Migration: Core Cursor Agent workflows, rules, and prompts migrated to Antigravity native rules and skills with demonstrated productivity parity.",
      "3. Gemini Enterprise Foundation: Vertex AI environment operational with secure IAM boundaries and sample catalog enrichment use-case successfully executed.",
      "4. Zero Unresolved Critical Blockers: All technical adoption blockers remediated and documented in admin runbooks.",
      "5. Knowledge Transfer: 100% completion of engineering workshops and delivery of as-built documentation with formal Customer sign-off."
    ]
  };

  const builder = new SowBuilder(sowData);
  const doc = builder.buildDocument(sowData);
  await builder.saveToFile(doc, targetDocx);
  console.log("Successfully generated Vaaree SOW DOCX:", targetDocx);

  // Validate compliance
  const { markdown } = await convertDocxToMarkdown(targetDocx);
  const validator = new SowValidator();
  const validation = validator.validate(markdown, {
    client: "Vaaree",
    provider: "google",
    project: sowData.project,
    partner: BRAND.name,
  });

  console.log(`\nCompliance Score: ${validation.score}% (${validation.passedCount}/${validation.totalCount} checks passed) — Status: ${validation.status}`);
  if (validation.failedCount > 0) {
    console.log(validator.generateReport(validation, { client: "Vaaree", provider: "google" }));
  }
}

if (require.main === module) {
  generateVaareeSow().catch(console.error);
}

module.exports = generateVaareeSow;
