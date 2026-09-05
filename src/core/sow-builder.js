const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  VerticalAlign,
  PageBreak,
  Header,
  Footer,
  ImageRun,
} = require("docx");

const BRAND = require("../templates/brand-theme");
const PSF_SPEC = require("../templates/psf-spec");

class SowBuilder {
  constructor(options = {}) {
    this.client = options.client || "Client";
    this.project = options.project || "Google Cloud Engagement";
    this.engagementType = options.engagementType || "Implementation"; // Foundations | Migration | Implementation | Deployment
    this.date = options.date || new Date().toISOString().split("T")[0];
    this.version = options.version || "1.0";
    this.currency = "USD";
    this.totalFee = options.totalFee || 50000;
    this.partnerName = BRAND.name;
    this.partnerWebsite = BRAND.website;
    this.partnerEmail = BRAND.email;
    this.drpId = options.drpId || "AG-DRP-88492"; // Partner DRP ID
    this.certifiedArchitect = options.certifiedArchitect || "Atlas Geek Certified Professional Cloud Architect";
  }

  // --- Document Style Helpers ---
  createTitle(text) {
    return new Paragraph({
      spacing: { before: 240, after: 120 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text,
          bold: true,
          size: 40,
          color: BRAND.colors.primary,
          font: BRAND.fonts.primary,
        }),
      ],
    });
  }

  createSubtitle(text) {
    return new Paragraph({
      spacing: { before: 80, after: 240 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text,
          size: 24,
          color: BRAND.colors.muted,
          font: BRAND.fonts.primary,
        }),
      ],
    });
  }

  createSectionHeading(text) {
    return new Paragraph({
      spacing: { before: 360, after: 140 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND.colors.primary, space: 6 },
      },
      children: [
        new TextRun({
          text,
          bold: true,
          size: 26,
          color: BRAND.colors.primary,
          font: BRAND.fonts.primary,
        }),
      ],
    });
  }

  createSubHeading(text) {
    return new Paragraph({
      spacing: { before: 220, after: 80 },
      children: [
        new TextRun({
          text,
          bold: true,
          size: 22,
          color: BRAND.colors.dark,
          font: BRAND.fonts.primary,
        }),
      ],
    });
  }

  createParagraph(text, options = {}) {
    return new Paragraph({
      spacing: { before: 60, after: 60 },
      children: [
        new TextRun({
          text,
          size: 20,
          color: BRAND.colors.body,
          font: BRAND.fonts.primary,
          bold: options.bold || false,
          italics: options.italics || false,
        }),
      ],
    });
  }

  createBullet(text, level = 0) {
    return new Paragraph({
      bullet: { level },
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({
          text,
          size: 20,
          color: BRAND.colors.body,
          font: BRAND.fonts.primary,
        }),
      ],
    });
  }

  createCallout(title, text, isAccent = false) {
    const borderColor = isAccent ? BRAND.colors.accent : BRAND.colors.primary;
    const bgColor = isAccent ? BRAND.colors.accentLight : BRAND.colors.primaryLight;

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: {
                left: { style: BorderStyle.SINGLE, size: 24, color: borderColor },
                top: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
              },
              shading: { fill: bgColor, type: ShadingType.CLEAR },
              margins: { top: 120, bottom: 120, left: 160, right: 160 },
              children: [
                new Paragraph({
                  spacing: { before: 0, after: 40 },
                  children: [
                    new TextRun({
                      text: title,
                      bold: true,
                      size: 20,
                      color: BRAND.colors.dark,
                      font: BRAND.fonts.primary,
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 0, after: 0 },
                  children: [
                    new TextRun({
                      text,
                      size: 18,
                      color: BRAND.colors.body,
                      font: BRAND.fonts.primary,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  }

  createTable(headers, rows, widths = []) {
    const border = { style: BorderStyle.SINGLE, size: 2, color: BRAND.colors.border };
    const allBorders = { top: border, bottom: border, left: border, right: border };
    const cellMargins = { top: 100, bottom: 100, left: 120, right: 120 };

    const headerCells = headers.map((h, i) => {
      return new TableCell({
        width: widths[i] ? { size: widths[i], type: WidthType.DXA } : undefined,
        borders: allBorders,
        shading: { fill: BRAND.colors.primary, type: ShadingType.CLEAR },
        margins: cellMargins,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: h,
                bold: true,
                size: 19,
                color: BRAND.colors.white,
                font: BRAND.fonts.primary,
              }),
            ],
          }),
        ],
      });
    });

    const bodyRows = rows.map((r, rowIndex) => {
      const isAlt = rowIndex % 2 === 1;
      const fill = isAlt ? BRAND.colors.lightBg : BRAND.colors.white;
      const cells = r.map((c, colIndex) => {
        return new TableCell({
          width: widths[colIndex] ? { size: widths[colIndex], type: WidthType.DXA } : undefined,
          borders: allBorders,
          shading: { fill, type: ShadingType.CLEAR },
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: String(c),
                  size: 18,
                  color: BRAND.colors.body,
                  font: BRAND.fonts.primary,
                }),
              ],
            }),
          ],
        });
      });
      return new TableRow({ children: cells });
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: headerCells }), ...bodyRows],
    });
  }

  buildDocument(data = {}) {
    const clientName = data.client || this.client;
    const projectName = data.project || this.project;
    const engagementType = data.engagementType || this.engagementType;
    const totalFee = data.totalFee || this.totalFee;
    const feeMilestone1 = Math.round(totalFee * 0.7); // 70% Non-Commit Milestone 1
    const feeMilestone2 = totalFee - feeMilestone1;  // 30% Consumption Break-even

    // Logo embedding
    let logoRun = null;
    if (fs.existsSync(BRAND.logoPath)) {
      const logoBuffer = fs.readFileSync(BRAND.logoPath);
      logoRun = new ImageRun({
        data: logoBuffer,
        transformation: { width: 220, height: 144 },
      });
    }

    const docChildren = [];

    // --- COVER PAGE ---
    if (logoRun) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 200 },
          children: [logoRun],
        })
      );
    }

    docChildren.push(
      this.createTitle("STATEMENT OF WORK"),
      this.createSubtitle(`Google Cloud Partner Services Funds (PSF) — ${engagementType} Engagement`),
      new Paragraph({ spacing: { before: 200, after: 100 }, children: [] }),
      this.createTable(
        ["Engagement Attribute", "Details"],
        [
          ["Customer Name", clientName],
          ["Partner Name", `${BRAND.name} (${BRAND.website})`],
          ["Project Title", projectName],
          ["Engagement Type", `Google Cloud PSF / DAF: ${engagementType}`],
          ["Document Date", this.date],
          ["Target Effective Date", `At least 7 business days post-submission / Subject to Google PSF approval`],
          ["Governing Agreement", `Atlas Geek Master Services Agreement (MSA) or Customer Services Terms`],
          ["Document Version", this.version],
          ["Commercial Model", `Fixed Price (USD) — PSF Non-Commit / Flex Funding`],
        ],
        [3200, 5800]
      ),
      new Paragraph({ spacing: { before: 200, after: 0 }, children: [] }),
      this.createCallout(
        "Important Note on Partner Services Funds (PSF)",
        "This Statement of Work is executed between Atlas Geek and Customer. The execution and payment milestones defined herein are subject to formal PSF/DAF approval by Google Cloud. Customer and Partner shall formally sign this SOW only after the Fund Request has received formal Google Cloud approval.",
        true
      ),
      new Paragraph({ children: [new PageBreak()] })
    );

    // --- SECTION 1: EXECUTIVE SUMMARY & MASTER AGREEMENT ---
    docChildren.push(
      this.createSectionHeading("1. Executive Summary & Business Drivers"),
      this.createParagraph(
        `This Statement of Work ("SOW") defines the technical services, deliverables, governance, and commercial framework for ${clientName} ("Customer") provided by ${BRAND.name} ("Partner"), designed to implement, migrate, or modernize workloads on Google Cloud.`
      ),
      this.createParagraph(
        data.executiveSummary ||
          `The primary objective of this engagement is to accelerate Customer's cloud adoption and digital transformation on Google Cloud. Through structured architecture design, automated provisioning, and workload migration, this project directly drives operational efficiency, scalability, and measurable business outcomes while optimizing consumption within the Customer's Google Cloud environment.`
      ),
      this.createSubHeading("1.1 Effective Date & Term"),
      this.createParagraph(
        `The Effective Date of this SOW shall be set at least seven (7) business days following Google Cloud Partner Services Funds submission and is strictly subject to Google Cloud formal approval. The Term of this SOW shall commence on the Effective Date and shall continue until all project milestones are completed and all deliverables have achieved formal Customer sign-off ("pending acceptance of all deliverables").`
      ),
      this.createSubHeading("1.2 Governing Agreement"),
      this.createParagraph(
        `This SOW is governed by the Master Services Agreement ("MSA") executed between Partner and Customer. In the absence of a separate executed MSA, this SOW incorporates standard enterprise warranties, confidentiality terms, intellectual property ownership (wherein Customer owns all custom deliverables developed herein), and indemnification protections.`
      )
    );

    // --- SECTION 2: SCOPE BOUNDARIES (IN-SCOPE & OUT-OF-SCOPE) ---
    const inScopeItems = data.inScope || [
      "Discovery and requirements alignment for target workloads",
      "Architecture design and landing zone review within Customer Google Cloud Tenant",
      "Infrastructure-as-Code (Terraform) scripts for core services",
      "Implementation and configuration of in-scope Google Cloud services across Dev, UAT, and Production",
      "Workload migration and deployment validation",
      "Operational handover, architecture documentation, and knowledge transfer session",
    ];

    const outOfScopeItems = data.outOfScope || [
      "Any Google Cloud infrastructure usage charges (billed directly to Customer Tenant)",
      "Modification, refactoring, or remediation of out-of-scope legacy monolithic codebases",
      "End-user application support outside the agreed handover window",
      "Third-party licensing, domain registrations, or external vendor fees",
      "Ongoing 24/7 managed operations or SRE support (available under separate SLA)",
    ];

    docChildren.push(
      this.createSectionHeading("2. Project Scope Boundaries"),
      this.createSubHeading("2.1 In-Scope Work Items"),
      ...inScopeItems.map((item) => this.createBullet(`✓ ${item}`)),
      this.createSubHeading("2.2 Explicit Out-of-Scope Items"),
      this.createParagraph(
        "To prevent scope ambiguity and project risks, the following activities and responsibilities are explicitly excluded from this engagement:"
      ),
      ...outOfScopeItems.map((item) => this.createBullet(`✗ ${item}`))
    );

    // --- SECTION 3: ARCHITECTURE & TECHNICAL SOLUTION ---
    docChildren.push(
      this.createSectionHeading("3. Architecture & Technical Solution"),
      this.createParagraph(
        "The proposed solution is architected around Google Cloud Well-Architected Framework principles, focusing on security, operational excellence, reliability, performance efficiency, and cost optimization."
      ),
      this.createSubHeading("3.1 End-State Architecture Diagram Overview"),
      this.createCallout(
        "Architecture Overview Diagram",
        "[Architecture Diagram: End-state topology illustrating Customer on-prem/hybrid integrations, Google Cloud VPC networking, IAM hierarchy, compute/container workloads, database storage, CI/CD pipeline, and Cloud Operations monitoring. Refer to attached Slide Deck for full visual overview.]"
      ),
      this.createParagraph(
        data.architectureOverview ||
          `The architecture leverages native Google Cloud services integrated into the Customer Tenant. Key components include secure VPC networking with private service connectivity, managed compute/container clusters, secure IAM role bindings with least-privilege policies, and Cloud Monitoring for auditability and observability.`
      ),
      this.createSubHeading("3.2 Customer Tenant & Billing Mandate"),
      this.createCallout(
        "Google Cloud Customer Tenant & Billing Clause (Mandatory)",
        PSF_SPEC.clauses.customerTenantBilling,
        false
      )
    );

    // --- SECTION 4: ACTIVITIES & DELIVERABLES ---
    const deliverablesTable = [
      ["Phase / Milestone", "Work Activities & Scope", "Concrete Deliverables", "Acceptance Criteria"],
      [
        "Phase 1: Discovery & Architecture",
        "Architecture workshops, gap analysis, landing zone design, security controls alignment.",
        "Architecture Design Document (ADD), Network/IAM Specification, Sprint Plan.",
        "Formal Customer sign-off on ADD and environment prerequisites.",
      ],
      [
        "Phase 2: Build & Configuration",
        "Terraform IaC deployment, VPC configuration, IAM roles, service provisioning in Dev & UAT.",
        "Validated Dev/UAT environments, Terraform repositories, Build verification report.",
        "Successful deployment smoke tests; Customer verification of Dev & UAT environments.",
      ],
      [
        "Phase 3: Migration & Deployment",
        "Workload data migration, production environment cutover, validation testing, smoke test.",
        "Live Production environment on Google Cloud, Migration Execution Log, Cutover report.",
        "Production workload operational; Zero P1/P2 issues post-cutover; Sign-off achieved.",
      ],
      [
        "Phase 4: Knowledge Transfer & Handover",
        "Operational documentation, admin runbooks, team training session, monitoring handover.",
        "As-Built Documentation, Operations Runbook, Recorded KT Session.",
        "Customer acknowledgment of KT completion and handover documentation receipt.",
      ],
    ];

    docChildren.push(
      this.createSectionHeading("4. Scope of Activities & Deliverables"),
      this.createParagraph(
        "All activities are linked to concrete, measurable deliverables. Each milestone requires formal Customer sign-off. Services are deliverable-based and not subject to arbitrary hourly or capacity caps."
      ),
      this.createTable(deliverablesTable[0], deliverablesTable.slice(1), [1800, 2600, 2400, 2200]),
      this.createSubHeading("4.1 Environments In-Scope"),
      this.createParagraph(
        "The engagement encompasses the following three distinct Google Cloud environments within Customer Tenant:"
      ),
      this.createBullet("Development (Dev): Sandbox and iterative feature build environment."),
      this.createBullet("User Acceptance Testing (UAT) / Staging: Mirror of production for pre-release validation."),
      this.createBullet("Production (Prod): High-availability, secured live operational environment.")
    );

    // --- SECTION 5: PROJECT SCHEDULE & MILESTONES ---
    const timelineTable = [
      ["Phase", "Estimated Duration", "Target Start Window", "Target Completion Window"],
      ["Phase 1: Discovery & Architecture", "2 Weeks", "T+0 (Post Google PSF Approval)", "T+2 Weeks"],
      ["Phase 2: Build & Configuration", "3 Weeks", "T+2 Weeks", "T+5 Weeks"],
      ["Phase 3: Migration & Production Cutover", "3 Weeks", "T+5 Weeks", "T+8 Weeks"],
      ["Phase 4: Handover & Consumption Review", "2 Weeks", "T+8 Weeks", "T+10 Weeks"],
    ];

    docChildren.push(
      this.createSectionHeading("5. Project Timeline & Milestones"),
      this.createParagraph(
        `All estimated start dates and milestones are projected in the future and will commence following formal Google Cloud Partner Services Funds approval.`
      ),
      this.createTable(timelineTable[0], timelineTable.slice(1), [2600, 1800, 2300, 2300]),
      this.createCallout("Project Term Provision", PSF_SPEC.clauses.termCondition)
    );

    // --- SECTION 6: ROLES, RACI & GOVERNANCE ---
    const raciTable = [
      ["Project Activity", "Customer", "Atlas Geek (Partner)", "Google Cloud"],
      ["SOW Execution & PSF Fund Request", "Approve (A)", "Responsible (R)", "Grant Approval (Funder)"],
      ["Cloud Tenant Provisioning & Access Grants", "Responsible (R)", "Consulted (C)", "None"],
      ["Architecture Design & IaC Development", "Consulted (C)", "Accountable/Responsible (A/R)", "None"],
      ["Dev / UAT / Prod Environment Build", "Informed (I)", "Responsible (R)", "None"],
      ["Workload Migration & Acceptance Testing", "Accountable (A)", "Responsible (R)", "None"],
      ["Deliverables Formal Sign-Off", "Accountable (A)", "Supportive (S)", "None"],
      ["Ongoing Infrastructure Consumption Billing", "Accountable (A)", "Informed (I)", "Direct Billing"],
    ];

    docChildren.push(
      this.createSectionHeading("6. Roles, Responsibilities & Governance"),
      this.createParagraph(
        "Project delivery operates under a structured RACI governance framework (Responsible, Accountable, Consulted, Informed). Per Google PSF guidelines, Google Cloud does not perform project delivery tasks and holds no delivery responsibilities in this SOW."
      ),
      this.createTable(raciTable[0], raciTable.slice(1), [3200, 1800, 2500, 1500]),
      this.createSubHeading("6.1 Partner Credentials & Certifications"),
      this.createParagraph(
        `Atlas Geek will assign certified engineering resources to this engagement in compliance with Google Cloud Partner deployment criteria:`
      ),
      this.createBullet(`Lead Architect: ${this.certifiedArchitect}`),
      this.createBullet(`Partner Delivery Readiness Portal (DRP) ID: ${this.drpId} (Tier 1 Score: 50+)`),
      this.createBullet(`Certified Cloud Engineers for Terraform IaC and Workload Deployment`)
    );

    // --- SECTION 7: ASSUMPTIONS, DEPENDENCIES & RISKS ---
    docChildren.push(
      this.createSectionHeading("7. Assumptions, Dependencies & Risks"),
      this.createSubHeading("7.1 Client Prerequisites & Dependencies"),
      this.createBullet("Customer will provide timely access to Google Cloud organization, projects, IAM permissions, and source repositories within 5 business days of kickoff."),
      this.createBullet("Customer will assign a dedicated Product Owner / Technical Lead with authority to approve architectural decisions and milestone sign-offs within 3 business days."),
      this.createBullet("Customer retains responsibility for network connectivity, third-party vendor agreements, and data residency compliance."),
      this.createBullet("Partner will not introduce or utilize any third-party tools or SaaS solutions without explicit prior written consent from Customer."),
      this.createSubHeading("7.2 Risk Management & Mitigation"),
      this.createBullet("Scope Creep: Any changes to agreed deliverables shall be addressed via formal Change Request."),
      this.createBullet("Access Delays: Delay in granting required permissions extends the timeline on a day-for-day basis.")
    );

    // --- SECTION 8: SUCCESS CRITERIA & ACCEPTANCE ---
    docChildren.push(
      this.createSectionHeading("8. Success Criteria & Acceptance"),
      this.createParagraph(
        "The project will be deemed successfully completed when the following measurable criteria have been satisfied:"
      ),
      this.createBullet("1. All in-scope workloads and environments (Dev, UAT, Production) successfully deployed on Google Cloud."),
      this.createBullet("2. Production cutover executed with all core services passing smoke and health checks."),
      this.createBullet("3. Zero open P1 (critical outage) or P2 (severe degradation) defects attributable to the deployment."),
      this.createBullet("4. As-Built architecture documentation and knowledge transfer completed and formally signed off by Customer.")
    );

    // --- SECTION 9: COMMERCIAL TERMS & PRICING ---
    const pricingTable = [
      ["Payment Milestone", "Deliverables & Triggers", "Percentage", "Amount (USD)"],
      [
        "Milestone 1: Project Completion & Deliverables",
        "Completion and formal sign-off of all Phases (1 through 4) deliverables and acceptance criteria.",
        "70%",
        `$${feeMilestone1.toLocaleString()} USD`,
      ],
      [
        "Milestone 2: Consumption Break-Even",
        "Verification of target workload consumption in Customer Google Cloud Tenant.",
        "30%",
        `$${feeMilestone2.toLocaleString()} USD`,
      ],
      [
        "Total Professional Services Fee",
        "Fixed Price Commercial Model (Exclusive of applicable local taxes)",
        "100%",
        `$${totalFee.toLocaleString()} USD`,
      ],
    ];

    docChildren.push(
      this.createSectionHeading("9. Commercial Terms & Pricing"),
      this.createParagraph(
        `This engagement is executed on a Fixed Price commercial basis in United States Dollars (USD), funded via Google Cloud Partner Services Funds (PSF) Non-Commit / Flex program.`
      ),
      this.createTable(pricingTable[0], pricingTable.slice(1), [2600, 3400, 1400, 1600]),
      this.createSubHeading("9.1 PSF Funding Terms & Conditionality"),
      this.createCallout("PSF Funding Terms", PSF_SPEC.clauses.psfPaymentTermsNonCommit, false),
      this.createParagraph(
        "Location of Work: Services shall be delivered remotely, with virtual workshops and video-conferencing coordination."
      )
    );

    // --- SECTION 10: SIGNATURES & APPROVALS ---
    const signaturesTable = [
      ["Authorized Signature", "Atlas Geek (Partner)", `${clientName} (Customer)`],
      ["Signature", "", ""],
      ["Printed Name", "Authorized Signatory", "Authorized Signatory"],
      ["Title", "Director / Practice Lead", "VP / CTO / Engineering Director"],
      ["Date", "[Date post Google PSF Approval]", "[Date post Google PSF Approval]"],
    ];

    docChildren.push(
      this.createSectionHeading("10. Signatures & Approvals"),
      this.createParagraph(
        "By signing below, the parties agree to the terms, activities, deliverables, and conditions set forth in this Statement of Work. Both parties acknowledge that this SOW is to be formally executed only after Google Cloud PSF Fund Request approval has been received."
      ),
      this.createTable(signaturesTable[0], signaturesTable.slice(1), [2600, 3200, 3200]),
      new Paragraph({ children: [new PageBreak()] })
    );

    // --- APPENDIX A: GOOGLE CLOUD BUSINESS CASE (ROI) ---
    docChildren.push(
      this.createSectionHeading("Appendix A: Google Cloud Business Case & ROI Justification"),
      this.createParagraph(
        "Note: This Appendix is prepared for Google Cloud Partner Services Funds reviewers to demonstrate business justification and strategic consumption impact."
      ),
      this.createTable(
        ["Metric", "Value / Justification"],
        [
          ["Estimated First Year Google Cloud ARR", `$${(totalFee * 10).toLocaleString()} USD`],
          ["Projected 3-Year Google Cloud Lifetime Value (LTV)", `$${(totalFee * 25).toLocaleString()} USD`],
          ["Expected PSF Investment ROI Ratio", "10:1 Consumption ROI within 12 months"],
          ["Target Eligible Google Cloud Products", "Compute Engine, Google Kubernetes Engine (GKE), Cloud SQL, BigQuery, Vertex AI, Cloud Storage"],
          ["Strategic Business Impact", "Unlocks modernization, eliminates on-prem legacy debt, and establishes foundation for enterprise AI & analytics adoption."],
        ],
        [3200, 5800]
      )
    );

    // --- APPENDIX B: GOOGLE PSF SUBMISSION GUIDELINES ---
    const approversRows = Object.entries(PSF_SPEC.approvers).map(([region, email]) => [region, email]);
    docChildren.push(
      this.createSectionHeading("Appendix B: Google PSF Submission & Review Guidelines"),
      this.createParagraph(PSF_SPEC.clauses.googleReviewAccess),
      this.createSubHeading("Google Regional Approver Contacts:"),
      this.createTable(["Region / Segment", "Approver Email Address"], approversRows, [3500, 5500])
    );

    // --- HEADER AND FOOTER ---
    const docHeader = new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: `${BRAND.name} | Statement of Work — ${clientName}`,
              size: 16,
              color: BRAND.colors.muted,
              font: BRAND.fonts.primary,
            }),
          ],
        }),
      ],
    });

    const docFooter = new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `Confidential — ${BRAND.name} (${BRAND.website}) | Page `,
              size: 16,
              color: BRAND.colors.muted,
              font: BRAND.fonts.primary,
            }),
            new TextRun({
              children: ["PAGE_NUMBER"],
              size: 16,
              color: BRAND.colors.muted,
              font: BRAND.fonts.primary,
            }),
          ],
        }),
      ],
    });

    return new Document({
      sections: [
        {
          headers: { default: docHeader },
          footers: { default: docFooter },
          properties: {
            page: {
              margin: { top: 1200, bottom: 1200, left: 1400, right: 1400 },
            },
          },
          children: docChildren,
        },
      ],
    });
  }

  async saveToFile(doc, outputPath) {
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  }
}

module.exports = SowBuilder;
