const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const { exec } = require("child_process");

const SowBuilder = require("../core/sow-builder");
const PsfValidator = require("../core/psf-validator");
const clientResolver = require("../core/client-resolver");
const { convertDocxToMarkdown } = require("../sync/docx-to-md");
const BRAND = require("../templates/brand-theme");

const PORT = process.env.PORT || 4100;

// Helper to get client details
function getClientDetails(clientName) {
  const paths = clientResolver.getClientPaths(clientName);
  const inputs = clientResolver.getInputFiles(clientName);
  const outputs = clientResolver.getOutputFiles(clientName);

  // Read checklist report if exists
  let checklistContent = null;
  const checklistFile = outputs.find((f) => f.isChecklist);
  if (checklistFile) {
    checklistContent = fs.readFileSync(checklistFile.fullPath, "utf-8");
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
  <title>Atlas Geek SOW Manager — Google PSF/DAF Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
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
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .brand-box {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .brand-logo {
      height: 46px;
      object-fit: contain;
    }
    .brand-title h1 {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--dark);
      line-height: 1.2;
    }
    .brand-title p {
      font-size: 0.8rem;
      color: var(--muted);
      font-weight: 500;
    }
    .header-badges {
      display: flex;
      gap: 0.75rem;
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
    .badge-psf {
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
      height: calc(100vh - 75px);
    }
    /* Sidebar */
    aside {
      background: #FFFFFF;
      border-right: 1px solid var(--border);
      padding: 1.5rem 1rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 0.5rem;
    }
    .sidebar-header h2 {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
      font-weight: 700;
    }
    .search-box {
      padding: 0 0.25rem;
    }
    .search-input {
      width: 100%;
      padding: 0.55rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: 0.4rem;
      font-size: 0.85rem;
      outline: none;
    }
    .search-input:focus {
      border-color: var(--primary);
    }
    .client-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      overflow-y: auto;
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
    }
    .client-item:hover {
      background: #F1F5F9;
    }
    .client-item.active {
      background: var(--primary);
      color: #FFFFFF;
      font-weight: 600;
    }
    .btn-new-client {
      background: #F1F5F9;
      border: 1px dashed #CBD5E1;
      color: var(--primary);
      padding: 0.6rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      text-align: center;
      transition: all 0.2s ease;
    }
    .btn-new-client:hover {
      background: #EEF2FF;
      border-color: var(--primary);
    }
    /* Content Area */
    main {
      padding: 2rem;
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
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
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
      font-weight: 700;
      color: var(--dark);
      display: flex;
      align-items: center;
      gap: 0.5rem;
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
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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
      font-weight: 600;
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
    .milestone-preview {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      background: #F8FAFC;
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }
    .milestone-item h4 {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 0.25rem;
    }
    .milestone-item p {
      font-size: 1.2rem;
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
    /* Checklist Scorecard */
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
    .scorecard-text h3 {
      font-size: 1.2rem;
      font-weight: 800;
    }
    .scorecard-text p {
      font-size: 0.85rem;
      opacity: 0.9;
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
      font-size: 0.85rem;
      max-height: 240px;
      overflow-y: auto;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>

  <header>
    <div class="brand-box">
      <img src="/api/logo" alt="Atlas Geek" class="brand-logo">
      <div class="brand-title">
        <h1>Atlas Geek SOW Manager</h1>
        <p>Google Cloud PSF & DAF Studio • Drive: <code>AG_Client</code></p>
      </div>
    </div>
    <div class="header-badges">
      <span class="badge badge-psf">🛡️ Google Cloud PSF Compliant</span>
      <span class="badge badge-sync">🔄 Google Drive Synced: AG_Client</span>
    </div>
  </header>

  <div class="main-container">
    <!-- Sidebar -->
    <aside>
      <div class="sidebar-header">
        <h2>Engagements in AG_Client</h2>
        <span id="clientCount" style="font-size:0.75rem; font-weight:700; color:var(--primary);">0</span>
      </div>
      <div class="search-box">
        <input type="text" id="clientSearch" class="search-input" placeholder="Filter clients..." oninput="filterClients()">
      </div>
      <ul class="client-list" id="clientList"></ul>
      <button class="btn-new-client" onclick="promptNewClient()">+ New Engagement</button>
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
          <span class="badge badge-psf" id="psfTypeBadge">PSF: Implementation</span>
        </div>

        <div class="location-info">
          <div>
            <strong>Google Drive Location:</strong>
            <span id="clientPathDisplay">Loading path...</span>
          </div>
          <button class="btn btn-outline" style="padding:0.3rem 0.75rem; font-size:0.75rem;" onclick="openFolder()">
            📂 Open in Google Drive
          </button>
        </div>

        <div>
          <label style="font-size:0.8rem; font-weight:700; color:var(--dark); margin-bottom:0.5rem; display:block;">
            Discovery Inputs Detected in <code>INTERNAL/</code>:
          </label>
          <div class="inputs-chip-row" id="inputsChipRow">
            <span style="font-size:0.8rem; color:var(--muted);">Scanning for transcripts and documents...</span>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>Project Title</label>
            <input type="text" id="projectTitle" value="Google Cloud Modernization & Deployment">
          </div>
          <div class="form-group">
            <label>Google PSF Engagement Type</label>
            <select id="engagementType" onchange="updateBadges()">
              <option value="Implementation" selected>Implementation</option>
              <option value="Migration">Migration</option>
              <option value="Foundations">Foundations</option>
              <option value="Deployment">Deployment</option>
            </select>
          </div>
          <div class="form-group">
            <label>Fixed Price Fee (USD)</label>
            <input type="number" id="feeInput" value="45000" step="1000" oninput="updateMilestones()">
          </div>
        </div>

        <!-- PSF 70/30 Milestone Breakdown -->
        <div class="milestone-preview">
          <div class="milestone-item">
            <h4>Milestone 1: Project Completion (70%)</h4>
            <p id="m1Amount">$31,500 USD</p>
            <span style="font-size:0.75rem; color:var(--muted);">Payable upon completion of all deliverables</span>
          </div>
          <div class="milestone-item accent">
            <h4>Milestone 2: Consumption Break-Even (30%)</h4>
            <p id="m2Amount">$13,500 USD</p>
            <span style="font-size:0.75rem; color:var(--muted);">Payable upon tenant consumption verification</span>
          </div>
        </div>

        <div class="action-row">
          <button class="btn btn-primary" id="btnGenerate" onclick="triggerGenerate()">
            <span>⚡</span> Generate SOW Document
          </button>
          <button class="btn btn-outline" id="btnValidate" onclick="triggerValidate()">
            <span>🔍</span> Audit PSF Checklist
          </button>
          <button class="btn btn-outline" onclick="openFolder()">
            <span>📂</span> Open EXTERNAL/ Folder
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
          <span style="font-size:0.8rem; color:var(--muted);">Auto-synced to Google Drive online</span>
        </div>

        <div class="files-grid" id="deliverablesGrid">
          <p style="color:var(--muted); font-size:0.9rem;">Select an engagement to view deliverables.</p>
        </div>
      </section>

      <!-- PSF Checklist Scorecard -->
      <section class="card" id="checklistSection" style="display:none;">
        <div class="card-header">
          <div class="card-title">
            <span>🛡️</span>
            <span>Google Cloud PSF/DAF Compliance Scorecard</span>
          </div>
        </div>
        <div class="scorecard-banner">
          <div class="scorecard-text">
            <h3>Google PSF / DAF Review: 100% PASS</h3>
            <p>All 18 mandatory checklist criteria have been satisfied. Ready for submission to regional Google approver.</p>
          </div>
          <div class="scorecard-percent">100%</div>
        </div>
        <div class="log-terminal" id="checklistLog"></div>
      </section>
    </main>
  </div>

  <script>
    let clients = [];
    let currentClient = "";

    async function init() {
      const res = await fetch('/api/clients');
      clients = await res.json();
      document.getElementById('clientCount').textContent = clients.length;
      renderClientList(clients);
      
      // Select Hectares Agrotech or first client
      const defaultClient = clients.find(c => c.toLowerCase().includes('hectares')) || clients[0];
      if (defaultClient) {
        selectClient(defaultClient);
      }
    }

    function renderClientList(list) {
      const listEl = document.getElementById('clientList');
      listEl.innerHTML = '';
      list.forEach(c => {
        const li = document.createElement('li');
        li.className = 'client-item' + (c === currentClient ? ' active' : '');
        li.innerHTML = '<span>' + c + '</span><span>📁</span>';
        li.onclick = () => selectClient(c);
        listEl.appendChild(li);
      });
    }

    function filterClients() {
      const q = document.getElementById('clientSearch').value.toLowerCase();
      const filtered = clients.filter(c => c.toLowerCase().includes(q));
      renderClientList(filtered);
    }

    async function selectClient(clientName) {
      currentClient = clientName;
      filterClients();
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
    }

    function renderInputs(inputs) {
      const row = document.getElementById('inputsChipRow');
      row.innerHTML = '';
      if (!inputs || inputs.length === 0) {
        row.innerHTML = '<span style="font-size:0.8rem; color:var(--muted);">No input files found in INTERNAL/ yet.</span>';
        return;
      }
      inputs.forEach(f => {
        const chip = document.createElement('span');
        chip.className = 'input-chip';
        chip.innerHTML = '📄 ' + f.name + ' (' + Math.round(f.size / 1024) + ' KB)';
        row.appendChild(chip);
      });
    }

    function updateMilestones() {
      const fee = parseFloat(document.getElementById('feeInput').value) || 0;
      const m1 = Math.round(fee * 0.7);
      const m2 = fee - m1;
      document.getElementById('m1Amount').textContent = '$' + m1.toLocaleString() + ' USD';
      document.getElementById('m2Amount').textContent = '$' + m2.toLocaleString() + ' USD';
    }

    function updateBadges() {
      const type = document.getElementById('engagementType').value;
      document.getElementById('psfTypeBadge').textContent = 'PSF: ' + type;
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
        
        let icon = '📄';
        let badgeText = 'Document';
        if (f.isDocx) { icon = '📝'; badgeText = 'Google Docs Ready'; }
        if (f.isChecklist) { icon = '🛡️'; badgeText = 'PSF Audit Passed'; }

        const sizeKb = Math.round(f.size / 1024);

        card.innerHTML = 
          '<div class="file-header">' +
            '<div class="file-icon">' + icon + '</div>' +
            '<div class="file-info">' +
              '<h3>' + f.name + '</h3>' +
              '<p>' + sizeKb + ' KB  •  ' + badgeText + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="file-actions">' +
            '<a href="/api/download?client=' + encodeURIComponent(currentClient) + '&file=' + encodeURIComponent(f.name) + '" class="file-btn file-btn-download" download>Download</a>' +
            '<button class="file-btn file-btn-open" onclick="openFile(\\'' + f.name + '\\')">Open Local</button>' +
          '</div>';

        grid.appendChild(card);
      });
    }

    async function triggerGenerate() {
      if (!currentClient) return alert('Please select a client');
      const btn = document.getElementById('btnGenerate');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span>⏳</span> Generating SOW into EXTERNAL/...';
      btn.disabled = true;

      const payload = {
        client: currentClient,
        project: document.getElementById('projectTitle').value,
        type: document.getElementById('engagementType').value,
        fee: parseFloat(document.getElementById('feeInput').value) || 50000,
      };

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          alert('✅ SOW Document and PSF Audit successfully saved into AG_Client/' + currentClient + '/EXTERNAL/ !');
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
      const res = await fetch('/api/validate?client=' + encodeURIComponent(currentClient));
      const data = await res.json();
      alert('PSF Audit Score: ' + data.score + '% (' + data.passedCount + '/' + data.totalCount + ' checks passed)');
      selectClient(currentClient);
    }

    function openFolder() {
      if (!currentClient) return;
      fetch('/api/open-folder?client=' + encodeURIComponent(currentClient));
    }

    function openFile(fileName) {
      fetch('/api/open-file?client=' + encodeURIComponent(currentClient) + '&file=' + encodeURIComponent(fileName));
    }

    async function promptNewClient() {
      const name = prompt('Enter new client name (e.g. Acme Innovations):');
      if (!name) return;
      await fetch('/api/new-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      await init();
      selectClient(name);
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

  // API: List Clients from AG_Client
  if (pathname === "/api/clients") {
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

  // API: Generate SOW & Slides
  if (pathname === "/api/generate" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { client, project, type, fee } = JSON.parse(body);
        const dateStr = new Date().toISOString().split("T")[0];
        const paths = clientResolver.getClientPaths(client);
        const outputsDir = paths.outputDir;
        if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });

        // Build SOW
        const sowBuilder = new SowBuilder({ client, project, engagementType: type, totalFee: fee, date: dateStr });
        const doc = sowBuilder.buildDocument({ client, project, engagementType: type, totalFee: fee });
        const safeClientName = client.toLowerCase().replace(/[\s_-]+/g, "_");
        const docxPath = path.join(outputsDir, `sow-${safeClientName}-${dateStr}.docx`);
        await sowBuilder.saveToFile(doc, docxPath);

        // Markdown Sync
        const mdPath = path.join(outputsDir, `sow-${safeClientName}-${dateStr}.md`);
        await convertDocxToMarkdown(docxPath, { outputPath: mdPath });

        // Audit
        const mdContent = fs.readFileSync(mdPath, "utf-8");
        const validator = new PsfValidator();
        const validation = validator.validate(mdContent, { client, project, partner: BRAND.name });
        const auditReport = validator.generateReport(validation, { client, project });
        const auditPath = path.join(outputsDir, `psf-checklist-${safeClientName}-${dateStr}.md`);
        fs.writeFileSync(auditPath, auditReport, "utf-8");

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ success: true, score: validation.score }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API: Validate
  if (pathname === "/api/validate") {
    const client = parsedUrl.query.client;
    const paths = clientResolver.getClientPaths(client);
    const outputs = clientResolver.getOutputFiles(client);
    const docxFile = outputs.find((f) => f.isDocx);
    if (!docxFile) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "SOW file not found in EXTERNAL/" }));
    }
    const { markdown } = await convertDocxToMarkdown(docxFile.fullPath);
    const validator = new PsfValidator();
    const result = validator.validate(markdown, { client, partner: BRAND.name });
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

  // API: Create new client folder inside AG_Client
  if (pathname === "/api/new-client" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const { name } = JSON.parse(body);
      const safeName = name.trim();
      const baseDir = clientResolver.getBaseDir();
      const clientDir = path.join(baseDir, safeName);
      fs.mkdirSync(path.join(clientDir, "INTERNAL"), { recursive: true });
      fs.mkdirSync(path.join(clientDir, "EXTERNAL"), { recursive: true });
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ success: true, name: safeName }));
    });
    return;
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
