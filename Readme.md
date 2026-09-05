# Atlas Geek SOW Manager — Google PSF/DAF Edition

This repository contains the **Atlas Geek SOW Manager**, an enterprise delivery agent that converts client discovery inputs (transcripts, RFPs, architecture docs) into client-ready, **Google Cloud Partner Services Funds (PSF) and Deployment Acceleration Fund (DAF)** compliant Statements of Work, executive slide presentations, and synchronized markdown documents.

- **Partner**: Atlas Geek (`https://atlasgeek.in`)
- **Contact**: `business@atlasgeek.in`
- **Branding**: Atlas Geek Indigo (`#3F51B5`), Accent Orange (`#FF7A00`), Slate Navy (`#1E293B`)
- **Logo**: Stored in `assets/atlasgeek_logo.png`

---

## Deliverables Produced

For each client engagement, outputs are generated in:
`clients/[ClientName]/outputs/`

1. **`sow-[client]-[YYYY-MM-DD].docx`**: Formal Statement of Work with Atlas Geek logo, fully compliant with Google Cloud PSF/DAF review standards (ready to open & edit in Google Docs).
2. **`slides-[client]-[YYYY-MM-DD].pptx`**: 16:9 Executive Presentation Deck (Executive summary, solution architecture pillars, in/out scope cards, roadmap, RACI, 70/30 commercials). Ready to open & edit in Google Slides.
3. **`sow-[client]-[YYYY-MM-DD].md`**: Local markdown representation kept in two-way parity with online Google Docs edits.
4. **`psf-checklist-[client]-[YYYY-MM-DD].md`**: Official 18-point Google Cloud PSF/DAF audit scorecard (100% compliance verification).
5. **`prd-[client]-[YYYY-MM-DD].md`**: Technical PRD working document.
6. **`open-questions-[client].md`**: Client discovery clarification log.
7. **`risk-register-[client].md`**: Client-specific risk register.

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

Because this repository is located inside macOS Google Drive Desktop:
1. **Local → Cloud**: Any `.docx` or `.pptx` generated locally is immediately uploaded to Google Drive.
2. **Online Editing**:
   - Double-click `sow-[client]-[date].docx` in Google Drive to edit directly in **Google Docs**.
   - Double-click `slides-[client]-[date].pptx` to edit directly in **Google Slides**.
3. **Cloud → Local Two-Way Sync**:
   - Edits made online save back to the `.docx` file in Google Drive, which Google Drive Desktop downloads to your Mac.
   - Run the sync watcher to automatically detect updates and refresh the local markdown file:
     ```bash
     node sow-cli.js watch --client [ClientName]
     ```

---

## CLI Usage Guide

The unified CLI tool `sow-cli.js` orchestrates all generation, slide design, validation, and sync operations:

### 1. Generate Full SOW, Slides & Audit
```bash
node sow-cli.js generate --client [ClientName] --project "[Project Title]" --type "[Foundations|Migration|Implementation|Deployment]" --fee [USD]
```
Example:
```bash
node sow-cli.js generate --client hectares_agrotech_pvt_ltd --project "AI/ML Agricultural Modernization on Google Cloud" --type "Implementation" --fee 45000
```

### 2. Launch Interactive Web Dashboard (UI)
If you prefer a visual web interface instead of CLI commands:
```bash
npm start
# OR
node sow-cli.js ui
```
Then open your browser to `http://localhost:4100` to create, configure, generate, preview, and download SOWs and slide decks with 1 click.

### 3. Generate or Refresh Slide Deck Only
```bash
node sow-cli.js slides --client [ClientName] --project "[Project Title]" --fee [USD]
```

### 3. Audit SOW Against Google Cloud PSF Checklist
```bash
node sow-cli.js validate --client [ClientName]
```

### 4. Start Google Drive Desktop Real-Time Sync Watcher
```bash
node sow-cli.js watch --client [ClientName]
```

---

## Folder Structure

```text
PRD_SOW_Agent/
├── assets/
│   └── atlasgeek_logo.png     <-- Atlas Geek official logo
├── clients/
│   └── [ClientName]/
│       ├── inputs/            <-- Transcripts, PDFs, RFPs
│       └── outputs/           <-- Generated deliverables (DOCX, PPTX, MD)
├── src/
│   ├── core/
│   │   ├── sow-builder.js     <-- Enterprise DOCX compiler with Google PSF clauses
│   │   ├── slide-designer.js  <-- Executive 16:9 presentation generator
│   │   └── psf-validator.js   <-- Official 18-point Google PSF linter
│   ├── sync/
│   │   ├── docx-to-md.js      <-- DOCX-to-Markdown parser
│   │   └── sync-watcher.js    <-- Real-time Google Drive Desktop change watcher
│   └── templates/
│       ├── brand-theme.js     <-- Atlas Geek branding tokens & colors
│       └── psf-spec.js        <-- Google PSF checklist rules & approver routes
├── sow-cli.js                 <-- Master CLI tool
├── AGENTS.md                  <-- Master agent instruction manual
└── Readme.md                  <-- System documentation
```