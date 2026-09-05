/**
 * Google Cloud Partner Services Funds (PSF) & Deployment Acceleration Fund (DAF) Specification
 * Grounded directly in Google Cloud's official SOW Review Checklist.
 */

const PSF_SPEC = {
  // Engagement types recognized by Google PSF
  engagementTypes: [
    "Foundations",
    "Migration",
    "Implementation",
    "Deployment",
  ],

  // Google Approver team contacts by geography
  approvers: {
    APAC: "psfapproversAPAC@google.com",
    EMEA: "psfapproversEMEA@google.com",
    LATAM: "psfapproversLATAM@google.com",
    JAPAN: "psfapproversJP@google.com",
    NORTHAM: "psfapproversNORTHAM@google.com",
    NORTHAM_PUBLIC_SECTOR: "psfapproversNORTHAMPS@google.com",
    SCALED_SMB: "PSFApproversSMB@google.com",
    EDU_FA: "psfapproversEDUFA@google.com",
  },

  // Mandatory clauses & rules
  checklistItems: [
    {
      id: "COVER_PAGE",
      name: "Cover Page Details",
      requirement: "Clearly identifies engagement type (Foundations, Migration, Implementation, Deployment), Partner and Customer names. SOW is strictly between Partner and Customer.",
      section: "Cover Page",
    },
    {
      id: "EXECUTIVE_SUMMARY",
      name: "Executive Summary & Effective Date",
      requirement: "Outlines business value & technical outcomes. Effective date must be at least 7 business days after submission or subject to Google approval.",
      section: "1. Executive Summary",
    },
    {
      id: "SERVICES_AGREEMENT",
      name: "Services Agreement Reference",
      requirement: "References fully executed services agreement between Partner and Customer, or includes warranty and indemnification terms.",
      section: "1. Executive Summary & Master Agreement",
    },
    {
      id: "ARCHITECTURE_DIAGRAM",
      name: "End-State Architecture Diagram",
      requirement: "Provides an end-state visual architecture diagram including customer context, integrations, data sources, and Google Cloud services, supplemented by descriptive text.",
      section: "3. Architecture & Technical Solution",
    },
    {
      id: "CUSTOMER_TENANT",
      name: "Customer Tenant & Billing Clause",
      requirement: "States clearly that Google Cloud project will be developed and deployed in the customer tenant and customer will be billed for Google Cloud consumption.",
      section: "3. Architecture & Technical Solution",
    },
    {
      id: "ACTIVITIES_DELIVERABLES",
      name: "Activities & Deliverables Structure",
      requirement: "Activities and deliverables clearly defined and itemized by phase/milestone. Clear statement that customer must sign-off on deliverables. Explicit customer activities. Total duration per milestone. No hourly/capacity caps.",
      section: "4. Scope of Activities & Deliverables",
    },
    {
      id: "WORKLOAD_DETAILS",
      name: "Workload Products & Environments",
      requirement: "Details of workloads running on Google Cloud with quantities and products. Identifies all environments in-scope (Development, UAT, Production).",
      section: "4. Scope of Activities & Deliverables",
    },
    {
      id: "TIMELINE",
      name: "Timeline & Future Dates",
      requirement: "Work breakdown schedule with future start and end dates. Explicitly states Term ends 'pending acceptance of all deliverables'.",
      section: "5. Project Timeline & Milestones",
    },
    {
      id: "ROLES_RACI",
      name: "Roles, RACI & Certifications",
      requirement: "Customer and Partner RACI matrix. Must include partner role(s) with Google Cloud certification(s). Submits DRP Tier 1 (50+) IDs. Does NOT include Google roles.",
      section: "6. Roles, Responsibilities & Governance",
    },
    {
      id: "RAID",
      name: "Risks, Assumptions, Issues, Dependencies",
      requirement: "Clear prerequisites (access, customer consent for third-party tools, connectivity).",
      section: "7. Assumptions, Dependencies & Risks",
    },
    {
      id: "OUT_OF_SCOPE",
      name: "Explicit Out of Scope",
      requirement: "Protects partner and customer against surprises (e.g. testing limits, spend alerts, out of scope legacy systems).",
      section: "2. Project Scope Boundaries",
    },
    {
      id: "SUCCESS_CRITERIA",
      name: "Measurable Success Criteria",
      requirement: "Measurable outcomes aligning with activities and deliverables (e.g., specific workloads migrated and accepted).",
      section: "8. Success Criteria & Acceptance",
    },
    {
      id: "PRICING_MODEL",
      name: "Fixed Price & USD Currency",
      requirement: "SOW clearly states pricing is 'Fixed Price'. Pricing in USD only. Taxes explicitly noted. Remote vs. local indicated.",
      section: "9. Commercial Terms & Pricing",
    },
    {
      id: "PSF_MILESTONES",
      name: "Non-Commit / Flex PSF 70/30 Split",
      requirement: "For Non-Commit / Flex PSF: Exactly two payment milestones: 70% on project completion with associated deliverables, and 30% for consumption break-even.",
      section: "9. Commercial Terms & Pricing",
    },
    {
      id: "PSF_CONDITIONALITY",
      name: "PSF Approval & POE Conditionality",
      requirement: "Explicitly states payment is subject to formal PSF approval by Google Cloud. Partner does not obligate customer to pay if partner fails POE or consumption targets for PSF funds.",
      section: "9. Commercial Terms & Pricing",
    },
    {
      id: "SIGNATURES",
      name: "Signatures Block",
      requirement: "Signature block for Customer and Partner including date of signature (to be signed after Google fund request approval).",
      section: "10. Signatures & Approvals",
    },
    {
      id: "BUSINESS_CASE_ROI",
      name: "Google Business Case & ROI Justification",
      requirement: "Details expected 10:1 ROI, first 12 months estimated ARR, and broader multi-year opportunity.",
      section: "Appendix A: Google Cloud Business Case",
    },
    {
      id: "DOCS_SHARING",
      name: "Google Docs Sharing Instructions",
      requirement: "SOW shared as Google Doc out of partner domain with comments and download enabled (and edit access for Google reviewers to see version history).",
      section: "Appendix B: Google PSF Submission & Review Guidelines",
    },
  ],

  // Boilerplate legal and compliance clauses
  clauses: {
    customerTenantBilling: `All Google Cloud infrastructure, workloads, and services provisioned under this Statement of Work shall be deployed directly within the Customer's designated Google Cloud Organization and billing account (Customer Tenant). The Customer retains full ownership of all tenant configurations, data, and access controls. All ongoing infrastructure consumption and Google Cloud platform usage charges shall be billed directly to the Customer by Google or its designated reseller.`,
    
    psfPaymentTermsNonCommit: `This engagement is executed as a Fixed Price commercial model funded in part or in full under Google Cloud's Partner Services Funds (PSF) / Deployment Acceleration Fund (DAF) program. Payment is strictly subject to formal PSF approval and authorization by Google Cloud. In accordance with Google PSF Non-Commit funding guidelines, fees are structured into two distinct payment milestones:
1. Milestone 1 (70%): Payable upon final project completion and formal Customer sign-off on all agreed deliverables.
2. Milestone 2 (30%): Payable upon verification of target Google Cloud consumption break-even milestones within the Customer Tenant.
All fund figures are specified in United States Dollars (USD). Partner shall not obligate Customer to pay for PSF-funded portions of the Services if Partner fails to satisfy Google Cloud Proof of Execution (POE) requirements or if consumption requirements are not met under the Non-Commit PSF program.`,

    termCondition: `The Term of this SOW shall commence on the Effective Date and shall continue until all project milestones are completed and all deliverables have achieved formal Customer sign-off ("pending acceptance of all deliverables"), unless terminated earlier in accordance with the governing Services Agreement.`,

    googleReviewAccess: `In accordance with Google Cloud Partner Services Funds procedures, this SOW is maintained as a Google Doc within Atlas Geek's Google Workspace domain and shared with the Google Cloud review team with comments, download, and revision history access enabled to facilitate expedited review.`
  },
};

module.exports = PSF_SPEC;
