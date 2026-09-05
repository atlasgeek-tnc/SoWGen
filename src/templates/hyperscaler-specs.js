/**
 * Hyperscaler & Cloud Architecture Specifications
 * Supports Google Cloud (PSF/DAF), AWS (MAP), Microsoft Azure (AMMP), and Cloud Agnostic SOWs.
 */

const HYPERSCALER_SPECS = {
  google: {
    id: "google",
    name: "Google Cloud (GCP)",
    program: "Partner Services Funds (PSF) / Deployment Acceleration Fund (DAF)",
    engagementTypes: ["Foundations", "Migration", "Implementation", "Deployment"],
    defaultEngagementType: "Implementation",
    fundingModel: "PSF Non-Commit (70% Completion / 30% Consumption Break-Even)",
    leadArchitect: "Atlas Geek Certified Professional Cloud Architect",
    partnerCredential: "Partner Delivery Readiness Portal (DRP) ID: AG-DRP-88492 (Tier 1 Score: 50+)",
    tenantClauseTitle: "Google Cloud Customer Tenant & Billing Mandate",
    tenantClause: `All Google Cloud infrastructure, workloads, and services provisioned under this Statement of Work shall be deployed directly within the Customer's designated Google Cloud Organization and billing account (Customer Tenant). The Customer retains full ownership of all tenant configurations, data, and access controls. All ongoing infrastructure consumption and Google Cloud platform usage charges shall be billed directly to the Customer by Google or its designated reseller.`,
    commercialModel: "Fixed Price (USD) — Subject to formal Google Cloud PSF Approval",
    milestoneSplit: [
      { name: "Milestone 1: Project Completion & Deliverables", pct: 0.7, desc: "Payable upon formal sign-off of all deliverables" },
      { name: "Milestone 2: Consumption Break-Even", pct: 0.3, desc: "Payable upon verification of target GCP consumption" },
    ],
    governingRules: "Enforces Google Cloud PSF 18-Point Review Checklist",
    approverRouting: {
      APAC: "psfapproversAPAC@google.com",
      EMEA: "psfapproversEMEA@google.com",
      LATAM: "psfapproversLATAM@google.com",
      NORTHAM: "psfapproversNORTHAM@google.com",
    },
  },

  aws: {
    id: "aws",
    name: "Amazon Web Services (AWS)",
    program: "AWS Migration Acceleration Program (MAP 2.0) / APN Customer Engagements",
    engagementTypes: ["MAP Assess & Mobilize", "MAP Migrate & Modernize", "Well-Architected Review", "Implementation", "Cloud Foundations"],
    defaultEngagementType: "MAP Migrate & Modernize",
    fundingModel: "AWS MAP / Milestone-Based Deliverable Funding",
    leadArchitect: "Atlas Geek Certified AWS Solutions Architect - Professional",
    partnerCredential: "AWS Partner Network (APN) Select Tier Consulting Partner",
    tenantClauseTitle: "AWS Customer Payer Account & Ownership Mandate",
    tenantClause: `All AWS infrastructure, VPCs, and services provisioned under this Statement of Work shall be deployed directly within the Customer's designated AWS Organization / Payer Account. Customer retains exclusive root ownership, IAM identity boundaries, and operational control. All AWS infrastructure consumption and data transfer fees are billed directly to Customer's AWS account.`,
    commercialModel: "Fixed Price (USD) — AWS Well-Architected Framework Aligned",
    milestoneSplit: [
      { name: "Milestone 1: Discovery & Landing Zone Foundation", pct: 0.3, desc: "AWS Control Tower, VPC, and IAM setup sign-off" },
      { name: "Milestone 2: Workload Build & Migration Execution", pct: 0.4, desc: "Successful workload cutover and validation testing" },
      { name: "Milestone 3: Handover, Well-Architected Review & Sign-Off", pct: 0.3, desc: "Operations runbook, KT, and final acceptance" },
    ],
    governingRules: "Enforces AWS APN & Well-Architected SOW Standards",
  },

  azure: {
    id: "azure",
    name: "Microsoft Azure",
    program: "Azure Migration and Modernization Program (AMMP) / Enterprise Modernization",
    engagementTypes: ["Cloud Adoption Framework (CAF) Foundations", "Workload Migration", "App Modernization", "Data & AI Modernization"],
    defaultEngagementType: "Workload Migration",
    fundingModel: "Azure Enterprise SOW / AMMP Milestone Funding",
    leadArchitect: "Atlas Geek Certified Azure Solutions Architect Expert",
    partnerCredential: "Microsoft Solutions Partner / Cloud Solution Provider",
    tenantClauseTitle: "Microsoft Azure Customer Subscription & Tenant Mandate",
    tenantClause: `All Azure resources, Resource Groups, and Landing Zones developed under this SOW shall reside within the Customer's dedicated Microsoft Entra ID (Azure AD) Tenant and Azure Subscriptions. The Customer retains full administrative control, subscription management, and policy compliance. All Azure cloud consumption charges are billed directly to Customer's Enterprise Agreement (EA) or MCA.`,
    commercialModel: "Fixed Price (USD) — Microsoft Cloud Adoption Framework (CAF) Aligned",
    milestoneSplit: [
      { name: "Milestone 1: Azure Landing Zone & Architecture Alignment", pct: 0.3, desc: "Management Groups, Hub-Spoke VNet, and Entra ID setup" },
      { name: "Milestone 2: Application Migration & Database Deployment", pct: 0.4, desc: "Workloads deployed to Azure and smoke tests verified" },
      { name: "Milestone 3: Production Cutover, As-Built Docs & Sign-Off", pct: 0.3, desc: "Final sign-off, operations runbook, and knowledge transfer" },
    ],
    governingRules: "Enforces Microsoft Cloud Adoption Framework SOW Standards",
  },

  agnostic: {
    id: "agnostic",
    name: "Cloud Agnostic / Enterprise Architecture",
    program: "Standard Enterprise Architecture & Digital Transformation",
    engagementTypes: ["Cloud Migration", "Architecture Modernization", "Infrastructure Automation", "DevSecOps Enablement"],
    defaultEngagementType: "Cloud Migration",
    fundingModel: "Commercial Milestone Deliverable Schedule",
    leadArchitect: "Atlas Geek Senior Solutions Architect",
    partnerCredential: "Atlas Geek Enterprise Cloud Delivery Practice",
    tenantClauseTitle: "Customer Infrastructure Ownership & Billing Mandate",
    tenantClause: `All infrastructure components, container platforms, cloud services, and code repositories provisioned under this Statement of Work shall be deployed directly within Customer-owned accounts, subscriptions, or premises. Customer retains total operational sovereignty, data ownership, and governance. All third-party platform licensing and infrastructure usage charges are billed directly to Customer.`,
    commercialModel: "Fixed Price Commercial Milestone Model (USD)",
    milestoneSplit: [
      { name: "Milestone 1: Architecture Blueprint & Sprint Planning", pct: 0.25, desc: "ADD sign-off and environment prerequisites verified" },
      { name: "Milestone 2: Core Platform & Infrastructure Build", pct: 0.35, desc: "IaC repositories, Dev/UAT environments validated" },
      { name: "Milestone 3: Workload Deployment & Cutover Validation", pct: 0.25, desc: "Live production deployment and smoke tests passed" },
      { name: "Milestone 4: Operational Handover & Final Acceptance", pct: 0.15, desc: "Runbooks, recorded KT, and project sign-off" },
    ],
    governingRules: "Enforces Enterprise Solution Architecture Quality Standards",
  },
};

module.exports = HYPERSCALER_SPECS;
