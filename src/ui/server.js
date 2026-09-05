const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const { exec } = require("child_process");

const SowBuilder = require("../core/sow-builder");
const SowValidator = require("../core/sow-validator");
const prdAnalyzer = require("../core/prd-analyzer");
const clientResolver = require("../core/client-resolver");
const { convertDocxToMarkdown } = require("../sync/docx-to-md");
const BRAND = require("../templates/brand-theme");
const HYPERSCALER_SPECS = require("../templates/hyperscaler-specs");

const PORT = process.env.PORT || 4100;

// Helper to get client details
function getClientDetails(clientName) {
  const paths = clientResolver.getClientPaths(clientName);
  const inputs = clientResolver.getInputFiles(clientName);
  const outputs = clientResolver.getOutputFiles(clientName);

  // Read latest audit report if exists
  let checklistContent = null;
  const checklistFile = outputs.find((f) => f.name.includes("checklist") || f.name.includes("audit"));
  if (checklistFile) {
    try {
      checklistContent = fs.readFileSync(checklistFile.fullPath, "utf-8");
    } catch (e) {}
  }

  return {
    client: paths.clientName,
    clientDir: paths.clientDir,
    inputDir: paths.inputDir,
    outputDir: paths.outputDir,
    inputs,
    outputs,
    checklistContent,
  };
}

