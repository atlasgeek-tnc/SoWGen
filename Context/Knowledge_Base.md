# Knowledge Base — Multi-Cloud Reference

> This document provides the agent with reference knowledge for cloud architecture, pricing models, delivery patterns, and estimation norms. Use this to validate technical statements in transcripts and to inform SOW scope and assumptions.

---

## 1. Cloud Migration Strategies (The 7 Rs)

| Strategy | Also Called | Description | When to Use |
|---|---|---|---|
| **Rehost** | Lift & Shift | Move workload as-is to cloud | Speed priority, no modernisation budget |
| **Replatform** | Lift & Tinker | Minor optimisations (e.g., move to managed DB) | Quick wins without full refactor |
| **Refactor** | Re-architect | Redesign for cloud-native patterns | Maximum cloud benefit, higher cost/time |
| **Repurchase** | Drop & Shop | Replace with SaaS | Legacy on-prem with SaaS equivalent |
| **Relocate** | Hypervisor-level lift | Move VMware workloads to cloud VMware | Large VMware estates |
| **Retain** | Revisit | Keep on-premises (for now) | Compliance, latency, or end-of-life soon |
| **Retire** | Decommission | Turn off | Redundant or unused systems |

---

## 2. Multi-Cloud Reference Architecture Patterns

### 2.1 Common Workload-to-Cloud Mapping

| Workload Type | AWS Preference | Azure Preference | GCP Preference |
|---|---|---|---|
| .NET / Windows | EC2 / Elastic Beanstalk | Azure App Service (native) | GKE |
| SAP | EC2 (certified) | Azure (SAP-certified, preferred) | — |
| Kubernetes | EKS | AKS | GKE (most mature) |
| Serverless | Lambda | Azure Functions | Cloud Functions / Cloud Run |
| Data Warehouse | Redshift | Synapse Analytics | BigQuery |
| ML/AI Platform | SageMaker | Azure ML | Vertex AI |
| Identity | IAM + Cognito | Entra ID (Azure AD) | Cloud Identity |
| Multi-cloud Networking | AWS Transit Gateway | Azure vWAN | Cloud VPN / HA VPN |

### 2.2 Connectivity Patterns

| Pattern | Description | Use Case |
|---|---|---|
| **Hub & Spoke** | Central network hub with satellite VNets/VPCs | Large enterprise, centralised security |
| **Mesh** | Each VPC/VNet connected to all others | High east-west traffic, multi-region |
| **Transit Gateway** | AWS managed routing hub | AWS-heavy multi-account |
| **ExpressRoute / Direct Connect** | Dedicated private connectivity to cloud | Regulated workloads, high throughput |
| **SD-WAN** | Software-defined overlay across providers | Multi-cloud networking abstraction |

---

## 3. Security & Compliance Reference

### 3.1 Common Compliance Frameworks

| Framework | Region | Applies To | Key Requirements |
|---|---|---|---|
| **ISO 27001** | Global | Any organisation | ISMS, risk management, controls |
| **SOC 2 Type II** | US (recognised globally) | SaaS, cloud services | Trust service criteria, audit |
| **GDPR** | EU / EEA | Any org processing EU personal data | Data minimisation, consent, DPO |
| **HIPAA** | US | Healthcare data (PHI) | BAA required, encryption, audit logs |
| **PCI-DSS** | Global | Payment card data | Network segmentation, encryption, QSA |
| **DORA** | EU | Financial services | ICT resilience, incident reporting |
| **NIS2** | EU | Critical infrastructure | Cyber risk management, reporting |
| **FedRAMP** | US Government | US federal cloud | NIST controls, continuous monitoring |

### 3.2 Cloud-Native Security Controls Reference

| Control Area | AWS | Azure | GCP |
|---|---|---|---|
| Identity & Access | IAM, Organizations, SCPs | Entra ID, PIM, Conditional Access | Cloud IAM, Org Policies |
| Secrets Management | Secrets Manager, Parameter Store | Key Vault | Secret Manager |
| Encryption at Rest | KMS | Azure Key Vault | Cloud KMS, CMEK |
| Network Security | Security Groups, NACLs, WAF | NSG, Azure Firewall, WAF | VPC Firewall, Cloud Armor |
| Threat Detection | GuardDuty, Security Hub | Defender for Cloud | Security Command Center |
| Audit Logging | CloudTrail | Activity Log, Diagnostic Settings | Cloud Audit Logs |
| DLP | Macie | Purview | Cloud DLP |
| CSPM | Security Hub | Defender CSPM | Security Command Center |

---

## 4. Delivery Phase Reference

### 4.1 Standard Phase Definitions

#### Phase 1 — Discovery & Assessment (2–4 weeks)
**Purpose:** Baseline the current state; validate requirements; identify risks.
**Key Activities:**
- Stakeholder interviews and workshops
- Current state architecture review
- Infrastructure and application discovery (tooling: AWS Migration Hub, Azure Migrate, Cloudamize)
- Security and compliance gap assessment
- TCO / Business Case modelling
**Deliverables:** Discovery Report, Architecture Assessment, Risk Register, Migration Wave Plan

#### Phase 2 — Solution Design (3–6 weeks)
**Purpose:** Design the target architecture and delivery plan.
**Key Activities:**
- High-Level Design (HLD) and Low-Level Design (LLD)
- Network design and IP addressing
- Security architecture and IAM design
- Landing Zone / Account Structure design
- IaC framework selection and standards
**Deliverables:** HLD, LLD, Architecture Decision Records (ADRs), IaC Standards Guide

