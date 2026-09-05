const fs = require("fs");
const path = require("path");
const HYPERSCALER_SPECS = require("../templates/hyperscaler-specs");

class SowValidator {
  constructor() {}

  /**
   * Validates document text against provider-specific checklist
   * @param {string} rawText - Plain text or markdown content of the SOW
   * @param {object} metadata - Engagement metadata (client, project, partner, provider)
   * @returns {object} Validation results with score and itemized checks
   */
  validate(rawText, metadata = {}) {
    const text = (rawText || "").replace(/\\/g, "");
    const provider = (metadata.provider || "google").toLowerCase();

    if (provider === "aws") {
      return this._validateAws(text, metadata);
    } else if (provider === "azure") {
      return this._validateAzure(text, metadata);
    } else if (provider === "agnostic") {
      return this._validateAgnostic(text, metadata);
    } else {
      return this._validateGoogle(text, metadata);
    }
  }

  // --- GOOGLE CLOUD PSF/DAF 18-POINT CHECKLIST ---
  _validateGoogle(text, metadata) {
    const checks = [
      {
        id: "COVER_PAGE",
        name: "Cover Page & PSF Engagement Type",
        passed:
          /statement of work/i.test(text) &&
          /(foundations|migration|implementation|deployment)/i.test(text) &&
          Boolean(metadata.client || /customer/i.test(text)),
        detail: "Engagement type clearly identified (Foundations/Migration/Implementation/Deployment); Partner and Customer identified.",
      },
      {
        id: "EXECUTIVE_SUMMARY",
        name: "Executive Summary & Business Outcomes",
        passed:
          /executive summary/i.test(text) &&
          /(business value|objective|outcomes|accelerate|transformation)/i.test(text),
        detail: "Outlines business drivers, digital transformation goals, and technical outcomes.",
      },
      {
        id: "EFFECTIVE_DATE",
        name: "Compliant Effective Date (>7 Business Days / Subject to Google)",
        passed:
          /(subject to google.*approval|at least 7 business days|effective date)/i.test(text),
        detail: "Effective date is scheduled post-submission or explicitly conditional on Google Cloud approval.",
      },
      {
        id: "SERVICES_AGREEMENT",
        name: "Governing Services Agreement / MSA Reference",
        passed:
          /(master services agreement|msa|governing agreement|services agreement|warranties)/i.test(text),
        detail: "References executed agreement between partner and customer with indemnification/warranty terms.",
      },
      {
        id: "ARCHITECTURE_DIAGRAM",
        name: "End-State Architecture Overview & Diagram",
        passed:
          /(architecture diagram|end-state|architecture overview|google cloud well-architected)/i.test(text),
        detail: "Architecture overview references end-state diagram, customer context, and Google Cloud services.",
      },
      {
        id: "CUSTOMER_TENANT_BILLING",
        name: "Customer Tenant & Direct GCP Billing Clause",
        passed:
          /(customer tenant|customer's designated google cloud organization|customer will be billed for.*google cloud consumption)/i.test(text),
        detail: "Explicitly states project is deployed in Customer Tenant and consumption is billed directly to Customer.",
      },
      {
        id: "DELIVERABLES_STRUCTURE",
        name: "Itemized Activities & Measurable Deliverables",
        passed:
          /(deliverables|acceptance criteria|phase 1|phase 2|sign-off)/i.test(text),
        detail: "Deliverables itemized by phase with specific acceptance criteria and customer sign-off required.",
      },
      {
        id: "NO_HOURLY_CAPS",
        name: "No Hourly or Capacity Caps",
        passed:
          !/activity limited to \d+ hours/i.test(text) &&
          !/based on available capacity/i.test(text),
        detail: "Scope is outcome-based and does not contain artificial hourly caps (e.g. 'limited to X hours').",
      },
      {
        id: "ENVIRONMENTS_IN_SCOPE",
        name: "Environments Defined (Dev, UAT, Prod)",
        passed:
          /development.*uat.*production/i.test(text) ||
          (text.includes("Dev") && text.includes("UAT") && text.includes("Prod")),
        detail: "All in-scope deployment environments (Development, UAT/Staging, Production) are documented.",
      },
      {
        id: "TIMELINE_TERM",
        name: "Timeline & Pending Acceptance Term",
        passed:
          /(pending acceptance of all deliverables|timeline|milestones)/i.test(text),
        detail: "Work breakdown timeline with future start dates; Term ends 'pending acceptance of all deliverables'.",
      },
      {
        id: "ROLES_RACI",
        name: "Customer & Partner RACI Matrix",
        passed:
          /raci/i.test(text) &&
          /(responsible|accountable|consulted|informed)/i.test(text),
        detail: "RACI governance matrix defines delivery responsibilities between Customer and Partner.",
      },
      {
        id: "GOOGLE_CERTIFICATIONS",
        name: "Partner Google Cloud Certifications & DRP Tier 1 ID",
        passed:
          /(google cloud certified|professional cloud architect|drp)/i.test(text),
        detail: "Partner includes Google Cloud certified roles and Delivery Readiness Portal (DRP) Tier 1 IDs.",
      },
      {
        id: "NO_GOOGLE_ROLES",
        name: "No Google Delivery Roles in SOW",
        passed:
          !/google shall be responsible for (building|deploying|managing)/i.test(text),
        detail: "Google Cloud is listed as funder/approver only and holds no delivery tasks in the SOW.",
      },
      {
        id: "OUT_OF_SCOPE",
        name: "Explicit Out-of-Scope Boundaries",
        passed:
          /out-of-scope/i.test(text) &&
          /(consumption|usage charges|remediation|legacy|24\/7)/i.test(text),
        detail: "Clear boundaries protecting against scope creep and unanticipated liabilities.",
      },
      {
        id: "FIXED_PRICE_USD",
        name: "Fixed Price Model & USD Currency",
        passed:
          /fixed price/i.test(text) &&
          /(usd|\$)/i.test(text),
        detail: "Commercial terms explicitly state Fixed Price in United States Dollars (USD).",
      },
      {
        id: "PSF_70_30_SPLIT",
        name: "PSF Non-Commit 70/30 Payment Milestones",
        passed:
          (/(70%|70 percent)/.test(text) && /project completion/i.test(text)) &&
          (/(30%|30 percent)/.test(text) && /consumption break-even/i.test(text)),
        detail: "Non-Commit PSF structured into exactly two milestones: 70% project completion and 30% consumption break-even.",
      },
      {
        id: "PSF_CONDITIONALITY",
        name: "PSF Approval & Proof of Execution (POE) Clause",
        passed:
          /(subject to formal psf approval|proof of execution|poe|partner shall not obligate customer)/i.test(text),
        detail: "States payment is subject to formal Google PSF approval and protects customer if partner fails POE.",
      },
      {
        id: "SIGNATURES_BLOCK",
        name: "Formal Signatures Block for Partner & Customer",
        passed:
          /(authorized signature|signatures & approvals|by signing below)/i.test(text),
        detail: "Signature blocks for both parties, signed post Google fund request approval.",
      },
    ];

    return this._formatResult(checks, "Google Cloud PSF / DAF Review Checklist (18 Checks)", "google");
  }

  // --- AWS MAP 2.0 & WELL-ARCHITECTED SOW STANDARDS ---
  _validateAws(text, metadata) {
    const checks = [
      {
        id: "COVER_PAGE",
        name: "Cover Page & AWS MAP Engagement Program",
        passed: /statement of work/i.test(text) && /(aws|amazon web services|map)/i.test(text),
        detail: "Cover page states AWS APN / MAP 2.0 engagement scope, customer, and partner.",
      },
      {
        id: "EXECUTIVE_SUMMARY",
        name: "Executive Summary & Modernization Drivers",
        passed: /executive summary/i.test(text) && /(business|cloud adoption|modernization|accelerate)/i.test(text),
        detail: "Outlines customer business goals, scalability, and target modernization outcomes.",
      },
      {
        id: "AWS_TENANT_BILLING",
        name: "Customer AWS Payer Account & Ownership Mandate",
        passed: /(aws organization|payer account|customer retains exclusive root ownership|billed directly to customer)/i.test(text),
        detail: "Mandates deployment within Customer-owned AWS Organization with direct AWS consumption billing.",
      },
      {
        id: "SERVICES_AGREEMENT",
        name: "Governing MSA & Warranty Protection",
        passed: /(master services agreement|msa|governing agreement|warranties)/i.test(text),
        detail: "Governing terms, confidentiality, intellectual property ownership, and indemnification.",
      },
      {
        id: "WELL_ARCHITECTED_ALIGNMENT",
        name: "AWS Well-Architected Framework Alignment",
        passed: /(well-architected|architecture diagram|end-state|security.*reliability)/i.test(text),
        detail: "Aligns architecture with AWS Well-Architected pillars (Security, Reliability, Cost Optimization).",
      },
      {
        id: "DELIVERABLES_STRUCTURE",
        name: "Deliverables by Phase with Acceptance Criteria",
        passed: /(deliverables|acceptance criteria|phase 1|phase 2|sign-off)/i.test(text),
        detail: "Clear milestone activities tied to tangible deliverables and measurable sign-off criteria.",
      },
      {
        id: "NO_HOURLY_CAPS",
        name: "Deliverable-Based Scope (No Hourly Caps)",
        passed: !/activity limited to \d+ hours/i.test(text),
        detail: "Outcome-based pricing without artificial T&M caps or hour allocations.",
      },
      {
        id: "ENVIRONMENTS_IN_SCOPE",
        name: "Defined AWS Environments (Dev, UAT, Prod)",
        passed: /development.*uat.*production/i.test(text) || (text.includes("Dev") && text.includes("UAT") && text.includes("Prod")),
        detail: "Documents Dev, UAT/Staging, and Production environments within AWS account hierarchy.",
      },
      {
        id: "TIMELINE_TERM",
        name: "Project Timeline & Phase Gate Schedule",
        passed: /(timeline|milestones|phase 1|phase 2|phase 3)/i.test(text),
        detail: "Phased project schedule with deliverable milestone triggers.",
      },
      {
        id: "RACI_GOVERNANCE",
        name: "Customer & Partner RACI Matrix",
        passed: /raci/i.test(text) && /(responsible|accountable|consulted|informed)/i.test(text),
        detail: "Defines stakeholder roles and accountability across the project lifecycle.",
      },
      {
        id: "AWS_CERTIFICATIONS",
        name: "Certified AWS Solutions Architect Lead",
        passed: /(aws solutions architect|aws certified|apn)/i.test(text),
        detail: "Designates Atlas Geek Certified AWS Solutions Architect (Professional tier).",
      },
      {
        id: "NO_AWS_ROLES",
        name: "No AWS Delivery Tasks in SOW",
        passed: !/aws shall be responsible for (building|deploying|managing)/i.test(text),
        detail: "Ensures AWS holds no direct implementation or operational tasks in the contract.",
      },
      {
        id: "OUT_OF_SCOPE",
        name: "Explicit Out-of-Scope Exclusions",
        passed: /out-of-scope/i.test(text) && /(consumption|usage charges|remediation|legacy)/i.test(text),
        detail: "Protects against scope creep, third-party licensing, and out-of-scope application rewrites.",
      },
      {
        id: "FIXED_PRICE_USD",
        name: "Fixed Price Commercial Model (USD)",
        passed: /fixed price/i.test(text) && /(usd|\$)/i.test(text),
        detail: "Fixed fee structure in USD aligned with milestone deliverable acceptance.",
      },
      {
        id: "AWS_MILESTONE_PAYMENTS",
        name: "Phased Milestone Deliverable Payment Triggers",
        passed: /(milestone 1|milestone 2|milestone 3)/i.test(text) && /(30%|40%|sign-off)/i.test(text),
        detail: "Clear payment milestones tied to landing zone, workload build, and final sign-off.",
      },
      {
        id: "SIGNATURES_BLOCK",
        name: "Formal Signatures & Execution Block",
        passed: /(authorized signature|signatures & approvals|by signing below)/i.test(text),
        detail: "Formal signature blocks for Customer and Atlas Geek authorized representatives.",
      },
    ];

    return this._formatResult(checks, "AWS MAP 2.0 & Well-Architected SOW Quality Standards (16 Checks)", "aws");
  }

  // --- MICROSOFT AZURE AMMP & CAF SOW STANDARDS ---
  _validateAzure(text, metadata) {
    const checks = [
      {
        id: "COVER_PAGE",
        name: "Cover Page & Azure Engagement Program",
        passed: /statement of work/i.test(text) && /(azure|microsoft|ammp|caf)/i.test(text),
        detail: "Cover page states Azure AMMP / Cloud Adoption Framework scope, customer, and partner.",
      },
      {
        id: "EXECUTIVE_SUMMARY",
        name: "Executive Summary & Business Value",
        passed: /executive summary/i.test(text) && /(business|azure|modernization|digital transformation)/i.test(text),
        detail: "Summarizes strategic business drivers and cloud modernization goals.",
      },
      {
        id: "AZURE_TENANT_BILLING",
        name: "Customer Azure Entra ID Tenant & Subscription Mandate",
        passed: /(entra id|azure ad|subscription|billed directly to customer)/i.test(text),
        detail: "Mandates deployment within Customer Microsoft Entra ID tenant with direct Azure billing.",
      },
      {
        id: "SERVICES_AGREEMENT",
        name: "Governing MSA & Warranty Terms",
        passed: /(master services agreement|msa|governing agreement|warranties)/i.test(text),
        detail: "Governing agreement terms, intellectual property ownership, and warranties.",
      },
      {
        id: "CAF_ALIGNMENT",
        name: "Microsoft Cloud Adoption Framework (CAF) Alignment",
        passed: /(cloud adoption framework|caf|landing zone|management groups)/i.test(text),
        detail: "Architecture follows Microsoft Azure Cloud Adoption Framework principles and landing zones.",
      },
      {
        id: "DELIVERABLES_STRUCTURE",
        name: "Deliverables by Phase with Acceptance Criteria",
        passed: /(deliverables|acceptance criteria|phase 1|phase 2|sign-off)/i.test(text),
        detail: "Itemized deliverables tied to concrete customer sign-off criteria.",
      },
      {
        id: "NO_HOURLY_CAPS",
        name: "Deliverable-Based Scope (No Hourly Caps)",
        passed: !/activity limited to \d+ hours/i.test(text),
        detail: "Outcome-based pricing without arbitrary hourly or staffing caps.",
      },
      {
        id: "ENVIRONMENTS_IN_SCOPE",
        name: "Defined Azure Environments (Dev, UAT, Prod)",
        passed: /development.*uat.*production/i.test(text) || (text.includes("Dev") && text.includes("UAT") && text.includes("Prod")),
        detail: "Documents Dev, UAT/Staging, and Production Azure resource groups and subscriptions.",
      },
      {
        id: "TIMELINE_TERM",
        name: "Project Timeline & Milestone Milestones",
        passed: /(timeline|milestones|phase 1|phase 2|phase 3)/i.test(text),
        detail: "Work breakdown timeline with clearly demarcated phase durations.",
      },
      {
        id: "RACI_GOVERNANCE",
        name: "Customer & Partner RACI Matrix",
        passed: /raci/i.test(text) && /(responsible|accountable|consulted|informed)/i.test(text),
        detail: "RACI matrix clarifying technical delivery duties between Customer and Atlas Geek.",
      },
      {
        id: "AZURE_CERTIFICATIONS",
        name: "Certified Azure Solutions Architect Expert Lead",
        passed: /(azure solutions architect|certified azure|microsoft certified)/i.test(text),
        detail: "Designates Atlas Geek Certified Azure Solutions Architect Expert.",
      },
      {
        id: "NO_MICROSOFT_ROLES",
        name: "No Microsoft Delivery Tasks in SOW",
        passed: !/microsoft shall be responsible for (building|deploying|managing)/i.test(text),
        detail: "Ensures Microsoft holds no direct delivery or engineering obligations in the SOW.",
      },
      {
        id: "OUT_OF_SCOPE",
        name: "Explicit Out-of-Scope Exclusions",
        passed: /out-of-scope/i.test(text) && /(consumption|usage charges|remediation|legacy)/i.test(text),
        detail: "Explicit boundaries protecting against scope expansion and unforeseen legacy issues.",
      },
      {
        id: "FIXED_PRICE_USD",
        name: "Fixed Price Commercial Model (USD)",
        passed: /fixed price/i.test(text) && /(usd|\$)/i.test(text),
        detail: "Fixed price fee in USD tied to milestone deliverables.",
      },
      {
        id: "AZURE_MILESTONE_PAYMENTS",
        name: "Phased Milestone Deliverable Payment Triggers",
        passed: /(milestone 1|milestone 2|milestone 3)/i.test(text) && /(30%|40%|sign-off)/i.test(text),
        detail: "Milestone payment structure (Landing Zone, Migration, Handover).",
      },
      {
        id: "SIGNATURES_BLOCK",
        name: "Formal Signatures & Execution Block",
        passed: /(authorized signature|signatures & approvals|by signing below)/i.test(text),
        detail: "Signatures for authorized customer and partner executives.",
      },
    ];

    return this._formatResult(checks, "Microsoft Azure AMMP & CAF SOW Quality Standards (16 Checks)", "azure");
  }

  // --- CLOUD AGNOSTIC / ENTERPRISE SOLUTION ARCHITECTURE STANDARDS ---
  _validateAgnostic(text, metadata) {
    const checks = [
      {
        id: "COVER_PAGE",
        name: "Cover Page & Project Title",
        passed: /statement of work/i.test(text) && Boolean(metadata.client || /customer/i.test(text)),
        detail: "Cover page clearly states SOW title, customer name, partner name, and date.",
      },
      {
        id: "EXECUTIVE_SUMMARY",
        name: "Executive Summary & Business Value",
        passed: /executive summary/i.test(text) && /(business|objective|transformation|efficiency)/i.test(text),
        detail: "Outlines customer drivers, project vision, and tangible business benefits.",
      },
      {
        id: "INFRASTRUCTURE_OWNERSHIP",
        name: "Customer Infrastructure Sovereignty & Direct Billing",
        passed: /(customer-owned|customer retains|billed directly to customer)/i.test(text),
        detail: "States that infrastructure accounts are owned by Customer and third-party fees billed directly.",
      },
      {
        id: "SERVICES_AGREEMENT",
        name: "Governing MSA / Terms Reference",
        passed: /(master services agreement|msa|governing agreement|warranties)/i.test(text),
        detail: "References executed agreement with warranties, IP ownership, and confidentiality.",
      },
      {
        id: "ARCHITECTURE_BLUEPRINT",
        name: "Target Architecture & Solution Blueprint",
        passed: /(architecture|topology|solution|infrastructure as code|iac)/i.test(text),
        detail: "Detailed architectural blueprint and technology components.",
      },
      {
        id: "DELIVERABLES_STRUCTURE",
        name: "Phased Deliverables & Concrete Acceptance Criteria",
        passed: /(deliverables|acceptance criteria|phase 1|phase 2|sign-off)/i.test(text),
        detail: "Itemized scope of work with measurable acceptance gates for each phase.",
      },
      {
        id: "NO_HOURLY_CAPS",
        name: "Deliverable-Based Scope (No Hourly Caps)",
        passed: !/activity limited to \d+ hours/i.test(text),
        detail: "Fixed outcome deliverables rather than hourly staff augmentation.",
      },
      {
        id: "ENVIRONMENTS_IN_SCOPE",
        name: "Multi-Tier Environments Defined (Dev, UAT, Prod)",
        passed: /development.*uat.*production/i.test(text) || (text.includes("Dev") && text.includes("UAT") && text.includes("Prod")),
        detail: "Identifies Dev, UAT/Staging, and Production deployment targets.",
      },
      {
        id: "TIMELINE_TERM",
        name: "Project Schedule & Milestone Gates",
        passed: /(timeline|milestones|phase 1|phase 2|duration)/i.test(text),
        detail: "Time estimates with target completion windows.",
      },
      {
        id: "RACI_GOVERNANCE",
        name: "RACI Governance Matrix",
        passed: /raci/i.test(text) && /(responsible|accountable|consulted|informed)/i.test(text),
        detail: "Clear RACI governance defining Customer and Partner roles.",
      },
      {
        id: "LEAD_ARCHITECT",
        name: "Lead Solutions Architect Assigned",
        passed: /(solutions architect|architect|lead engineer)/i.test(text),
        detail: "Assigns qualified Senior Solutions Architect to the engagement.",
      },
      {
        id: "OUT_OF_SCOPE",
        name: "Explicit Out-of-Scope Boundaries",
        passed: /out-of-scope/i.test(text) && /(licensing|remediation|support|legacy)/i.test(text),
        detail: "Clear boundary definitions preventing scope creep.",
      },
      {
        id: "FIXED_PRICE_USD",
        name: "Fixed Price Commercial Model (USD)",
        passed: /fixed price/i.test(text) && /(usd|\$)/i.test(text),
        detail: "Commercial terms define fixed fee in USD.",
      },
      {
        id: "COMMERCIAL_MILESTONES",
        name: "Milestone Deliverable Payment Triggers",
        passed: /(milestone 1|milestone 2|milestone 3|milestone 4)/i.test(text) && /(sign-off|acceptance|payable)/i.test(text),
        detail: "Payments structured around verifiable phase deliverable sign-offs.",
      },
      {
        id: "SIGNATURES_BLOCK",
        name: "Formal Signatures & Execution Block",
        passed: /(authorized signature|signatures & approvals|by signing below)/i.test(text),
        detail: "Formal signature blocks for both contracting parties.",
      },
    ];

    return this._formatResult(checks, "Enterprise Solution Architecture SOW Quality Standards (15 Checks)", "agnostic");
  }

  _formatResult(checks, standardName, provider) {
    const passedCount = checks.filter((c) => c.passed).length;
    const totalCount = checks.length;
    const score = Math.round((passedCount / totalCount) * 100);
    const isCompliant = passedCount === totalCount;

    return {
      provider,
      standardName,
      score,
      passedCount,
      totalCount,
      isCompliant,
      status: isCompliant ? "PASS" : "BLOCKED",
      checks,
    };
  }

  generateReport(validationResult, metadata = {}) {
    const spec = HYPERSCALER_SPECS[validationResult.provider] || HYPERSCALER_SPECS.google;
    const lines = [
      `# ${validationResult.standardName} Compliance Report`,
      ``,
      `> **Engagement:** ${metadata.project || "Cloud Modernization Engagement"}`,
      `> **Customer:** ${metadata.client || "Customer"}`,
      `> **Cloud Provider:** ${spec.name}`,
      `> **Partner:** Atlas Geek`,
      `> **Compliance Status:** **${validationResult.status}** (${validationResult.score}% Compliant — ${validationResult.passedCount}/${validationResult.totalCount} Checks Passed)`,
      `> **Audit Date:** ${new Date().toISOString()}`,
      ``,
      `---`,
      ``,
      `## Itemized Compliance Checklist Audit`,
      ``,
      `| # | Checklist Item | Status | Requirement & Findings |`,
      `|---|---|:---:|---|`,
    ];

    validationResult.checks.forEach((c, idx) => {
      const statusIcon = c.passed ? "✅ PASS" : "❌ FAIL";
      lines.push(`| ${idx + 1} | **${c.name}** | ${statusIcon} | ${c.detail} |`);
    });

    lines.push(``);
    lines.push(`---`);
    lines.push(``);
    if (validationResult.isCompliant) {
      lines.push(`### Overall Recommendation`);
      lines.push(
        `✅ **Ready for Review & Execution.** All mandatory quality and governance criteria specified for ${spec.name} have been satisfied. Share as a Google Doc out of the Atlas Geek domain with comment/suggest access for reviewers.`
      );
    } else {
      lines.push(`### Action Items Required`);
      lines.push(
        `⚠️ The SOW has failed ${validationResult.totalCount - validationResult.passedCount} criteria. Review the failing checklist items above before submitting to the client or fund reviewer.`
      );
    }

    return lines.join("\n");
  }
}

module.exports = SowValidator;