// HTML Dashboard Template
function renderDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Atlas Geek SOW Manager — Multi-Hyperscaler Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #3F51B5;
      --primary-dark: #283593;
      --accent: #FF7A00;
      --dark: #1E293B;
      --body: #334155;
      --muted: #64748B;
      --light-bg: #F8FAFC;
      --border: #E2E8F0;
      --success: #059669;
      --success-bg: #ECFDF5;
      --warning: #D97706;
      --warning-bg: #FFFBEB;
      --card-bg: #FFFFFF;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--light-bg);
      color: var(--body);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: #ffffff;
      border-bottom: 1px solid var(--border);
      padding: 0.85rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .brand-box {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .brand-logo {
      height: 44px;
      object-fit: contain;
    }
    .brand-title h1 {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--dark);
      line-height: 1.2;
    }
    .brand-title p {
      font-size: 0.75rem;
      color: var(--muted);
      font-weight: 500;
    }
    .header-badges {
      display: flex;
      gap: 0.6rem;
      align-items: center;
    }
    .badge {
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .badge-provider {
      background: #EEF2FF;
      color: var(--primary);
      border: 1px solid #C7D2FE;
    }
    .badge-sync {
      background: var(--success-bg);
      color: var(--success);
      border: 1px solid #A7F3D0;
    }
    .main-container {
      display: grid;
      grid-template-columns: 310px 1fr;
      flex: 1;
      height: calc(100vh - 70px);
    }

    /* Sidebar */
    aside {
      background: #FFFFFF;
      border-right: 1px solid var(--border);
      padding: 1.25rem 1rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 0.25rem;
    }
    .sidebar-header h2 {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
      font-weight: 700;
    }
    .search-box {
      position: relative;
    }
    .search-input {
      width: 100%;
      padding: 0.55rem 0.75rem 0.55rem 2rem;
      border: 1px solid var(--border);
      border-radius: 0.4rem;
      font-size: 0.85rem;
      outline: none;
      transition: all 0.15s;
    }
    .search-icon {
      position: absolute;
      left: 0.65rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.8rem;
      color: var(--muted);
    }
    .search-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(63,81,181,0.15);
    }
    .client-list-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--muted);
      margin-top: 0.25rem;
      padding-left: 0.25rem;
    }
    .client-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      overflow-y: auto;
      flex: 1;
    }
    .client-item {
      padding: 0.65rem 0.85rem;
      border-radius: 0.45rem;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--dark);
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.15s ease;
      word-break: break-word;
      border: 1px solid transparent;
    }
    .client-item:hover {
      background: #F1F5F9;
      border-color: var(--border);
    }
    .client-item.active {
      background: var(--primary);
      color: #FFFFFF;
      font-weight: 600;
    }


    /* Content Area */
    main {
      padding: 1.75rem 2rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.75rem;
    }
    .card-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--dark);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Hyperscaler Selector Tabs */
    .provider-nav {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.6rem;
      margin-bottom: 1.25rem;
    }
    .provider-tab {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      padding: 0.75rem 0.9rem;
      border: 1.5px solid var(--border);
      border-radius: 0.5rem;
      background: #FFFFFF;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .provider-tab:hover {
      border-color: #94A3B8;
      transform: translateY(-1px);
    }
    .provider-tab.active {
      border-color: var(--primary);
      background: #F5F7FF;
      box-shadow: 0 0 0 2px rgba(63,81,181,0.2);
    }
    .provider-tab-header {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-weight: 700;
      font-size: 0.85rem;
      color: var(--dark);
    }
    .provider-tab-sub {
      font-size: 0.72rem;
      color: var(--muted);
      line-height: 1.2;
    }

    /* Discovery Intake Area */
    .intake-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      margin-bottom: 1.25rem;
    }
    .dropzone {
      border: 2px dashed #CBD5E1;
      border-radius: 0.5rem;
      padding: 1.25rem;
      text-align: center;
      background: #FAFAFC;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .dropzone:hover, .dropzone.dragover {
      border-color: var(--primary);
      background: #EEF2FF;
    }
    .dropzone-icon {
      font-size: 2rem;
    }
    .dropzone-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--dark);
    }
    .dropzone-sub {
      font-size: 0.75rem;
      color: var(--muted);
    }
    .notes-textarea {
      width: 100%;
      height: 120px;
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      font-family: inherit;
      font-size: 0.85rem;
      outline: none;
      resize: vertical;
      color: var(--dark);
      transition: border 0.15s;
    }
    .notes-textarea:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(63,81,181,0.15);
    }

    /* Gap Analyzer Card */
    .analyzer-box {
      background: #F8FAFC;
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1.25rem;
    }
    .analyzer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.6rem;
    }
    .analyzer-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--dark);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .gap-item {
      background: #FFFBEB;
      border-left: 3px solid var(--warning);
      padding: 0.6rem 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.8rem;
      margin-top: 0.4rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .gap-item span {
      color: #78350F;
    }
    .gap-btn {
      background: #FFFFFF;
      border: 1px solid #FCD34D;
      color: #92400E;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
    }
    .gap-btn:hover {
      background: #FEF3C7;
    }

    .location-info {
      font-size: 0.8rem;
      color: var(--muted);
      margin-bottom: 1.25rem;
      padding: 0.6rem 0.85rem;
      background: #F8FAFC;
      border: 1px solid var(--border);
      border-radius: 0.4rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .inputs-chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
    }
    .input-chip {
      background: #EEF2FF;
      color: var(--primary);
      border: 1px solid #C7D2FE;
      padding: 0.35rem 0.75rem;
      border-radius: 0.35rem;
      font-size: 0.75rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .workload-chip {
      background: #ECFDF5;
      color: #065F46;
      border: 1px solid #A7F3D0;
      padding: 0.35rem 0.65rem;
      border-radius: 0.35rem;
      font-size: 0.75rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .form-group label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--dark);
    }
    .form-group input, .form-group select {
      padding: 0.65rem 0.85rem;
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      font-size: 0.9rem;
      color: var(--dark);
      outline: none;
      transition: border 0.2s ease;
    }
    .form-group input:focus, .form-group select:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(63, 81, 181, 0.15);
    }

    /* Milestone Breakdown Card */
    .milestone-preview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.85rem;
      background: #F8FAFC;
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }
    .milestone-item h4 {
      font-size: 0.72rem;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 0.25rem;
      font-weight: 700;
    }
    .milestone-item p {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--primary);
    }
    .milestone-item.accent p {
      color: var(--accent);
    }

    .action-row {
      display: flex;
      gap: 0.85rem;
      flex-wrap: wrap;
    }
    .btn {
      padding: 0.75rem 1.4rem;
      border-radius: 0.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
      transition: all 0.2s ease;
    }
    .btn-primary {
      background: var(--primary);
      color: #FFFFFF;
    }
    .btn-primary:hover {
      background: var(--primary-dark);
    }
    .btn-accent {
      background: var(--accent);
      color: #FFFFFF;
    }
    .btn-accent:hover {
      background: #E06C00;
    }
    .btn-outline {
      background: #FFFFFF;
      border: 1px solid var(--border);
      color: var(--dark);
    }
    .btn-outline:hover {
      background: #F8FAFC;
      border-color: #CBD5E1;
    }

    /* Deliverables Grid */
    .files-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }
    .file-card {
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #FFFFFF;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .file-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .file-header {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .file-icon {
      font-size: 1.75rem;
    }
    .file-info h3 {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--dark);
      word-break: break-all;
    }
    .file-info p {
      font-size: 0.75rem;
      color: var(--muted);
      margin-top: 0.2rem;
    }
    .file-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .file-btn {
      flex: 1;
      padding: 0.45rem 0.6rem;
      border-radius: 0.35rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      cursor: pointer;
    }
    .file-btn-download {
      background: #EEF2FF;
      color: var(--primary);
    }
    .file-btn-open {
      background: #F1F5F9;
      color: var(--dark);
    }

    /* Scorecard Banner */
    .scorecard-banner {
      background: linear-gradient(135deg, #10B981, #059669);
      color: #FFFFFF;
      padding: 1.25rem 1.5rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    .scorecard-banner.blocked {
      background: linear-gradient(135deg, #EF4444, #B91C1C);
    }
    .scorecard-text h3 {
      font-size: 1.15rem;
      font-weight: 800;
    }
    .scorecard-text p {
      font-size: 0.85rem;
      opacity: 0.95;
    }
    .scorecard-percent {
      font-size: 2.25rem;
      font-weight: 900;
    }
    .log-terminal {
      background: #0F172A;
      color: #38BDF8;
      font-family: monospace;
      padding: 1rem;
      border-radius: 0.5rem;
      font-size: 0.82rem;
      max-height: 320px;
      overflow-y: auto;
      white-space: pre-wrap;
      line-height: 1.4;
    }
  </style>
</head>
<body>

  <header>
    <div class="brand-box">
      <img src="/api/logo" alt="Atlas Geek" class="brand-logo">
      <div class="brand-title">
        <h1>Atlas Geek SOW Manager</h1>
        <p>Hyperscaler-Neutral Statement of Work Studio • Google Drive: <code>AG_Client</code></p>
      </div>
    </div>
    <div class="header-badges">
      <span class="badge badge-provider" id="activeProviderBadge">Cloud: Google Cloud PSF</span>
      <span class="badge badge-sync">🔄 Drive Synced: AG_Client</span>
    </div>
  </header>

  <div class="main-container">
    <!-- Sidebar: Search + 5 Recent Clients -->
    <aside>
      <div class="sidebar-header">
        <h2>Engagements</h2>
        <span id="clientCount" style="font-size:0.75rem; font-weight:700; color:var(--primary);">59+ Clients</span>
      </div>
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" id="clientSearch" class="search-input" placeholder="Search all 59+ clients..." oninput="handleSearch()">
      </div>
      <div class="client-list-label" id="listModeLabel">5 Most Recent</div>
      <ul class="client-list" id="clientList"></ul>
    </aside>

    <!-- Main Workspace -->
    <main>
      <!-- Configuration Card -->
      <section class="card">
        <div class="card-header">
          <div class="card-title">
            <span>⚙️</span>
            <span id="selectedClientTitle">Engagement Configuration</span>
          </div>
          <span class="badge badge-provider" id="governanceBadge">Google PSF 18-Point Compliant</span>
        </div>

        <!-- Hyperscaler Selector Tabs -->
        <label style="font-size:0.8rem; font-weight:700; color:var(--dark); margin-bottom:0.5rem; display:block;">
          Select Cloud Provider / Engagement Program:
        </label>
        <div class="provider-nav">
          <div class="provider-tab active" id="tab-google" onclick="setProvider('google')">
            <div class="provider-tab-header"><span>🌐</span> Google Cloud</div>
            <div class="provider-tab-sub">PSF / DAF (70/30 Model)</div>
          </div>
          <div class="provider-tab" id="tab-aws" onclick="setProvider('aws')">
            <div class="provider-tab-header"><span>🟧</span> AWS (Amazon)</div>
            <div class="provider-tab-sub">MAP 2.0 & Well-Architected</div>
          </div>
          <div class="provider-tab" id="tab-azure" onclick="setProvider('azure')">
            <div class="provider-tab-header"><span>🟦</span> Microsoft Azure</div>
            <div class="provider-tab-sub">AMMP & Cloud Adoption (CAF)</div>
          </div>
          <div class="provider-tab" id="tab-agnostic" onclick="setProvider('agnostic')">
            <div class="provider-tab-header"><span>⚡</span> Cloud Agnostic</div>
            <div class="provider-tab-sub">Enterprise Solution Arch</div>
          </div>
        </div>

        <div class="location-info">
          <div>
            <strong>Google Drive Folder:</strong>
            <span id="clientPathDisplay">Loading path...</span>
          </div>
          <button class="btn btn-outline" style="padding:0.3rem 0.75rem; font-size:0.75rem;" onclick="openFolder()">
            📂 Open in Finder / Drive
          </button>
        </div>

        <!-- Discovery & PRD Intake Workspace -->
        <label style="font-size:0.8rem; font-weight:700; color:var(--dark); margin-bottom:0.5rem; display:block;">
          PRD Documents & Discovery Intake (Saved into <code>INTERNAL/</code>):
        </label>
        <div class="intake-grid">
          <!-- File Dropzone -->
          <div class="dropzone" id="dropzone" onclick="document.getElementById('fileInput').click()">
            <input type="file" id="fileInput" style="display:none;" onchange="handleFileUpload(this.files)" accept=".docx,.md,.txt,.pdf,.json">
            <div class="dropzone-icon">📥</div>
            <div class="dropzone-title">Upload PRD or Transcript Document</div>
            <div class="dropzone-sub">Drag & drop or click to upload (.docx, .md, .txt, .pdf) directly to INTERNAL/</div>
          </div>

          <!-- Commentary / Context Box -->
          <div>
            <textarea id="contextNotes" class="notes-textarea" placeholder="Type or paste client context, transcript notes, specific constraints, or answers to open questions here..." oninput="triggerPrdAnalysis()"></textarea>
          </div>
        </div>

        <!-- Detected Inputs in INTERNAL/ and Action Button -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
          <div class="inputs-chip-row" id="inputsChipRow" style="margin-bottom:0;">
            <span style="font-size:0.8rem; color:var(--muted);">No input files found in INTERNAL/ yet.</span>
          </div>
          <button class="btn btn-outline" style="padding:0.45rem 0.9rem; font-size:0.8rem; font-weight:700;" onclick="triggerPrdAnalysis(true)">
            <span>🔍</span> Analyze PRD & Context Notes
          </button>
        </div>

        <!-- Gap Analyzer & Discovery Intelligence Card -->
        <div class="analyzer-box" id="analyzerBox">
          <div class="analyzer-header">
            <div class="analyzer-title">
              <span>🧠</span>
              <span>Intelligent Discovery & Gap Analysis</span>
            </div>
            <span id="analyzerConfidence" style="font-size:0.75rem; font-weight:600; color:var(--muted);">Analyzing...</span>
          </div>
          <div id="workloadChips" style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:0.6rem;"></div>
          <div id="gapAlerts"></div>
        </div>

        <!-- Parameters Grid -->
        <div class="form-grid">
          <div class="form-group">
            <label>Project Title</label>
            <input type="text" id="projectTitle" value="Cloud Modernization & Deployment">
          </div>
          <div class="form-group">
            <label id="typeSelectLabel">Engagement Scope / Program Type</label>
            <select id="engagementType"></select>
          </div>
          <div class="form-group">
            <label>Fixed Price Fee (USD)</label>
            <input type="number" id="feeInput" value="50000" step="1000" oninput="updateMilestones()">
          </div>
        </div>

        <!-- Dynamic Milestone Breakdown -->
        <div class="milestone-preview" id="milestonePreview"></div>

        <div class="action-row">
          <button class="btn btn-primary" id="btnGenerate" onclick="triggerGenerate()">
            <span>⚡</span> Generate SOW Document (.docx)
          </button>
          <button class="btn btn-outline" id="btnValidate" onclick="triggerValidate()">
            <span>🔍</span> Audit Compliance Checklist
          </button>
          <button class="btn btn-outline" onclick="openFolder()">
            <span>📂</span> Open EXTERNAL/ Deliverables
          </button>
        </div>
      </section>

      <!-- Deliverables & Output Files -->
      <section class="card">
        <div class="card-header">
          <div class="card-title">
            <span>📦</span>
            <span>Generated Deliverables in <code>EXTERNAL/</code></span>
          </div>
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <button class="btn btn-outline" style="padding:0.3rem 0.65rem; font-size:0.75rem;" onclick="cleanExternalFiles()">
              🧹 Clean Non-SOW Files
            </button>
            <span style="font-size:0.8rem; color:var(--muted);">Auto-synced to Google Drive</span>
          </div>
        </div>

        <div class="files-grid" id="deliverablesGrid">
          <p style="color:var(--muted); font-size:0.9rem;">Select an engagement to view deliverables.</p>
        </div>
      </section>

      <!-- Hyperscaler Audit Scorecard -->
      <section class="card" id="checklistSection" style="display:none;">
        <div class="card-header">
          <div class="card-title">
            <span>🛡️</span>
            <span id="scorecardHeading">Hyperscaler Compliance Scorecard</span>
          </div>
        </div>
        <div class="scorecard-banner" id="scorecardBanner">
          <div class="scorecard-text">
            <h3 id="scorecardTitle">Audit Status</h3>
            <p id="scorecardSubtitle">Itemized checklist details below.</p>
          </div>
          <div class="scorecard-percent" id="scorecardPct">100%</div>
        </div>
        <div class="log-terminal" id="checklistLog"></div>
      </section>
    </main>
  </div>

  <script>
    const SPECS = ${JSON.stringify(HYPERSCALER_SPECS)};

    let currentProvider = "google";
    let recentOffset = 0;
    const RECENT_LIMIT = 5;
    let recentClientsList = [];
    let currentClient = "";
    let isSearchActive = false;

    async function init() {
      setupDropzone();
      await loadRecentClients(false);

      // Select first recent client
      if (recentClientsList.length > 0) {
        selectClient(recentClientsList[0].name);
      }
      setProvider('google');
    }

    // Load top 5 recent clients
    async function loadRecentClients() {
      const res = await fetch('/api/clients?recent=true&limit=5');
      const data = await res.json();
      
      document.getElementById('clientCount').textContent = data.total + ' Total';
      recentClientsList = data.clients || [];
      document.getElementById('listModeLabel').textContent = '5 Most Recent';
      renderClients(recentClientsList);
    }

    // Client search handler
    async function handleSearch() {
      const q = document.getElementById('clientSearch').value.trim();
      if (!q) {
        isSearchActive = false;
        document.getElementById('listModeLabel').textContent = '5 Most Recent';
        renderClients(recentClientsList);
        return;
      }

      isSearchActive = true;
      document.getElementById('listModeLabel').textContent = 'Search Results';
      
      const res = await fetch('/api/clients?search=' + encodeURIComponent(q));
      const matches = await res.json();
      renderClients(matches.map(name => ({ name })));
    }

    function renderClients(items) {
      const listEl = document.getElementById('clientList');
      listEl.innerHTML = '';
      if (items.length === 0) {
        listEl.innerHTML = '<li style="font-size:0.8rem; color:var(--muted); padding:0.5rem;">No clients match.</li>';
        return;
      }
      items.forEach(c => {
        const li = document.createElement('li');
        li.className = 'client-item' + (c.name === currentClient ? ' active' : '');
        li.innerHTML = '<span>' + c.name + '</span><span>📁</span>';
        li.onclick = () => selectClient(c.name);
        listEl.appendChild(li);
      });
    }

    // Set Provider (Google, AWS, Azure, Agnostic)
    function setProvider(provider) {
      currentProvider = provider;
      const spec = SPECS[provider];

      // Update Tabs
      document.querySelectorAll('.provider-tab').forEach(t => t.classList.remove('active'));
      const activeTab = document.getElementById('tab-' + provider);
      if (activeTab) activeTab.classList.add('active');

      // Update Badges
      document.getElementById('activeProviderBadge').textContent = 'Cloud: ' + spec.name;
      document.getElementById('governanceBadge').textContent = spec.governingRules;

      // Populate engagement types
      const typeSelect = document.getElementById('engagementType');
      typeSelect.innerHTML = '';
      spec.engagementTypes.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        if (t === spec.defaultEngagementType) opt.selected = true;
        typeSelect.appendChild(opt);
      });

      // Update Title placeholder if default
      document.getElementById('projectTitle').value = spec.name + ' Modernization & Deployment';

      updateMilestones();
    }

    function updateMilestones() {
      const fee = parseFloat(document.getElementById('feeInput').value) || 0;
      const spec = SPECS[currentProvider];
      const previewEl = document.getElementById('milestonePreview');
      previewEl.innerHTML = '';

      let cumulative = 0;
      spec.milestoneSplit.forEach((m, idx) => {
        const isLast = idx === spec.milestoneSplit.length - 1;
        const amount = isLast ? (fee - cumulative) : Math.round(fee * m.pct);
        cumulative += amount;

        const item = document.createElement('div');
        item.className = 'milestone-item' + (idx % 2 === 1 ? ' accent' : '');
        item.innerHTML = 
          '<h4>' + m.name + ' (' + Math.round(m.pct * 100) + '%)</h4>' +
          '<p>$' + amount.toLocaleString() + ' USD</p>' +
          '<span style="font-size:0.72rem; color:var(--muted);">' + m.desc + '</span>';
        previewEl.appendChild(item);
      });
    }

    async function selectClient(clientName) {
      currentClient = clientName;
      
      // Update sidebar selection
      document.querySelectorAll('.client-item').forEach(el => {
        if (el.textContent.includes(clientName)) el.classList.add('active');
        else el.classList.remove('active');
      });

      document.getElementById('selectedClientTitle').textContent = clientName + ' — Configuration';
      
      const res = await fetch('/api/client?name=' + encodeURIComponent(clientName));
      const data = await res.json();

      document.getElementById('clientPathDisplay').textContent = data.clientDir;
      renderInputs(data.inputs);
      renderOutputs(data.outputs);
      
      if (data.checklistContent) {
        document.getElementById('checklistSection').style.display = 'block';
        document.getElementById('checklistLog').textContent = data.checklistContent;
      } else {
        document.getElementById('checklistSection').style.display = 'none';
      }

      await triggerPrdAnalysis();
    }

    function renderInputs(inputs) {
      const row = document.getElementById('inputsChipRow');
      row.innerHTML = '';
      if (!inputs || inputs.length === 0) {
        row.innerHTML = '<span style="font-size:0.8rem; color:var(--muted);">No input files found in INTERNAL/ yet. Drop or upload PRD files above.</span>';
        return;
      }
      inputs.forEach(f => {
        const chip = document.createElement('span');
        chip.className = 'input-chip';
        chip.innerHTML = '📄 ' + f.name + ' (' + Math.round(f.size / 1024) + ' KB)';
        row.appendChild(chip);
      });
    }

    // Trigger AI / Heuristic Discovery Analysis (Only when PRD document or commentary notes exist)
    async function triggerPrdAnalysis(isManual = false) {
      if (!currentClient) return;
      const notes = document.getElementById('contextNotes').value;
      const chipContainer = document.getElementById('workloadChips');
      const gapEl = document.getElementById('gapAlerts');
      
      const res = await fetch('/api/analyze-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: currentClient, contextNotes: notes }),
      });
      const data = await res.json();

      // If no readable input text is present, show clean waiting state!
      if (!data.hasInputs) {
        chipContainer.innerHTML = '';
        gapEl.innerHTML = '<div style="font-size:0.85rem; color:var(--muted); padding:0.4rem 0;">📥 <strong>Awaiting Inputs:</strong> Drop a PRD document (.docx, .txt, .md, .pdf) into INTERNAL/ or type context in the comment box above, then click <em>Analyze PRD & Context Notes</em>.</div>';
        document.getElementById('analyzerConfidence').textContent = 'Awaiting PRD or notes';
        if (isManual) {
          alert('Please upload a PRD file into INTERNAL/ or type context in the comment box first!');
        }
        return;
      }

      // Render Workloads actually found in the text
      chipContainer.innerHTML = '';
      data.workloads.forEach(w => {
        const c = document.createElement('span');
        c.className = 'workload-chip';
        c.innerHTML = w.icon + ' ' + w.name;
        chipContainer.appendChild(c);
      });

      // Update provider hint if detected
      if (data.detectedProvider && data.detectedProvider !== currentProvider) {
        document.getElementById('analyzerConfidence').innerHTML = 
          'Recommended Cloud: <strong style="color:var(--primary); cursor:pointer;" onclick="setProvider(\\'' + data.detectedProvider + '\\')">' + 
          SPECS[data.detectedProvider].name + ' (Click to Switch)</strong>';
      } else {
        document.getElementById('analyzerConfidence').textContent = data.workloads.length + ' workloads mapped from discovery input';
      }

      // Render Gaps found in the text
      gapEl.innerHTML = '';
      if (data.gaps.length === 0) {
        gapEl.innerHTML = '<div style="font-size:0.8rem; color:var(--success); font-weight:600;">✅ Discovery Complete: Sizing and core parameters detected in your inputs!</div>';
      } else {
        data.gaps.forEach(g => {
          const div = document.createElement('div');
          div.className = 'gap-item';
          div.innerHTML = 
            '<span>⚠️ <strong>' + g.category + ':</strong> ' + g.question + '</span>' +
            '<button class="gap-btn" onclick="injectGapHint(\\'' + g.hint.replace(/'/g, "\\\\'") + '\\')">+ Add Answer</button>';
          gapEl.appendChild(div);
        });
      }
    }

    function injectGapHint(hint) {
      const textarea = document.getElementById('contextNotes');
      if (textarea.value.trim()) {
        textarea.value += '\\n' + hint;
      } else {
        textarea.value = hint;
      }
      triggerPrdAnalysis();
    }

    // Dropzone setup
    function setupDropzone() {
      const dropzone = document.getElementById('dropzone');
      ['dragenter', 'dragover'].forEach(name => {
        dropzone.addEventListener(name, (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
      });
      ['dragleave', 'drop'].forEach(name => {
        dropzone.addEventListener(name, (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); });
      });
      dropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) handleFileUpload(files);
      });
    }

    // Upload file directly into AG_Client/<Client>/INTERNAL/
    async function handleFileUpload(files) {
      if (!currentClient) return alert('Please select a client first');
      const file = files[0];
      if (!file) return;

      const dropzone = document.getElementById('dropzone');
      dropzone.innerHTML = '<div class="dropzone-icon">⏳</div><div class="dropzone-title">Uploading ' + file.name + ' to INTERNAL/...</div>';

      try {
        const res = await fetch('/api/upload-input?client=' + encodeURIComponent(currentClient) + '&filename=' + encodeURIComponent(file.name), {
          method: 'POST',
          body: file,
        });
        const result = await res.json();
        if (result.success) {
          await selectClient(currentClient);
        } else {
          alert('Upload failed: ' + result.error);
        }
      } catch (e) {
        alert('Upload error: ' + e.message);
      } finally {
        dropzone.innerHTML = 
          '<div class="dropzone-icon">📥</div>' +
          '<div class="dropzone-title">Upload PRD or Transcript Document</div>' +
          '<div class="dropzone-sub">Drag & drop or click to upload (.docx, .md, .txt, .pdf) directly to INTERNAL/</div>';
      }
    }

    function renderOutputs(outputs) {
      const grid = document.getElementById('deliverablesGrid');
      grid.innerHTML = '';
      if (!outputs || outputs.length === 0) {
        grid.innerHTML = '<p style="color:var(--muted); font-size:0.9rem;">No deliverables generated yet in EXTERNAL/. Click "Generate SOW Document" above.</p>';
        return;
      }

      outputs.forEach(f => {
        const card = document.createElement('div');
        card.className = 'file-card';
        const sizeKb = Math.round(f.size / 1024);

        card.innerHTML = 
          '<div class="file-header">' +
            '<div class="file-icon">📝</div>' +
            '<div class="file-info">' +
              '<h3>' + f.name + '</h3>' +
              '<p>' + sizeKb + ' KB  •  Official SOW (.docx)</p>' +
            '</div>' +
          '</div>' +
          '<div class="file-actions">' +
            '<a href="/api/download?client=' + encodeURIComponent(currentClient) + '&file=' + encodeURIComponent(f.name) + '" class="file-btn file-btn-download" download>Download</a>' +
            '<button class="file-btn file-btn-open" onclick="openFile(\\'' + f.name + '\\')">Open Local</button>' +
          '</div>';

        grid.appendChild(card);
      });
    }

    async function cleanExternalFiles() {
      if (!currentClient) return;
      if (!confirm('Clean EXTERNAL/ folder to remove extraneous non-SOW files (.md, old slides, etc.) and keep only .docx SOW?')) return;
      const res = await fetch('/api/clean-outputs?client=' + encodeURIComponent(currentClient), { method: 'POST' });
      const data = await res.json();
      alert('Cleaned ' + (data.removed ? data.removed.length : 0) + ' extra files from EXTERNAL/. Folder is now pristine!');
      selectClient(currentClient);
    }

    async function triggerGenerate() {
      if (!currentClient) return alert('Please select a client');
      const btn = document.getElementById('btnGenerate');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span>⏳</span> Generating ' + SPECS[currentProvider].name + ' SOW into EXTERNAL/...';
      btn.disabled = true;

      const payload = {
        client: currentClient,
        provider: currentProvider,
        project: document.getElementById('projectTitle').value,
        type: document.getElementById('engagementType').value,
        fee: parseFloat(document.getElementById('feeInput').value) || 50000,
        contextNotes: document.getElementById('contextNotes').value,
      };

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          if (data.auditReport) {
            document.getElementById('checklistSection').style.display = 'block';
            document.getElementById('checklistLog').textContent = data.auditReport;
            document.getElementById('scorecardPct').textContent = data.score + '%';
            document.getElementById('scorecardTitle').textContent = SPECS[currentProvider].name + ' Audit: ' + data.status;
            document.getElementById('scorecardSubtitle').textContent = 'Live compliance scorecard verified in-memory.';
          }
          alert('✅ ' + SPECS[currentProvider].name + ' SOW Document saved into AG_Client/' + currentClient + '/EXTERNAL/ !');
          selectClient(currentClient);
        } else {
          alert('❌ Generation error: ' + data.error);
        }
      } catch (e) {
        alert('❌ Network error: ' + e.message);
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }

    async function triggerValidate() {
      if (!currentClient) return;
      const res = await fetch('/api/validate?client=' + encodeURIComponent(currentClient) + '&provider=' + encodeURIComponent(currentProvider));
      const data = await res.json();
      
      const section = document.getElementById('checklistSection');
      const banner = document.getElementById('scorecardBanner');
      section.style.display = 'block';
      document.getElementById('scorecardPct').textContent = data.score + '%';
      document.getElementById('scorecardTitle').textContent = data.standardName + ': ' + data.status;
      document.getElementById('scorecardSubtitle').textContent = data.passedCount + ' of ' + data.totalCount + ' quality criteria satisfied.';
      
      if (data.isCompliant) {
        banner.classList.remove('blocked');
      } else {
        banner.classList.add('blocked');
      }

      selectClient(currentClient);
    }

    function openFolder() {
      if (!currentClient) return;
      fetch('/api/open-folder?client=' + encodeURIComponent(currentClient));
    }

    function openFile(fileName) {
      fetch('/api/open-file?client=' + encodeURIComponent(currentClient) + '&file=' + encodeURIComponent(fileName));
    }

    window.onload = init;
  </script>
