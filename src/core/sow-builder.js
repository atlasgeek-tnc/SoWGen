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
const HYPERSCALER_SPECS = require("../templates/hyperscaler-specs");

class SowBuilder {
  constructor(options = {}) {
    this.provider = (options.provider || "google").toLowerCase();
    this.spec = HYPERSCALER_SPECS[this.provider] || HYPERSCALER_SPECS.google;

    this.client = options.client || "Client";
    this.project = options.project || `${this.spec.name} Modernization & Deployment`;
    this.engagementType = options.engagementType || this.spec.defaultEngagementType;
    this.date = options.date || new Date().toISOString().split("T")[0];
    this.version = options.version || "1.0";
    this.currency = "USD";
    this.totalFee = options.totalFee || 50000;
    this.partnerName = BRAND.name;
    this.partnerWebsite = BRAND.website;
    this.partnerEmail = BRAND.email;
    this.drpId = options.drpId || "AG-DRP-88492";
    this.certifiedArchitect = options.certifiedArchitect || this.spec.leadArchitect;
    this.contextNotes = options.contextNotes || "";
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
    const CALLOUT_WIDTH = 9000;

    return new Table({
      width: { size: CALLOUT_WIDTH, type: WidthType.DXA },
      columnWidths: [CALLOUT_WIDTH],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: CALLOUT_WIDTH, type: WidthType.DXA },
              borders: {
                left: { style: BorderStyle.SINGLE, size: 24, color: borderColor },
                top: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
              },
              shading: { fill: bgColor, type: ShadingType.CLEAR },
              margins: { top: 140, bottom: 140, left: 180, right: 180 },
              children: [
                new Paragraph({
                  spacing: { before: 0, after: 60 },
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
    const cellMargins = { top: 120, bottom: 120, left: 140, right: 140 };

    const TARGET_TABLE_WIDTH = 9400;

    let computedWidths = widths;
    if (!computedWidths || computedWidths.length !== headers.length) {
      const defaultColWidth = Math.floor(TARGET_TABLE_WIDTH / headers.length);
      computedWidths = headers.map(() => defaultColWidth);
    }

    const totalWidth = computedWidths.reduce((acc, w) => acc + w, 0);

    const headerCells = headers.map((h, i) => {
      return new TableCell({
        width: { size: computedWidths[i], type: WidthType.DXA },
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
        const colWidth = computedWidths[colIndex] || Math.floor(TARGET_TABLE_WIDTH / r.length);
        return new TableCell({
          width: { size: colWidth, type: WidthType.DXA },
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
      return new TableRow({ cantSplit: true, children: cells });
    });

    return new Table({
      width: { size: totalWidth, type: WidthType.DXA },
      columnWidths: computedWidths,
      rows: [
        new TableRow({ tableHeader: true, cantSplit: true, children: headerCells }),
        ...bodyRows,
      ],
    });
  }

  buildDocument(data = {}) {
    const provider = (data.provider || this.provider).toLowerCase();
    const spec = HYPERSCALER_SPECS[provider] || this.spec;

    const clientName = data.client || this.client;
    const projectName = data.project || `${spec.name} Modernization & Deployment`;
    const engagementType = data.engagementType || spec.defaultEngagementType;
    const totalFee = data.totalFee || this.totalFee;
    const notes = data.contextNotes || this.contextNotes || "";

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
      this.createSubtitle(`${spec.name} — ${engagementType} Engagement`),
      new Paragraph({ spacing: { before: 200, after: 100 }, children: [] }),
      this.createTable(
        ["Engagement Attribute", "Details"],
        [
          ["Customer Name", clientName],
          ["Partner Name", `${BRAND.name} (${BRAND.website})`],
          ["Project Title", projectName],
          ["Cloud Provider / Program", `${spec.name} (${spec.program})`],
          ["Engagement Scope", engagementType],
          ["Document Date", this.date],
          [
            "Target Effective Date",
            provider === "google"
              ? "At least 7 business days post-submission / Subject to Google PSF approval"
              : "Mutual execution of this Statement of Work",
          ],
          ["Governing Agreement", `Atlas Geek Master Services Agreement (MSA) or Customer Services Terms`],
          ["Document Version", this.version],
          ["Commercial Model", spec.commercialModel],
        ],
        [3200, 5800]
      ),
      new Paragraph({ spacing: { before: 200, after: 0 }, children: [] }),
      this.createCallout(
        `Commercial & Governance Framework (${spec.name})`,
        provider === "google"
          ? "This Statement of Work is executed between Atlas Geek and Customer. The execution and payment milestones defined herein are subject to formal PSF/DAF approval by Google Cloud. Customer and Partner shall formally sign this SOW only after the Fund Request has received formal Google Cloud approval."
          : `This Statement of Work is executed between Atlas Geek and ${clientName}, establishing fixed-scope deliverable milestones aligned with ${spec.name} architecture and deployment best practices.`,
        true
      ),
      new Paragraph({ children: [new PageBreak()] })
    );

    // --- SECTION 1: EXECUTIVE SUMMARY & BUSINESS DRIVERS ---
    let execSummaryText =
      data.executiveSummary ||
      `The primary objective of this engagement is to accelerate Customer's digital transformation and cloud modernization on ${spec.name}. Through structured architecture design, automated Infrastructure-as-Code provisioning, and robust workload migration, this project directly drives operational efficiency, high reliability, and measurable business outcomes while optimizing consumption within the Customer's designated cloud environment.`;

    if (notes && notes.trim()) {
      execSummaryText += ` Context & Discovery Directives: ${notes.trim()}`;
    }

    docChildren.push(
      this.createSectionHeading("1. Executive Summary & Business Drivers"),
      this.createParagraph(
        `This Statement of Work ("SOW") defines the professional technical services, deliverables, governance, and commercial framework for ${clientName} ("Customer") provided by ${BRAND.name} ("Partner"), designed to architect, implement, migrate, or modernize workloads on ${spec.name}.`
      ),
      this.createParagraph(execSummaryText),
      this.createSubHeading("1.1 Effective Date & Term"),
      this.createParagraph(
        provider === "google"
          ? `The Effective Date of this SOW shall be set at least seven (7) business days following Google Cloud Partner Services Funds submission and is strictly subject to Google Cloud formal approval. The Term of this SOW shall commence on the Effective Date and shall continue until all project milestones are completed and all deliverables have achieved formal Customer sign-off ("pending acceptance of all deliverables").`
          : `The Effective Date of this SOW shall be the date of mutual signature by both parties. The Term of this SOW shall commence on the Effective Date and shall continue until all project milestones are completed and all deliverables have achieved formal Customer sign-off ("pending acceptance of all deliverables").`
      ),
      this.createSubHeading("1.2 Governing Agreement"),
      this.createParagraph(
        `This SOW is governed by the Master Services Agreement ("MSA") executed between Partner and Customer. In the absence of a separate executed MSA, this SOW incorporates standard enterprise warranties, confidentiality terms, intellectual property ownership (wherein Customer owns all custom deliverables developed herein), and indemnification protections.`
      )
    );

    // --- SECTION 2: SCOPE BOUNDARIES (IN-SCOPE & OUT-OF-SCOPE) ---
    const inScopeItems = data.inScope || [
      `Discovery, technical requirements alignment, and sizing for target ${spec.name} workloads`,
      `End-state architecture design and landing zone deployment within Customer ${spec.name} account / tenant`,
      `Infrastructure-as-Code (Terraform) scripts for core platform services and networking`,
      `Implementation and configuration of in-scope ${spec.name} services across Dev, UAT, and Production environments`,
      `Workload migration execution, data cutover, and smoke testing validation`,
      `Operational handover, as-built architecture documentation, and recorded knowledge transfer session`,
    ];

    const outOfScopeItems = data.outOfScope || [
      `Any ongoing ${spec.name} infrastructure usage or consumption charges (billed directly to Customer)`,
      `Modification, refactoring, or bug remediation of out-of-scope legacy application codebases`,
      `End-user desktop application support outside the agreed handover window`,
      `Third-party software licensing, domain registrations, or external vendor fees`,
      `Ongoing 24/7 managed operations or SRE support (available under separate SLA agreement)`,
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
    const archFrameworkName =
      provider === "google"
        ? "Google Cloud Well-Architected Framework"
        : provider === "aws"
        ? "AWS Well-Architected Framework"
        : provider === "azure"
        ? "Microsoft Cloud Adoption Framework (CAF)"
        : "Enterprise Solution Architecture Best Practices";

    docChildren.push(
      this.createSectionHeading("3. Architecture & Technical Solution"),
      this.createParagraph(
        `The proposed solution is architected around ${archFrameworkName} principles, focusing on security, operational excellence, high reliability, performance efficiency, and cost optimization.`
      ),
      this.createSubHeading("3.1 End-State Architecture Diagram Overview"),
      this.createCallout(
        "Architecture Overview Diagram",
        `[Architecture Diagram: End-state topology on ${spec.name} illustrating Customer on-prem/hybrid integrations, Virtual Private Cloud networking, IAM security boundary, compute/container workloads, database storage, automated CI/CD pipeline, and Cloud Operations monitoring.]`
      ),
      this.createParagraph(
        data.architectureOverview ||
          `The architecture leverages native ${spec.name} services integrated into the Customer Tenant. Key components include secure Virtual Private Cloud (VPC/VNet) networking with private service connectivity, managed compute/container clusters, secure IAM role bindings with least-privilege policies, and Cloud Operations monitoring for auditability and observability.`
      ),
      this.createSubHeading(`3.2 ${spec.tenantClauseTitle}`),
      this.createCallout(
        spec.tenantClauseTitle,
        spec.tenantClause,
        false
      )
    );

    // --- SECTION 4: ACTIVITIES & DELIVERABLES ---
    const deliverablesTable = data.deliverablesTable || [
      ["Phase / Milestone", "Work Activities & Scope", "Concrete Deliverables", "Acceptance Criteria"],
      [
        "Phase 1: Discovery & Architecture",
        "Architecture workshops, gap analysis, landing zone design, security controls alignment.",
        "Architecture Design Document (ADD), Network/IAM Specification, Sprint Plan.",
        "Formal Customer sign-off on ADD and environment prerequisites.",
      ],
      [
        "Phase 2: Build & Configuration",
        `Terraform IaC deployment, VPC configuration, IAM roles, service provisioning on ${spec.name} in Dev & UAT.`,
        "Validated Dev/UAT environments, Terraform repositories, Build verification report.",
        "Successful deployment smoke tests; Customer verification of Dev & UAT environments.",
      ],
      [
        "Phase 3: Migration & Deployment",
        "Workload data migration, production environment cutover, validation testing, smoke test.",
        `Live Production environment on ${spec.name}, Migration Execution Log, Cutover report.`,
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
        `The engagement encompasses the following three distinct ${spec.name} environments within Customer Tenant:`
      ),
      this.createBullet("Development (Dev): Sandbox and iterative feature build environment."),
      this.createBullet("User Acceptance Testing (UAT) / Staging: Mirror of production for pre-release validation."),
      this.createBullet("Production (Prod): High-availability, secured live operational environment.")
    );

    // --- SECTION 5: PROJECT SCHEDULE & MILESTONES ---
    const timelineTable = data.timelineTable || [
      ["Phase", "Estimated Duration", "Target Start Window", "Target Completion Window"],
      [
        "Phase 1: Discovery & Architecture",
        "2 Weeks",
        provider === "google" ? "T+0 (Post Google PSF Approval)" : "T+0 (Project Kickoff)",
        "T+2 Weeks",
      ],
      ["Phase 2: Build & Configuration", "3 Weeks", "T+2 Weeks", "T+5 Weeks"],
      ["Phase 3: Migration & Production Cutover", "3 Weeks", "T+5 Weeks", "T+8 Weeks"],
      ["Phase 4: Handover & Operational Review", "2 Weeks", "T+8 Weeks", "T+10 Weeks"],
    ];

    docChildren.push(
      this.createSectionHeading("5. Project Timeline & Milestones"),
      this.createParagraph(
        provider === "google"
          ? "All estimated start dates and milestones are projected in the future and will commence following formal Google Cloud Partner Services Funds approval."
          : "All estimated start dates and milestones are projected to commence upon mutual execution of this Statement of Work."
      ),
      this.createTable(timelineTable[0], timelineTable.slice(1), [2600, 1800, 2300, 2300]),
      this.createCallout(
        "Project Term Provision",
        "The Term of this SOW shall commence on the Effective Date and shall continue until all project milestones are completed and all deliverables have achieved formal Customer sign-off ('pending acceptance of all deliverables')."
      )
    );

    // --- SECTION 6: ROLES, RACI & GOVERNANCE ---
    const hyperscalerLabel = spec.name;
    const raciTable = data.raciTable || [
      ["Project Activity", "Customer", "Atlas Geek (Partner)", hyperscalerLabel],
      [
        "SOW Execution & Program Approval",
        "Approve (A)",
        "Responsible (R)",
        provider === "google" ? "Grant Approval (Funder)" : "Platform Provider",
      ],
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
        `Project delivery operates under a structured RACI governance framework (Responsible, Accountable, Consulted, Informed). Per cloud partner governance guidelines, ${hyperscalerLabel} does not perform project delivery tasks and holds no delivery responsibilities in this SOW.`
      ),
      this.createTable(raciTable[0], raciTable.slice(1), [3200, 1800, 2500, 1500]),
      this.createSubHeading("6.1 Partner Credentials & Certifications"),
      this.createParagraph(
        `Atlas Geek will assign certified engineering resources to this engagement in compliance with ${spec.name} professional delivery criteria:`
      ),
      this.createBullet(`Lead Architect: ${this.certifiedArchitect}`),
      this.createBullet(`Partner Credential: ${spec.partnerCredential}`),
      this.createBullet(`Certified Cloud Engineers for Terraform IaC and Workload Deployment`)
    );

    // --- SECTION 7: ASSUMPTIONS, DEPENDENCIES & RISKS ---
    const prereqList = data.prerequisites || [
      `Customer will provide timely access to ${spec.name} accounts/organizations, projects/subscriptions, IAM permissions, and source repositories within 5 business days of kickoff.`,
      "Customer will assign a dedicated Product Owner / Technical Lead with authority to approve architectural decisions and milestone sign-offs within 3 business days.",
      "Customer retains responsibility for network connectivity, third-party vendor agreements, and data residency compliance.",
      "Partner will not introduce or utilize any third-party tools or SaaS solutions without explicit prior written consent from Customer.",
    ];

    docChildren.push(
      this.createSectionHeading("7. Assumptions, Dependencies & Risks"),
      this.createSubHeading("7.1 Client Prerequisites & Dependencies"),
      ...prereqList.map((p) => this.createBullet(p)),
      this.createSubHeading("7.2 Risk Management & Mitigation"),
      this.createBullet("Scope Creep: Any changes to agreed deliverables shall be addressed via formal Change Request."),
      this.createBullet("Access Delays: Delay in granting required permissions extends the timeline on a day-for-day basis.")
    );

    // --- SECTION 8: SUCCESS CRITERIA & ACCEPTANCE ---
    const successList = data.successCriteria || [
      `1. All in-scope workloads and environments (Dev, UAT, Production) successfully deployed on ${spec.name}.`,
      "2. Production cutover executed with all core services passing smoke and health checks.",
      "3. Zero open P1 (critical outage) or P2 (severe degradation) defects attributable to the deployment.",
      "4. As-Built architecture documentation and knowledge transfer completed and formally signed off by Customer.",
    ];

    docChildren.push(
      this.createSectionHeading("8. Success Criteria & Acceptance"),
      this.createParagraph(
        "The project will be deemed successfully completed when the following measurable criteria have been satisfied:"
      ),
      ...successList.map((s) => this.createBullet(s))
    );

    // --- SECTION 9: COMMERCIAL TERMS & PRICING ---
    const pricingRows = [];
    let cumulativeFee = 0;

    spec.milestoneSplit.forEach((m, idx) => {
      const isLast = idx === spec.milestoneSplit.length - 1;
      const amount = isLast ? totalFee - cumulativeFee : Math.round(totalFee * m.pct);
      cumulativeFee += amount;
      pricingRows.push([m.name, m.desc, `${Math.round(m.pct * 100)}%`, `$${amount.toLocaleString()} USD`]);
    });

    pricingRows.push([
      "Total Professional Services Fee",
      "Fixed Price Commercial Model (Exclusive of applicable local taxes)",
      "100%",
      `$${totalFee.toLocaleString()} USD`,
    ]);

    docChildren.push(
      this.createSectionHeading("9. Commercial Terms & Pricing"),
      this.createParagraph(
        `This engagement is executed on a Fixed Price commercial basis in United States Dollars (USD), aligned with ${spec.commercialModel}.`
      ),
      this.createTable(
        ["Payment Milestone", "Deliverables & Triggers", "Percentage", "Amount (USD)"],
        pricingRows,
        [2600, 3400, 1400, 1600]
      ),
      this.createSubHeading("9.1 Commercial Payment Terms & Conditionality"),
      this.createCallout(
        "Payment Terms Provision",
        provider === "google"
          ? "Payment milestones are strictly contingent upon Google Cloud PSF/DAF program rules. In the event that Google Cloud does not approve the Fund Request, Partner shall not obligate Customer to pay for the funded portions, provided Customer has complied with program eligibility requirements. Invoices are payable net thirty (30) days from milestone sign-off."
          : `Invoices shall be rendered upon completion and formal customer sign-off of each milestone deliverable. All invoices are payable net thirty (30) days from receipt. Location of Work: Services shall be delivered remotely, with virtual workshops and video-conferencing coordination.`,
        false
      )
    );

    // --- SECTION 10: SIGNATURES & APPROVALS ---
    const signaturesTable = [
      ["Authorized Signature", "Atlas Geek (Partner)", `${clientName} (Customer)`],
      ["Signature", "", ""],
      ["Printed Name", "Authorized Signatory", "Authorized Signatory"],
      ["Title", "Director / Practice Lead", "VP / CTO / Engineering Director"],
      [
        "Date",
        provider === "google" ? "[Date post Google PSF Approval]" : "[Date of Signature]",
        provider === "google" ? "[Date post Google PSF Approval]" : "[Date of Signature]",
      ],
    ];

    docChildren.push(
      this.createSectionHeading("10. Signatures & Approvals"),
      this.createParagraph(
        provider === "google"
          ? "By signing below, the parties agree to the terms, activities, deliverables, and conditions set forth in this Statement of Work. Both parties acknowledge that this SOW is to be formally executed only after Google Cloud PSF Fund Request approval has been received."
          : "By signing below, the authorized representatives of the parties agree to the terms, activities, deliverables, and conditions set forth in this Statement of Work."
      ),
      this.createTable(signaturesTable[0], signaturesTable.slice(1), [2600, 3200, 3200]),
      new Paragraph({ children: [new PageBreak()] })
    );

    // --- APPENDIX A: HYPERSCALER BUSINESS CASE ---
    if (provider === "google") {
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
        ),
        this.createSectionHeading("Appendix B: Google PSF Submission & Review Guidelines"),
        this.createParagraph(
          "This Statement of Work must be submitted by Atlas Geek via the Google Cloud Partner Advantage Portal. Atlas Geek will share the document directly with the designated regional Google Partner Services Funds approver team."
        ),
        this.createSubHeading("Google Regional Approver Contacts:"),
        this.createTable(
          ["Region / Segment", "Approver Email Address"],
          Object.entries(spec.approverRouting || {}).map(([r, e]) => [r, e]),
          [3500, 5500]
        )
      );
    } else if (provider === "aws") {
      docChildren.push(
        this.createSectionHeading("Appendix A: AWS Migration Business Case & MAP 2.0 Justification"),
        this.createParagraph(
          "Note: This Appendix aligns with AWS Migration Acceleration Program (MAP 2.0) and APN Partner funding guidelines."
        ),
        this.createTable(
          ["Metric", "Value / Justification"],
          [
            ["Estimated Annual AWS Cloud Consumption", `$${(totalFee * 8).toLocaleString()} USD`],
            ["Target Eligible AWS Services", "Amazon EKS, Amazon EC2, Amazon Aurora PostgreSQL, AWS Lambda, Amazon S3, Amazon OpenSearch"],
            ["Modernization Methodology", "AWS Well-Architected Framework 6 Pillars; Infrastructure as Code via Terraform."],
            ["Proof of Execution (POE)", "Landing Zone sign-off, migration execution logs, and Well-Architected Review report."],
          ],
          [3200, 5800]
        )
      );
    } else if (provider === "azure") {
      docChildren.push(
        this.createSectionHeading("Appendix A: Microsoft Azure AMMP Business Case & CAF Assessment"),
        this.createParagraph(
          "Note: This Appendix aligns with Microsoft Azure Migration and Modernization Program (AMMP) and Cloud Adoption Framework (CAF) guidelines."
        ),
        this.createTable(
          ["Metric", "Value / Justification"],
          [
            ["Estimated Annual Azure Cloud Consumption", `$${(totalFee * 8).toLocaleString()} USD`],
            ["Target Eligible Azure Services", "Azure Kubernetes Service (AKS), Azure SQL Database, Azure Virtual Networks, Azure Monitor, Blob Storage"],
            ["Governance Framework", "Azure Landing Zones, Enterprise Scale Architecture, Microsoft Entra ID integration."],
            ["Proof of Execution (POE)", "Deployment verification logs, CAF landing zone sign-off, and customer acceptance."],
          ],
          [3200, 5800]
        )
      );
    } else {
      docChildren.push(
        this.createSectionHeading("Appendix A: Solution Architecture Quality Assurance & Delivery Gates"),
        this.createTable(
          ["Delivery Gate", "Review Criteria & Deliverable Output"],
          [
            ["Gate 1: Architecture Alignment", "ADD reviewed, network topology and security boundaries signed off."],
            ["Gate 2: Environment Readiness", "Dev & UAT infrastructure provisioned via IaC; automated smoke tests passed."],
            ["Gate 3: Cutover Verification", "Production cutover executed with zero P1/P2 operational defects."],
            ["Gate 4: Project Sign-Off", "Runbooks delivered, KT recorded, and formal completion certificate signed."],
          ],
          [3200, 5800]
        )
      );
    }

    // --- HEADER AND FOOTER ---
    const docHeader = new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: `${BRAND.name} | Statement of Work — ${clientName} (${spec.name})`,
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
