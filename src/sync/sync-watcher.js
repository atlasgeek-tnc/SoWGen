const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const { convertDocxToMarkdown } = require("./docx-to-md");

class SyncWatcher {
  constructor(options = {}) {
    this.targetDir = options.targetDir || path.resolve(__dirname, "../../clients");
    this.clientFilter = options.client || null;
    this.isWatching = false;
  }

  start() {
    console.log(`\n🔄 [SOW Sync Watcher] Starting Google Drive Desktop Sync Watcher...`);
    console.log(`📁 Monitoring directory: ${this.targetDir}`);
    if (this.clientFilter) {
      console.log(`🎯 Filtered to client: ${this.clientFilter}`);
    }

    // Debounce map to avoid thrashing during file writes
    const debounceMap = new Map();

    const watcher = chokidar.watch(this.targetDir, {
      ignored: /(^|[\/\\])\..|node_modules/, // ignore dotfiles and node_modules
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 200,
      },
    });

    watcher.on("change", async (filePath) => {
      if (!filePath.endsWith(".docx")) return;
      if (this.clientFilter && !filePath.includes(this.clientFilter)) return;

      const baseName = path.basename(filePath);
      console.log(`\n🔔 Detected update to DOCX: ${baseName}`);
      console.log(`   (Synced via Google Drive Desktop from Google Docs online)`);

      const mdPath = filePath.replace(/\.docx$/, ".md");
      try {
        console.log(`   Extracting updated content to Markdown: ${path.basename(mdPath)}...`);
        await convertDocxToMarkdown(filePath, { outputPath: mdPath });
        console.log(`   ✅ Successfully synchronized online Google Docs edits to local Markdown!`);
      } catch (err) {
        console.error(`   ❌ Error updating markdown:`, err.message);
      }
    });

    watcher.on("ready", () => {
      this.isWatching = true;
      console.log(`✅ [SOW Sync Watcher] Active and listening for Google Drive sync changes.`);
      console.log(`   Edits made in Google Docs online will automatically reflect in local .md files.\n`);
    });

    return watcher;
  }
}

module.exports = SyncWatcher;
