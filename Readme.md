# Atlas Geek SOW Manager — Google PSF/DAF Edition

This repository contains the **Atlas Geek SOW Manager**, an enterprise delivery system that converts client discovery inputs (transcripts, RFPs, architecture docs) into client-ready, **Google Cloud Partner Services Funds (PSF) and Deployment Acceleration Fund (DAF)** compliant Statements of Work and synchronized markdown documents.

- **Partner**: Atlas Geek (`https://atlasgeek.in`)
- **Contact**: `business@atlasgeek.in`
- **Branding**: Atlas Geek Indigo (`#3F51B5`), Accent Orange (`#FF7A00`), Slate Navy (`#1E293B`)
- **Logo**: Stored in `assets/atlasgeek_logo.png`
- **Google Drive Storage**: Sourced directly from and saved into `My Drive/AG_Client` (`https://drive.google.com/drive/folders/1Munqib6pDGgMUjHBIlwNRAypHwGA4y7U`)

---

## Deliverables Produced

For each client engagement, deliverables are generated and saved directly in:
`AG_Client/[ClientName]/EXTERNAL/`

1. **`sow-[client]-[YYYY-MM-DD].docx`**: Formal Statement of Work with Atlas Geek logo, fully compliant with Google Cloud PSF/DAF review standards (ready to open & edit in Google Docs).
2. **`sow-[client]-[YYYY-MM-DD].md`**: Local markdown representation kept in two-way parity with online Google Docs edits.
3. **`psf-checklist-[client]-[YYYY-MM-DD].md`**: Official 18-point Google Cloud PSF/DAF audit scorecard (100% compliance verification).
4. **`prd-[client]-[YYYY-MM-DD].md`**: Technical PRD working document (when PRD stage is executed).
5. **`open-questions-[client].md`**: Client discovery clarification log.
6. **`risk-register-[client].md`**: Client-specific risk register.

---

## Google Cloud PSF / DAF Compliance Highlights

Every generated SOW strictly implements Google Cloud's official review checklist:
- **Engagement Categorization**: Foundations, Migration, Implementation, or Deployment.
- **Customer Tenant & Direct Billing**: Explicit clause establishing deployment within Customer Tenant and direct billing for Google Cloud consumption.
- **No Hourly Caps**: Deliverables structured by measurable milestones with durations, avoiding capped time-and-materials limits.
- **Workloads & Environments**: Details of Google Cloud services across Development, UAT, and Production.
- **Timeline Provisions**: Future-dated start dates (≥ 7 business days out) and term ending "pending acceptance of all deliverables".
- **Google Certified Roles & DRP IDs**: Partner roles with Google Cloud certifications and DRP Tier 1 (50+) IDs (strictly excluding Google roles).
- **Commercial PSF 70/30 Milestones**: Fixed Price in USD only, with 70% project completion and 30% consumption break-even payment milestones.
- **Google Appendix**: 10:1 ROI justification, first 12 months estimated ARR, and regional approver contact matrix (`psfapprovers...`).

---

## Google Docs & Google Drive Synchronization

Because this repository is connected directly with `My Drive/AG_Client`:
1. **Local → Cloud**: Any `.docx` generated locally in `EXTERNAL/` is immediately uploaded to Google Drive by Google Drive Desktop.
2. **Online Editing**: Double-click `sow-[client]-[date].docx` in Google Drive to edit directly in **Google Docs**. Share with Google PSF approvers (`psfapprovers...`) with comments and edit access enabled.
3. **Cloud → Local Two-Way Sync**:
   - Edits made online save back to the `.docx` file in Google Drive, which Google Drive Desktop downloads to your Mac.
   - Run the sync watcher to automatically detect updates and refresh the local markdown file:
     ```bash
     node sow-cli.js watch --client [ClientName]
     ```

---

## How to Use

### 1. Launch Interactive Web Dashboard (UI)
```bash
npm start
# OR
node sow-cli.js ui
```
Then open your browser to `http://localhost:4100` to select clients, review inputs from `INTERNAL/`, configure fees, generate SOW documents, and verify Google PSF compliance.

### 2. Generate SOW via CLI
```bash
node sow-cli.js generate --client "[ClientName]" --project "[Project Title]" --type "[Foundations|Migration|Implementation|Deployment]" --fee [USD]
```
Example:
```bash
node sow-cli.js generate --client "Hectares Agrotech Private limited" --project "AI/ML Agricultural Modernization on Google Cloud" --type "Implementation" --fee 45000
```

### 3. Audit SOW Against Google Cloud PSF Checklist
```bash
node sow-cli.js validate --client "[ClientName]"
```

### 4. Start Google Drive Desktop Real-Time Sync Watcher
```bash
node sow-cli.js watch --client "[ClientName]"
```

---

## Folder Structure

```text
PRD_SOW_Agent/
├── assets/
│   ├── atlasgeek_logo.png     <-- Atlas Geek official logo
│   └── atlasgeek_logo.jpg
├── src/
│   ├── core/
│   │   ├── client-resolver.js <-- Maps clients, inputs (INTERNAL/) & outputs (EXTERNAL/)
│   │   ├── sow-builder.js     <-- Enterprise DOCX compiler with Google PSF clauses
│   │   └── psf-validator.js   <-- Official 18-point Google PSF linter
│   ├── sync/
│   │   ├── docx-to-md.js      <-- DOCX-to-Markdown parser
│   │   └── sync-watcher.js    <-- Real-time Google Drive Desktop change watcher
│   ├── templates/
│   │   ├── brand-theme.js     <-- Atlas Geek branding tokens & colors
│   │   └── psf-spec.js        <-- Google PSF checklist rules & approver routes
│   └── ui/
│       └── server.js          <-- Interactive Web Dashboard (http://localhost:4100)
├── sow-cli.js                 <-- Master CLI tool
├── AGENTS.md                  <-- Master agent operating manual
└── Readme.md                  <-- System documentation
```