</body>
</html>`;
}

// Server Request Handler
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Serve Dashboard HTML
  if (pathname === "/" || pathname === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(renderDashboardHTML());
  }

  // Serve Logo
  if (pathname === "/api/logo") {
    if (fs.existsSync(BRAND.logoPath)) {
      res.writeHead(200, { "Content-Type": "image/png" });
      return fs.createReadStream(BRAND.logoPath).pipe(res);
    } else {
      res.writeHead(404);
      return res.end();
    }
  }

  // API: List Clients (supports recent limit/offset and search)
  if (pathname === "/api/clients") {
    const isRecent = parsedUrl.query.recent === "true";
    const limit = parsedUrl.query.limit ? parseInt(parsedUrl.query.limit, 10) : null;
    const offset = parsedUrl.query.offset ? parseInt(parsedUrl.query.offset, 10) : 0;
    const searchQuery = parsedUrl.query.search;

    if (searchQuery) {
      const matches = clientResolver.searchClients(searchQuery);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(matches));
    }

    if (isRecent) {
      const recentData = clientResolver.listRecentClients(limit, offset);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(recentData));
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(clientResolver.listClients()));
  }

  // API: Client Details
  if (pathname === "/api/client") {
    const clientName = parsedUrl.query.name;
    if (!clientName) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Missing client name" }));
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(getClientDetails(clientName)));
  }

  // API: Upload Input File into AG_Client/<Client>/INTERNAL/
  if (pathname === "/api/upload-input" && req.method === "POST") {
    const clientName = parsedUrl.query.client;
    const fileName = parsedUrl.query.filename || "discovery-input.txt";

    if (!clientName) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Missing client name" }));
    }

    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const buffer = Buffer.concat(chunks);
        const saved = clientResolver.saveInputFile(clientName, fileName, buffer);
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ success: true, file: saved }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API: Analyze PRD and Discovery Inputs
  if (pathname === "/api/analyze-prd" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { client, contextNotes } = JSON.parse(body);
        const inputs = clientResolver.getInputFiles(client);
        const filePaths = inputs.map((f) => f.fullPath);
        const analysis = await prdAnalyzer.analyzeDiscovery(filePaths, contextNotes);
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(analysis));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API: Generate Hyperscaler SOW & Parity Markdown
  if (pathname === "/api/generate" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { client, provider = "google", project, type, fee, contextNotes = "" } = JSON.parse(body);
        const dateStr = new Date().toISOString().split("T")[0];
        const paths = clientResolver.getClientPaths(client);
        const outputsDir = paths.outputDir;
        if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });

        // Build SOW
        const sowBuilder = new SowBuilder({
          client,
          provider,
          project,
          engagementType: type,
          totalFee: fee,
          date: dateStr,
          contextNotes,
        });

        const doc = sowBuilder.buildDocument({
          client,
          provider,
          project,
          engagementType: type,
          totalFee: fee,
          contextNotes,
        });

        const safeClientName = client.toLowerCase().replace(/[\s_-]+/g, "_");
        const docxFileName = `sow-${safeClientName}.docx`;
        const docxPath = path.join(outputsDir, docxFileName);
        await sowBuilder.saveToFile(doc, docxPath);

        // Perform Validation Audit In-Memory (No cluttered .md files in EXTERNAL/)
        const { markdown } = await convertDocxToMarkdown(docxPath);
        const validator = new SowValidator();
        const validation = validator.validate(markdown, {
          client,
          provider,
          project,
          partner: BRAND.name,
        });
        const auditReport = validator.generateReport(validation, { client, project, provider });

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            success: true,
            score: validation.score,
            status: validation.status,
            docxFileName,
            auditReport,
          })
        );
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API: Validate SOW
  if (pathname === "/api/validate") {
    const client = parsedUrl.query.client;
    const provider = parsedUrl.query.provider || "google";
    const paths = clientResolver.getClientPaths(client);
    const outputs = clientResolver.getOutputFiles(client);
    const docxFile = outputs.find((f) => f.isDocx && (f.name.includes(provider) || !f.name.includes("-aws-") && !f.name.includes("-azure-")));
    
    if (!docxFile) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "SOW file not found in EXTERNAL/" }));
    }
    const { markdown } = await convertDocxToMarkdown(docxFile.fullPath);
    const validator = new SowValidator();
    const result = validator.validate(markdown, { client, provider, partner: BRAND.name });
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(result));
  }

  // API: Download file
  if (pathname === "/api/download") {
    const { client, file } = parsedUrl.query;
    const paths = clientResolver.getClientPaths(client);
    const filePath = path.join(paths.outputDir, file);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      return res.end("File not found");
    }
    res.writeHead(200, {
      "Content-Disposition": `attachment; filename="${file}"`,
      "Content-Type": "application/octet-stream",
    });
    return fs.createReadStream(filePath).pipe(res);
  }

  // API: Reveal folder in macOS Finder (Google Drive desktop folder)
  if (pathname === "/api/open-folder") {
    const client = parsedUrl.query.client;
    const paths = clientResolver.getClientPaths(client);
    const targetDir = fs.existsSync(paths.outputDir) ? paths.outputDir : paths.clientDir;
    exec(`open "${targetDir}"`);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ success: true }));
  }

  // API: Open specific file in default desktop app
  if (pathname === "/api/open-file") {
    const { client, file } = parsedUrl.query;
    const paths = clientResolver.getClientPaths(client);
    const filePath = path.join(paths.outputDir, file);
    exec(`open "${filePath}"`);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ success: true }));
  }

  // API: Clean non-SOW files (.md, .pptx, audits) from EXTERNAL/
  if (pathname === "/api/clean-outputs" && req.method === "POST") {
    const client = parsedUrl.query.client;
    if (!client) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Missing client" }));
    }
    const removed = clientResolver.cleanOutputs(client);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ success: true, removed }));
  }

  res.writeHead(404);
  res.end();
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🌐 ATLAS GEEK SOW MANAGER WEB DASHBOARD IS LIVE!`);
    console.log(`======================================================`);
    console.log(`📁 Connected to Google Drive folder: AG_Client`);
    console.log(`👉 Open your browser to: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
  });
}

module.exports = server;