#### Phase 3 — Foundation / Landing Zone Build (2–6 weeks)
**Purpose:** Build the cloud foundation before workload migration.
**Key Activities:**
- Account structure / Management Group setup
- Network foundation (VPC/VNet, transit, on-prem connectivity)
- Identity integration (SSO, directory sync)
- Security baseline (logging, monitoring, CSPM, guardrails)
- Tagging and cost management setup
**Deliverables:** Production-ready Landing Zone, Runbooks, Baseline Monitoring Dashboard

#### Phase 4 — Migration / Build (varies)
**Purpose:** Migrate workloads or build new services.
**Key Activities (Migration):** Wave-based server migrations, database migrations, validation testing
**Key Activities (Build):** Application development, IaC pipeline build, CI/CD setup
**Deliverables:** Migrated workloads or built application, Pipeline documentation, Test Results

#### Phase 5 — Testing & Validation (1–3 weeks)
**Purpose:** Validate the solution meets requirements.
**Key Activities:** Functional testing, performance testing, security testing, DR testing
**Deliverables:** Test Plan, Test Results, UAT Sign-Off

#### Phase 6 — Hypercare & Handover (2–4 weeks)
**Purpose:** Stabilise post-go-live and transfer knowledge to the client.
**Key Activities:** Enhanced monitoring, incident support, knowledge transfer workshops, documentation handover
**Deliverables:** Handover Pack, Operations Runbooks, Training Sessions, Formal Acceptance

---

## 5. Effort Estimation Reference

> Use these as sanity-check benchmarks. Always validate against actual scope complexity.

### 5.1 Cloud Landing Zone

| Complexity | Description | Indicative Effort |
|---|---|---|
| Simple | Single-account, single-region, basic networking | 15–25 days |
| Medium | Multi-account (AWS Org / Azure MG), hub-spoke, SSO | 30–50 days |
| Complex | Multi-cloud, multi-region, advanced security, compliance controls | 60–120 days |

### 5.2 Server Migration (per server, wave-based)

| Server Type | Indicative Effort |
|---|---|
| Simple web / app server (rehost) | 0.5–1 day |
| Complex clustered application | 2–5 days |
| Database (SQL, Oracle) — rehost | 1–2 days |
| Database — replatform (RDS/Managed) | 3–8 days |
| Legacy / undocumented server | 3–10 days |

### 5.3 Application Modernisation

| Task | Indicative Effort |
|---|---|
| Containerise existing app (Dockerfile + K8s manifests) | 5–15 days per app |
| Build CI/CD pipeline (GitHub Actions / Azure DevOps) | 3–8 days per pipeline |
| Implement IaC for existing infrastructure | 10–30 days (depending on scale) |
| Microservices decomposition | 20–60 days per domain |

---

## 6. Cloud Pricing Reference (Indicative — always validate with pricing calculators)

### 6.1 Compute

| Service | On-Demand Cost Basis | Savings Levers |
|---|---|---|
| AWS EC2 | Per hour, per instance type | Reserved (1/3yr), Savings Plans, Spot |
| Azure VM | Per hour | Reserved Instances, Azure Hybrid Benefit |
| GCP Compute Engine | Per second | Committed Use Discounts, Preemptible |

### 6.2 Common Savings Mechanisms

| Mechanism | Typical Saving vs On-Demand |
|---|---|
| 1-year Reserved / CUD | ~30–40% |
| 3-year Reserved / CUD | ~50–60% |
| Spot / Preemptible | ~70–90% (interruption risk) |
| Savings Plans (AWS) | ~20–30% (flexible) |
| Azure Hybrid Benefit | ~40% for Windows/SQL workloads |

---

## 7. Common Transcript Red Flags & How to Handle Them

| Red Flag in Transcript | Risk | SOW Handling |
|---|---|---|
| "We need this done in 6 weeks" for a large migration | Unrealistic timeline | Document timeline as client-driven; add risk; phase delivery |
| "We'll provide whatever access you need" | Access delays likely | Define specific access requirements and timelines in Client Obligations |
| "Budget is flexible" | No budget ceiling defined | Establish a budget range before SOW finalisation |
| "Just move everything to the cloud" | Undefined scope | Require asset inventory before committing to scope |
| "We tried this before and it didn't work" | Hidden technical debt or org. resistance | Investigate root cause; add risk item |
| "Security is handled by a third party" | Integration complexity | Identify third-party dependencies; add to Dependencies section |
| "We're not sure which cloud yet" | Architecture undecided | Add cloud selection as Phase 1 deliverable |
| "Our team will handle the testing" | Testing quality risk | Define client testing obligations and entry/exit criteria |
| "We want everything in the SOW" | Scope inflation | Use MoSCoW; separate Must Have from Should/Could Have |

---

## 8. Glossary of Terms

| Term | Definition |
|---|---|
| ADR | Architecture Decision Record |
| AKS | Azure Kubernetes Service |
| BCP | Business Continuity Plan |
| CUD | Committed Use Discount (GCP) |
| CSPM | Cloud Security Posture Management |
| EKS | Elastic Kubernetes Service (AWS) |
| GKE | Google Kubernetes Engine |
| HLD | High-Level Design |
| IaC | Infrastructure as Code |
| LLD | Low-Level Design |
| MSA | Master Services Agreement |
| RPO | Recovery Point Objective |
| RTO | Recovery Time Objective |
| SCPs | Service Control Policies (AWS Org) |
| SOW | Statement of Work |
| TCO | Total Cost of Ownership |
| UAT | User Acceptance Testing |
| vWAN | Azure Virtual WAN |
| WAF | Web Application Firewall |
| Zero Trust | Security model: never trust, always verify |