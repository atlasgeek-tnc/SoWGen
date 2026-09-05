const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const BRAND = require("../templates/brand-theme");

class SlideDesigner {
  constructor(options = {}) {
    this.client = options.client || "Client";
    this.project = options.project || "Google Cloud Engagement";
    this.engagementType = options.engagementType || "Implementation";
    this.date = options.date || new Date().toISOString().split("T")[0];
    this.totalFee = options.totalFee || 50000;
  }

  createPresentation(data = {}) {
    const pptx = new pptxgen();
    pptx.layout = "LAYOUT_16x9";
    pptx.title = `SOW Presentation — ${this.client} | ${BRAND.name}`;
    pptx.company = BRAND.name;

    const clientName = data.client || this.client;
    const projectName = data.project || this.project;
    const engagementType = data.engagementType || this.engagementType;
    const totalFee = data.totalFee || this.totalFee;
    const feeMilestone1 = Math.round(totalFee * 0.7);
    const feeMilestone2 = totalFee - feeMilestone1;

    // --- Helper Styles ---
    const addHeaderBanner = (slide, title, category = "STATEMENT OF WORK OVERVIEW") => {
      // Top bar
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 13.33,
        h: 1.1,
        fill: { color: BRAND.pptxColors.primary },
      });

      // Category / Breadcrumb
      slide.addText(category.toUpperCase(), {
        x: 0.8,
        y: 0.18,
        w: 9,
        h: 0.25,
        fontSize: 10,
        bold: true,
        color: BRAND.pptxColors.accent,
        fontFace: BRAND.fonts.primary,
      });

      // Title
      slide.addText(title, {
        x: 0.8,
        y: 0.45,
        w: 9,
        h: 0.45,
        fontSize: 20,
        bold: true,
        color: BRAND.pptxColors.white,
        fontFace: BRAND.fonts.primary,
      });

      // Logo or Brand text top right
      if (fs.existsSync(BRAND.logoPath)) {
        slide.addImage({
          path: BRAND.logoPath,
          x: 10.8,
          y: 0.15,
          w: 1.8,
          h: 0.8,
        });
      } else {
        slide.addText(BRAND.name, {
          x: 10.5,
          y: 0.35,
          w: 2.2,
          h: 0.4,
          fontSize: 14,
          bold: true,
          color: BRAND.pptxColors.white,
          align: "right",
        });
      }

      // Footer line
      slide.addShape(pptx.ShapeType.line, {
        x: 0.8,
        y: 7.0,
        w: 11.73,
        h: 0,
        line: { color: BRAND.pptxColors.border, width: 1 },
      });

      slide.addText(`${BRAND.name} | ${BRAND.website} | Confidential`, {
        x: 0.8,
        y: 7.05,
        w: 8,
        h: 0.3,
        fontSize: 9,
        color: BRAND.pptxColors.muted,
      });

