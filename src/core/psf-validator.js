const fs = require("fs");
const path = require("path");
const PSF_SPEC = require("../templates/psf-spec");

class PsfValidator {
  constructor() {}

  /**
   * Validates document text against Google Cloud PSF/DAF Checklist
   * @param {string} text - Plain text or markdown content of the SOW
   * @param {object} metadata - Engagement metadata
   * @returns {object} Validation results with score and itemized checks
   */
  validate(rawText, metadata = {}) {
    // Normalize markdown escapes (e.g. \\- -> -) so regex checks match reliably
    const text = (rawText || "").replace(/\\/g, "");

    const checks = [
      {
        id: "COVER_PAGE",
        name: "Cover Page & PSF Engagement Type",
        passed:
          /statement of work/i.test(text) &&
          /(foundations|migration|implementation|deployment)/i.test(text) &&
          Boolean(metadata.client || /customer/i.test(text)) &&
          Boolean(metadata.partner || /atlas geek/i.test(text)),
        detail: "Engagement type clearly identified (Foundations/Migration/Implementation/Deployment); Partner and Customer identified.",
      },
      {
        id: "EXECUTIVE_SUMMARY",
        name: "Executive Summary & Business Outcomes",
        passed:
          /executive summary/i.test(text) &&
          /(business value|objective|outcomes|accelerate)/i.test(text),
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

    const passedCount = checks.filter((c) => c.passed).length;
    const totalCount = checks.length;
    const score = Math.round((passedCount / totalCount) * 100);
    const isCompliant = passedCount === totalCount;

    return {
      score,
      passedCount,
      totalCount,
      isCompliant,
      status: isCompliant ? "PASS" : "BLOCKED",
      checks,
    };
  }

  generateReport(validationResult, metadata = {}) {
    const lines = [
      `# Google Cloud PSF / DAF SOW Compliance Report`,
      ``,
      `> **Engagement:** ${metadata.project || "Google Cloud Engagement"}`,
      `> **Customer:** ${metadata.client || "Customer"}`,
      `> **Partner:** Atlas Geek`,
      `> **Compliance Status:** **${validationResult.status}** (${validationResult.score}% Compliant — ${validationResult.passedCount}/${validationResult.totalCount} Checks Passed)`,
      `> **Audit Date:** ${new Date().toISOString()}`,
      ``,
      `---`,
      ``,
      `## Itemized Google PSF/DAF Checklist Audit`,
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
        `✅ **Ready for Google Cloud PSF / DAF Review Submission.** All mandatory checklist criteria specified by Google Cloud Partner Services Funds have been satisfied. Share as a Google Doc out of the Atlas Geek domain with comment and edit access for reviewers.`
      );
    } else {
      lines.push(`### Action Items Required`);
      lines.push(
        `⚠️ The SOW has failed ${validationResult.totalCount - validationResult.passedCount} Google PSF criteria. Review the failing checklist items above before submitting to the regional Google approver.`
      );
    }

    return lines.join("\n");
  }
}

module.exports = PsfValidator;
