# Atlas Geek SOW Manager — Multi-Hyperscaler Studio

This repository contains the **Atlas Geek SOW Manager**, an enterprise delivery system that converts client discovery inputs (PRD documents, transcripts, RFPs, architecture specs) into client-ready, **Hyperscaler-Compliant Statements of Work (SOW)** and synchronized markdown documents.

- **Partner**: Atlas Geek (`https://atlasgeek.in`)
- **Contact**: `business@atlasgeek.in`
- **Branding**: Atlas Geek Indigo (`#3F51B5`), Accent Orange (`#FF7A00`), Slate Navy (`#1E293B`)
- **Logo**: Stored in `assets/atlasgeek_logo.png`
- **Google Drive Storage**: Sourced directly from and saved into `My Drive/AG_Client` (`https://drive.google.com/drive/folders/1Munqib6pDGgMUjHBIlwNRAypHwGA4y7U`)

---

## Supported Hyperscalers & Cloud Programs

The SOW Manager is hyperscaler-neutral and enforces provider-specific commercial models, tenant ownership clauses, architect certifications, and governance checklists:

1. **Google Cloud (GCP)**:
   - **Program**: Partner Services Funds (PSF) / Deployment Acceleration Fund (DAF)
   - **Commercial Model**: Fixed Price (USD) Non-Commit (70% Completion / 30% Consumption Break-Even)
   - **Validation**: Enforces the official **18-Point Google Cloud PSF/DAF Checklist**
   - **Lead Role**: Atlas Geek Certified Professional Cloud Architect & DRP Tier 1 ID (`AG-DRP-88492`)
   - **Approvers**: Regional routing (`psfapproversAPAC@google.com`, `psfapproversEMEA...`, etc.)

2. **Amazon Web Services (AWS)**:
   - **Program**: AWS Migration Acceleration Program (MAP 2.0) / APN Customer Engagements
   - **Commercial Model**: Fixed Price (USD) Deliverable-Based (30% Landing Zone / 40% Workload Migration / 30% Handover & Well-Architected Review)
   - **Validation**: Enforces **AWS APN & Well-Architected SOW Standards (16 Quality Checks)**
   - **Lead Role**: Atlas Geek Certified AWS Solutions Architect - Professional

3. **Microsoft Azure**:
   - **Program**: Azure Migration & Modernization Program (AMMP) / Cloud Adoption Framework (CAF)
   - **Commercial Model**: Fixed Price (USD) (30% Azure Landing Zone / 40% App & DB Migration / 30% Cutover & Sign-Off)
   - **Validation**: Enforces **Microsoft Cloud Adoption Framework (CAF) SOW Standards (16 Quality Checks)**
   - **Lead Role**: Atlas Geek Certified Azure Solutions Architect Expert

4. **Cloud Agnostic / Enterprise Architecture**:
   - **Program**: Standard Enterprise Architecture & Digital Transformation
   - **Commercial Model**: Milestone Deliverable Schedule (25% Blueprint / 35% Platform / 25% Cutover / 15% Handover)
   - **Validation**: Enforces **Enterprise Solution Architecture Quality Standards (15 Quality Checks)**
   - **Lead Role**: Atlas Geek Senior Solutions Architect

---

## Conversational AI Solutions Architect Workflow

Instead of dealing with a browser UI, you work directly with your **AI Solutions Architect** in chat:

1. **Client Intake**: 
   - New client engagements are created naturally in Google Drive or via intake forms in `My Drive/AG_Client/<ClientName>/`.
   - Place client discovery artifacts (PRDs, transcripts, technical notes, RFPs) in `INTERNAL/`.
2. **Interactive Architectural Discovery**:
   - Prompt your AI Architect: *"Let's build an SOW for [ClientName]"*.
   - The AI inspects the PRD, identifies target hyperscalers, diagnoses gaps (e.g. database sizing, cutover downtime windows, VPC networking, compliance requirements), and asks targeted architectural questions.
3. **Pristine SOW Generation**:
   - The engine compiles a clean, beautifully formatted `sow-[client].docx` directly into `AG_Client/<ClientName>/EXTERNAL/sow-[client].docx`.
   - Hyperscaler validation is performed 100% in-memory with zero temporary file pollution in client directories.

---

## Deliverables Generated

Deliverables are saved directly into each client's folder on Google Drive:
`AG_Client/[ClientName]/EXTERNAL/`

- **`sow-[client].docx`**: Formatted Statement of Work with Atlas Geek branding and hyperscaler clauses (ready for Google Docs / Microsoft Word).

---

## CLI Usage

### 1. Generate SOW via CLI
```bash
node sow-cli.js generate --client "[ClientName]" --provider [google|aws|azure|agnostic] --fee [USD] --notes "[Notes]"
```

Examples:
```bash
# Google Cloud PSF SOW
node sow-cli.js generate --client "Hectares Agrotech Private limited" --provider google --fee 45000

# AWS MAP SOW
node sow-cli.js generate --client "Medicodio" --provider aws --fee 55000

# Microsoft Azure SOW
node sow-cli.js generate --client "Callkaro.ai" --provider azure --fee 48000

# Cloud Agnostic SOW with Context Notes
node sow-cli.js generate --client "PGI" --provider agnostic --fee 60000 --notes "Migrate microservices to Kubernetes with high throughput PostgreSQL"
```

### 2. Audit Existing SOW
```bash
node sow-cli.js validate --client "[ClientName]" --provider [google|aws|azure|agnostic]
```

### 3. Real-Time Google Docs Sync
```bash
node sow-cli.js watch --client "[ClientName]"
```

---

## Architecture & Codebase Map

```text
PRD_SOW_Agent/
├── assets/
│   ├── atlasgeek_logo.png         <-- Official Atlas Geek branding
│   └── atlasgeek_logo.jpg
├── src/
│   ├── core/
│   │   ├── client-resolver.js     <-- AG_Client mapping & directory hygiene
│   │   ├── prd-analyzer.js        <-- PRD parsing, workload mapping & gap detection
│   │   ├── sow-builder.js         <-- Multi-hyperscaler DOCX document generator
│   │   ├── sow-validator.js       <-- Multi-hyperscaler checklist validator
│   │   └── psf-validator.js       <-- Google PSF alias for backwards compatibility
│   ├── templates/
│   │   ├── brand-theme.js         <-- Atlas Geek colors & styling
│   │   ├── hyperscaler-specs.js   <-- Specifications for Google, AWS, Azure, Agnostic
│   │   └── psf-spec.js            <-- Google PSF clauses & approvers
│   └── sync/
│       ├── docx-to-md.js          <-- DOCX to Markdown synchronization
│       └── sync-watcher.js        <-- Real-time Google Drive desktop watcher
├── sow-cli.js                     <-- Unified CLI tool
└── package.json
```