      slide.addText(clientName, {
        x: 9.5,
        y: 7.05,
        w: 3,
        h: 0.3,
        fontSize: 9,
        color: BRAND.pptxColors.muted,
        align: "right",
      });
    };

    // ==========================================
    // SLIDE 1: TITLE SLIDE
    // ==========================================
    const slide1 = pptx.addSlide();
    slide1.background = { color: BRAND.pptxColors.lightBg };

    // Accent side bar
    slide1.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 0.4,
      h: 7.5,
      fill: { color: BRAND.pptxColors.accent },
    });

    // Logo
    if (fs.existsSync(BRAND.logoPath)) {
      slide1.addImage({
        path: BRAND.logoPath,
        x: 1.0,
        y: 1.0,
        w: 3.2,
        h: 1.6,
      });
    }

    // Engagement badge
    slide1.addShape(pptx.ShapeType.roundRect, {
      x: 1.0,
      y: 2.9,
      w: 4.8,
      h: 0.45,
      fill: { color: BRAND.pptxColors.primaryLight },
      line: { color: BRAND.pptxColors.primary, width: 1 },
      rectRadius: 0.1,
    });
    slide1.addText(`Google Cloud PSF / DAF: ${engagementType}`.toUpperCase(), {
      x: 1.1,
      y: 2.95,
      w: 4.6,
      h: 0.35,
      fontSize: 11,
      bold: true,
      color: BRAND.pptxColors.primary,
      fontFace: BRAND.fonts.primary,
    });

    // Title & Project
    slide1.addText(`Statement of Work`, {
      x: 1.0,
      y: 3.5,
      w: 11,
      h: 0.8,
      fontSize: 36,
      bold: true,
      color: BRAND.pptxColors.dark,
      fontFace: BRAND.fonts.primary,
    });

    slide1.addText(`${projectName} for ${clientName}`, {
      x: 1.0,
      y: 4.35,
      w: 11,
      h: 0.6,
      fontSize: 22,
      color: BRAND.pptxColors.primary,
      fontFace: BRAND.fonts.primary,
    });

    // Subtitle / Info Card
    slide1.addShape(pptx.ShapeType.rect, {
      x: 1.0,
      y: 5.3,
      w: 11.3,
      h: 1.4,
      fill: { color: BRAND.pptxColors.white },
      line: { color: BRAND.pptxColors.border, width: 1 },
    });

    slide1.addText(
      [
        { text: "Prepared By: ", options: { bold: true, color: BRAND.pptxColors.dark } },
        { text: `${BRAND.name} (Delivery Team)\n`, options: { color: BRAND.pptxColors.body } },
        { text: "Website / Inquiries: ", options: { bold: true, color: BRAND.pptxColors.dark } },
        { text: `${BRAND.website} | ${BRAND.email}\n`, options: { color: BRAND.pptxColors.primary } },
        { text: "Target Effective Date: ", options: { bold: true, color: BRAND.pptxColors.dark } },
        { text: `Subject to Google Cloud PSF Fund Approval | Date: ${this.date}`, options: { color: BRAND.pptxColors.muted } },
      ],
      {
        x: 1.3,
        y: 5.45,
        w: 10.7,
        h: 1.1,
        fontSize: 12,
        fontFace: BRAND.fonts.primary,
      }
    );

    // ==========================================
    // SLIDE 2: EXECUTIVE SUMMARY & OBJECTIVES
    // ==========================================
    const slide2 = pptx.addSlide();
    slide2.background = { color: BRAND.pptxColors.lightBg };
    addHeaderBanner(slide2, "Executive Summary & Business Value");

    // Left card: Business Objectives
    slide2.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.5,
      w: 5.6,
      h: 5.1,
      fill: { color: BRAND.pptxColors.white },
      line: { color: BRAND.pptxColors.border, width: 1 },
      rectRadius: 0.1,
    });

    slide2.addText("Core Business Drivers & Context", {
      x: 1.1,
      y: 1.8,
      w: 5.0,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: BRAND.pptxColors.primary,
    });

    slide2.addText(
      `• Accelerated Modernization: Transition workloads to Google Cloud to increase developer velocity and operational agility.\n\n` +
        `• Direct Customer Tenant: Workloads deployed directly into Customer's own GCP organization with full customer governance.\n\n` +
        `• Infrastructure as Code: Terraform-driven repeatable deployments across Dev, UAT, and Production.\n\n` +
        `• Enterprise Security: Implement zero-trust IAM and VPC network perimeter controls per Google Well-Architected Framework.`,
      {
        x: 1.1,
        y: 2.3,
        w: 5.0,
        h: 4.0,
        fontSize: 13,
        color: BRAND.pptxColors.body,
        lineSpacing: 22,
      }
    );

    // Right side: 3 Metric Cards
    const metrics = [
      { label: "Target 12-Mo Google ARR", value: `$${(totalFee * 10).toLocaleString()} USD`, desc: "Expected cloud consumption impact" },
      { label: "PSF Program ROI", value: "10:1 Ratio", desc: "Aligned with Google PSF benchmarks" },
      { label: "Delivery Model", value: "Fixed Price", desc: "Measurable deliverables without hourly caps" },
    ];

    metrics.forEach((m, idx) => {
      const yPos = 1.5 + idx * 1.75;
      slide2.addShape(pptx.ShapeType.roundRect, {
        x: 6.8,
        y: yPos,
        w: 5.7,
        h: 1.55,
        fill: { color: BRAND.pptxColors.white },
        line: { color: BRAND.pptxColors.border, width: 1 },
        rectRadius: 0.1,
      });

      slide2.addShape(pptx.ShapeType.rect, {
        x: 6.8,
        y: yPos,
        w: 0.15,
        h: 1.55,
        fill: { color: idx === 1 ? BRAND.pptxColors.accent : BRAND.pptxColors.primary },
      });

      slide2.addText(m.label.toUpperCase(), {
        x: 7.2,
        y: yPos + 0.18,
        w: 5.0,
        h: 0.3,
        fontSize: 11,
        bold: true,
        color: BRAND.pptxColors.muted,
      });

      slide2.addText(m.value, {
        x: 7.2,
        y: yPos + 0.45,
        w: 5.0,
        h: 0.5,
        fontSize: 22,
        bold: true,
        color: BRAND.pptxColors.dark,
      });

      slide2.addText(m.desc, {
        x: 7.2,
        y: yPos + 0.95,
        w: 5.0,
        h: 0.35,
        fontSize: 11,
        color: BRAND.pptxColors.body,
      });
    });

    // ==========================================
    // SLIDE 3: SOLUTION ARCHITECTURE PILLARS
    // ==========================================
    const slide3 = pptx.addSlide();
    slide3.background = { color: BRAND.pptxColors.lightBg };
    addHeaderBanner(slide3, "Google Cloud Solution Architecture & Pillars");

    const pillars = [
      {
        title: "Compute & Workloads",
        icon: "GKE / Compute Engine",
        color: BRAND.pptxColors.primary,
        bullets: [
          "Google Kubernetes Engine (GKE) or Compute Engine",
          "Automated autoscaling and high availability",
          "Multi-environment deployment: Dev, UAT, Prod",
          "Containerized CI/CD deployment pipelines",
        ],
      },
      {
        title: "Data & Storage",
        icon: "Cloud SQL / BigQuery",
        color: BRAND.pptxColors.accent,
        bullets: [
          "Cloud SQL / AlloyDB managed relational databases",
          "Cloud Storage buckets for artifacts & datasets",
          "Automated snapshots, backup policies, and DR",
          "Encryption in-transit and at-rest by default",
        ],
      },
      {
        title: "Security & Governance",
        icon: "IAM / VPC / Cloud Ops",
        color: BRAND.pptxColors.dark,
        bullets: [
          "Custom VPC networking with private connectivity",
          "Least-privilege IAM service accounts & role bindings",
          "Cloud Logging, Cloud Monitoring, and Alerting",
          "Customer Tenant ownership & direct Google billing",
        ],
      },
    ];

    pillars.forEach((p, idx) => {
      const xPos = 0.8 + idx * 4.0;
      slide3.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.6,
        w: 3.75,
        h: 5.0,
        fill: { color: BRAND.pptxColors.white },
        line: { color: BRAND.pptxColors.border, width: 1 },
        rectRadius: 0.1,
      });

      // Top color strip
      slide3.addShape(pptx.ShapeType.rect, {
        x: xPos,
        y: 1.6,
        w: 3.75,
        h: 0.55,
        fill: { color: p.color },
      });

      slide3.addText(p.title, {
        x: xPos + 0.2,
        y: 1.7,
        w: 3.35,
        h: 0.35,
        fontSize: 14,
        bold: true,
        color: BRAND.pptxColors.white,
      });

      slide3.addText(p.icon, {
        x: xPos + 0.3,
        y: 2.3,
        w: 3.15,
        h: 0.35,
        fontSize: 12,
        bold: true,
        color: BRAND.pptxColors.muted,
      });

      const bulletText = p.bullets.map((b) => `• ${b}`).join("\n\n");
      slide3.addText(bulletText, {
        x: xPos + 0.3,
        y: 2.8,
        w: 3.15,
        h: 3.5,
        fontSize: 11,
        color: BRAND.pptxColors.body,
        lineSpacing: 18,
      });
    });

    // ==========================================
    // SLIDE 4: SCOPE BOUNDARIES (IN VS OUT)
    // ==========================================
    const slide4 = pptx.addSlide();
    slide4.background = { color: BRAND.pptxColors.lightBg };
    addHeaderBanner(slide4, "Project Scope Boundaries (In-Scope vs. Out-of-Scope)");

    // In-Scope Card (Left)
    slide4.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.5,
      w: 5.7,
      h: 5.1,
      fill: { color: BRAND.pptxColors.white },
      line: { color: BRAND.pptxColors.success, width: 1.5 },
      rectRadius: 0.1,
    });

    slide4.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.5,
      w: 5.7,
      h: 0.55,
      fill: { color: BRAND.pptxColors.success },
    });

    slide4.addText("IN-SCOPE ACTIVITIES & DELIVERABLES", {
      x: 1.1,
      y: 1.62,
      w: 5.1,
      h: 0.35,
      fontSize: 13,
      bold: true,
      color: BRAND.pptxColors.white,
    });

    const inScopeList = (data.inScope || [
      "Architecture workshops and target state design document (ADD)",
      "Terraform IaC deployment for core GCP foundational services",
      "VPC networking, subnetting, and private service connectivity",
      "Configuration of Dev, UAT, and Production environments",
      "Workload data migration and cutover execution",
      "Operations runbook and recorded knowledge transfer session",
    ])
      .map((item) => `✔  ${item}`)
      .join("\n\n");

    slide4.addText(inScopeList, {
      x: 1.1,
      y: 2.2,
      w: 5.1,
      h: 4.1,
      fontSize: 11.5,
      color: BRAND.pptxColors.body,
      lineSpacing: 18,
    });

    // Out-of-Scope Card (Right)
    slide4.addShape(pptx.ShapeType.roundRect, {
      x: 6.8,
      y: 1.5,
      w: 5.7,
      h: 5.1,
      fill: { color: BRAND.pptxColors.white },
      line: { color: BRAND.pptxColors.danger, width: 1.5 },
      rectRadius: 0.1,
    });

    slide4.addShape(pptx.ShapeType.rect, {
      x: 6.8,
      y: 1.5,
      w: 5.7,
      h: 0.55,
      fill: { color: BRAND.pptxColors.danger },
    });

    slide4.addText("EXPLICIT OUT-OF-SCOPE BOUNDARIES", {
      x: 7.1,
      y: 1.62,
      w: 5.1,
      h: 0.35,
      fontSize: 13,
      bold: true,
      color: BRAND.pptxColors.white,
    });

    const outScopeList = (data.outOfScope || [
      "Google Cloud infrastructure consumption fees (billed to Customer)",
      "Remediation or refactoring of legacy monolithic codebases",
      "Third-party software licensing, SaaS subscriptions, or domain fees",
      "Ongoing 24/7 managed cloud operations post-handover",
      "End-user application testing outside standard smoke test validation",
    ])
      .map((item) => `✖  ${item}`)
      .join("\n\n");

    slide4.addText(outScopeList, {
      x: 7.1,
      y: 2.2,
      w: 5.1,
      h: 4.1,
      fontSize: 11.5,
      color: BRAND.pptxColors.body,
      lineSpacing: 18,
    });

    // ==========================================
    // SLIDE 5: DELIVERY ROADMAP & TIMELINE
    // ==========================================
    const slide5 = pptx.addSlide();
    slide5.background = { color: BRAND.pptxColors.lightBg };
    addHeaderBanner(slide5, "Phased Delivery Roadmap & Timeline");

    const phases = [
      {
        phase: "Phase 1",
        name: "Discovery & ADD",
        duration: "2 Weeks",
        deliverables: ["Workshops", "ADD Document", "IAM / VPC Spec"],
        color: BRAND.pptxColors.primary,
      },
      {
        phase: "Phase 2",
        name: "Build & Config",
        duration: "3 Weeks",
        deliverables: ["Terraform Repos", "Dev / UAT Build", "Validation Tests"],
        color: BRAND.pptxColors.primaryDark,
      },
      {
        phase: "Phase 3",
        name: "Migration & Cutover",
        duration: "3 Weeks",
        deliverables: ["Production Deploy", "Data Migration", "Go-Live Signoff"],
        color: BRAND.pptxColors.accent,
      },
      {
        phase: "Phase 4",
        name: "Handover & Review",
        duration: "2 Weeks",
        deliverables: ["Runbooks", "Recorded KT", "Consumption Review"],
        color: BRAND.pptxColors.success,
      },
    ];

    phases.forEach((ph, idx) => {
      const xPos = 0.8 + idx * 3.0;

      // Card
      slide5.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.6,
        w: 2.75,
        h: 4.6,
        fill: { color: BRAND.pptxColors.white },
        line: { color: BRAND.pptxColors.border, width: 1 },
        rectRadius: 0.1,
      });

      // Top Header
      slide5.addShape(pptx.ShapeType.rect, {
        x: xPos,
        y: 1.6,
        w: 2.75,
        h: 0.8,
        fill: { color: ph.color },
      });

      slide5.addText(ph.phase.toUpperCase(), {
        x: xPos + 0.15,
        y: 1.7,
        w: 2.45,
        h: 0.25,
        fontSize: 10,
        bold: true,
        color: BRAND.pptxColors.white,
      });

      slide5.addText(ph.name, {
        x: xPos + 0.15,
        y: 1.95,
        w: 2.45,
        h: 0.35,
        fontSize: 13,
        bold: true,
        color: BRAND.pptxColors.white,
      });

      // Duration Badge
      slide5.addShape(pptx.ShapeType.roundRect, {
        x: xPos + 0.3,
        y: 2.6,
        w: 2.15,
        h: 0.4,
        fill: { color: BRAND.pptxColors.lightBg },
        line: { color: BRAND.pptxColors.border, width: 1 },
        rectRadius: 0.08,
      });

      slide5.addText(`Estimated: ${ph.duration}`, {
        x: xPos + 0.3,
        y: 2.65,
        w: 2.15,
        h: 0.3,
        fontSize: 11,
        bold: true,
        color: BRAND.pptxColors.dark,
        align: "center",
      });

      // Deliverables list
      slide5.addText("Key Deliverables:", {
        x: xPos + 0.2,
        y: 3.2,
        w: 2.35,
        h: 0.3,
        fontSize: 11,
        bold: true,
        color: BRAND.pptxColors.muted,
      });

      const delList = ph.deliverables.map((d) => `• ${d}`).join("\n\n");
      slide5.addText(delList, {
        x: xPos + 0.2,
        y: 3.55,
        w: 2.35,
        h: 2.4,
        fontSize: 11,
        color: BRAND.pptxColors.body,
        lineSpacing: 16,
      });
    });

    slide5.addText(
      "*Note: Start dates are contingent upon formal Google Cloud PSF Fund Request approval and follow a T+0 kickoff schedule.",
      {
        x: 0.8,
        y: 6.4,
        w: 11.7,
        h: 0.4,
        fontSize: 10,
        italics: true,
        color: BRAND.pptxColors.muted,
      }
    );

    // ==========================================
    // SLIDE 6: TEAM GOVERNANCE & RACI
    // ==========================================
    const slide6 = pptx.addSlide();
    slide6.background = { color: BRAND.pptxColors.lightBg };
    addHeaderBanner(slide6, "Team Governance, RACI & Certifications");

    // Partner credentials card
    slide6.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.5,
      w: 11.73,
      h: 1.1,
      fill: { color: BRAND.pptxColors.white },
      line: { color: BRAND.pptxColors.primary, width: 1.5 },
      rectRadius: 0.1,
    });

    slide6.addText(
      [
        { text: "ATLAS GEEK CERTIFIED DELIVERY CREDENTIALS:  ", options: { bold: true, color: BRAND.pptxColors.primary } },
        { text: "Lead Architect: Google Cloud Certified Professional Cloud Architect | ", options: { color: BRAND.pptxColors.dark } },
        { text: "Partner DRP ID: AG-DRP-88492 (Tier 1 Score: 50+) | ", options: { color: BRAND.pptxColors.accent, bold: true } },
        { text: "Role: Primary Delivery Partner", options: { color: BRAND.pptxColors.muted } },
      ],
      {
        x: 1.1,
        y: 1.7,
        w: 11.1,
        h: 0.7,
        fontSize: 12,
        fontFace: BRAND.fonts.primary,
      }
    );

    // RACI Table
    const raciRows = [
      [
        { text: "Project Activity / Area", options: { bold: true, color: BRAND.pptxColors.white, fill: BRAND.pptxColors.primary } },
        { text: "Customer", options: { bold: true, color: BRAND.pptxColors.white, fill: BRAND.pptxColors.primary, align: "center" } },
        { text: "Atlas Geek (Partner)", options: { bold: true, color: BRAND.pptxColors.white, fill: BRAND.pptxColors.primary, align: "center" } },
        { text: "Google Cloud", options: { bold: true, color: BRAND.pptxColors.white, fill: BRAND.pptxColors.primary, align: "center" } },
      ],
      ["SOW Execution & PSF Fund Request", "Approve (A)", "Responsible (R)", "Funder / Approver"],
      ["GCP Customer Tenant Access Grants", "Responsible (R)", "Consulted (C)", "None"],
      ["Architecture & Terraform IaC Build", "Consulted (C)", "Accountable/Responsible (A/R)", "None"],
      ["Workload Migration & Acceptance Testing", "Accountable (A)", "Responsible (R)", "None"],
      ["Final Milestone & POE Sign-Off", "Accountable (A)", "Responsible (R)", "None"],
    ];

    slide6.addTable(raciRows, {
      x: 0.8,
      y: 2.8,
      w: 11.73,
      h: 3.8,
      colW: [4.5, 2.4, 2.6, 2.23],
      fontSize: 11,
      fontFace: BRAND.fonts.primary,
      border: { color: BRAND.pptxColors.border, pt: 1 },
      fill: BRAND.pptxColors.white,
      align: "left",
      valign: "middle",
    });

    // ==========================================
    // SLIDE 7: COMMERCIALS & PSF FUNDING (70/30)
    // ==========================================
    const slide7 = pptx.addSlide();
    slide7.background = { color: BRAND.pptxColors.lightBg };
    addHeaderBanner(slide7, "Commercial Terms & Google PSF Milestone Structure");

    // Left card: Milestone 1 (70%)
    slide7.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.5,
      w: 5.6,
      h: 4.2,
      fill: { color: BRAND.pptxColors.white },
      line: { color: BRAND.pptxColors.primary, width: 1.5 },
      rectRadius: 0.1,
    });

    slide7.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.5,
      w: 5.6,
      h: 0.6,
      fill: { color: BRAND.pptxColors.primary },
    });

    slide7.addText("MILESTONE 1: PROJECT COMPLETION (70%)", {
      x: 1.0,
      y: 1.65,
      w: 5.2,
      h: 0.35,
      fontSize: 13,
      bold: true,
      color: BRAND.pptxColors.white,
    });

    slide7.addText(`$${feeMilestone1.toLocaleString()} USD`, {
      x: 1.0,
      y: 2.3,
      w: 5.2,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: BRAND.pptxColors.primary,
    });

    slide7.addText(
      `• Trigger: Completion and formal Customer sign-off on all Phase 1-4 deliverables.\n\n` +
        `• Verification: Build reports, verified Dev/UAT/Prod environments, and recorded KT.\n\n` +
        `• PSF Guideline: Non-Commit Milestone 1 payable upon Proof of Execution (POE).`,
      {
        x: 1.0,
        y: 3.1,
        w: 5.2,
        h: 2.3,
        fontSize: 12,
        color: BRAND.pptxColors.body,
        lineSpacing: 20,
      }
    );

    // Right card: Milestone 2 (30%)
    slide7.addShape(pptx.ShapeType.roundRect, {
      x: 6.8,
      y: 1.5,
      w: 5.7,
      h: 4.2,
      fill: { color: BRAND.pptxColors.white },
      line: { color: BRAND.pptxColors.accent, width: 1.5 },
      rectRadius: 0.1,
    });

    slide7.addShape(pptx.ShapeType.rect, {
      x: 6.8,
      y: 1.5,
      w: 5.7,
      h: 0.6,
      fill: { color: BRAND.pptxColors.accent },
    });

    slide7.addText("MILESTONE 2: CONSUMPTION BREAK-EVEN (30%)", {
      x: 7.0,
      y: 1.65,
      w: 5.3,
      h: 0.35,
      fontSize: 13,
      bold: true,
      color: BRAND.pptxColors.white,
    });

    slide7.addText(`$${feeMilestone2.toLocaleString()} USD`, {
      x: 7.0,
      y: 2.3,
      w: 5.3,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: BRAND.pptxColors.accent,
    });

    slide7.addText(
      `• Trigger: Verification of target workload run-rate within Customer GCP Tenant.\n\n` +
        `• Verification: Consumption verification via Google Cloud billing metrics.\n\n` +
        `• PSF Guideline: Non-Commit Milestone 2 payable upon consumption break-even.`,
      {
        x: 7.0,
        y: 3.1,
        w: 5.3,
        h: 2.3,
        fontSize: 12,
        color: BRAND.pptxColors.body,
        lineSpacing: 20,
      }
    );

    // Bottom Summary Banner
    slide7.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 5.9,
      w: 11.7,
      h: 0.8,
      fill: { color: BRAND.pptxColors.dark },
    });

    slide7.addText(
      `Total Fixed Price: $${totalFee.toLocaleString()} USD  |  Model: Google Cloud PSF Non-Commit / Flex  |  Currency: USD Only`,
      {
        x: 1.0,
        y: 6.15,
        w: 11.3,
        h: 0.35,
        fontSize: 14,
        bold: true,
        color: BRAND.pptxColors.white,
        align: "center",
      }
    );

    // ==========================================
    // SLIDE 8: IMMEDIATE NEXT STEPS & KICKOFF
    // ==========================================
    const slide8 = pptx.addSlide();
    slide8.background = { color: BRAND.pptxColors.lightBg };
    addHeaderBanner(slide8, "Immediate Next Steps & Kickoff Checklist");

    const steps = [
      { num: "01", title: "Submit PSF Fund Request", desc: "Atlas Geek submits SOW & Fair Market Value breakdown to Google PSF review team." },
      { num: "02", title: "Google Cloud Formal Approval", desc: "Google review completed; formal authorization received via Partner Incentives." },
      { num: "03", title: "Execute SOW Agreement", desc: "Customer and Atlas Geek sign SOW post-approval (Effective Date confirmed)." },
      { num: "04", title: "Tenant & IAM Onboarding", desc: "Customer provisions project access and assigns technical POCs for kickoff." },
      { num: "05", title: "Project Kickoff", desc: "Sprint 0 discovery workshop commenced; technical architecture review initiated." },
    ];

    steps.forEach((st, idx) => {
      const yPos = 1.5 + idx * 0.95;
      slide8.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: yPos,
        w: 11.73,
        h: 0.8,
        fill: { color: BRAND.pptxColors.white },
        line: { color: BRAND.pptxColors.border, width: 1 },
        rectRadius: 0.08,
      });

      // Number badge
      slide8.addShape(pptx.ShapeType.rect, {
        x: 0.8,
        y: yPos,
        w: 0.8,
        h: 0.8,
        fill: { color: idx === 0 ? BRAND.pptxColors.accent : BRAND.pptxColors.primary },
      });

      slide8.addText(st.num, {
        x: 0.8,
        y: yPos + 0.22,
        w: 0.8,
        h: 0.35,
        fontSize: 16,
        bold: true,
        color: BRAND.pptxColors.white,
        align: "center",
      });

      slide8.addText(st.title, {
        x: 1.8,
        y: yPos + 0.15,
        w: 3.5,
        h: 0.3,
        fontSize: 13,
        bold: true,
        color: BRAND.pptxColors.dark,
      });

      slide8.addText(st.desc, {
        x: 5.5,
        y: yPos + 0.15,
        w: 6.8,
        h: 0.5,
        fontSize: 11.5,
        color: BRAND.pptxColors.body,
      });
    });

    return pptx;
  }

  async saveToFile(pptx, outputPath) {
    await pptx.writeFile({ fileName: outputPath });
    return outputPath;
  }
}

module.exports = SlideDesigner;
