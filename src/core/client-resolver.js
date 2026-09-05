const fs = require("fs");
const path = require("path");

// Primary location: AG_Client on Google Drive
const PRIMARY_AG_CLIENT_DIR = "/Users/aloksingh/Library/CloudStorage/GoogleDrive-business@atlasgeek.in/My Drive/AG_Client";
// Local fallback within PRD_SOW_Agent
const FALLBACK_LOCAL_CLIENT_DIR = path.resolve(__dirname, "../../clients");

class ClientResolver {
  constructor(customBaseDir = null) {
    if (customBaseDir && fs.existsSync(customBaseDir)) {
      this.baseDir = customBaseDir;
    } else if (fs.existsSync(PRIMARY_AG_CLIENT_DIR)) {
      this.baseDir = PRIMARY_AG_CLIENT_DIR;
    } else {
      this.baseDir = FALLBACK_LOCAL_CLIENT_DIR;
    }
  }

  getBaseDir() {
    return this.baseDir;
  }

  // Get all client folder names
  listClients() {
    if (!fs.existsSync(this.baseDir)) return [];
    return fs
      .readdirSync(this.baseDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }

  // Resolve directory structure for a specific client
  getClientPaths(clientName) {
    // Exact match first, then case-insensitive / normalized match
    let matchedFolder = clientName;
    const allClients = this.listClients();
    const found = allClients.find(
      (c) =>
        c.toLowerCase() === clientName.toLowerCase() ||
        c.toLowerCase().replace(/[\s_-]+/g, "") === clientName.toLowerCase().replace(/[\s_-]+/g, "")
    );
    if (found) {
      matchedFolder = found;
    }

    const clientDir = path.join(this.baseDir, matchedFolder);
    if (!fs.existsSync(clientDir)) {
      fs.mkdirSync(clientDir, { recursive: true });
    }

    // Resolve INPUT directory: checks INTERNAL, Internal, INT, inputs, Docs, or clientDir root
    const potentialInputDirs = ["INTERNAL", "Internal", "INT", "inputs", "Docs"];
    let inputDir = clientDir;
    for (const sub of potentialInputDirs) {
      const p = path.join(clientDir, sub);
      if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
        inputDir = p;
        break;
      }
    }

    // Resolve OUTPUT directory: checks EXTERNAL, External, EXT, outputs, or clientDir root
    const potentialOutputDirs = ["EXTERNAL", "External", "EXT", "outputs"];
    let outputDir = null;
    for (const sub of potentialOutputDirs) {
      const p = path.join(clientDir, sub);
      if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
        outputDir = p;
        break;
      }
    }
    // If no external folder exists, create EXTERNAL
    if (!outputDir) {
      outputDir = path.join(clientDir, "EXTERNAL");
      fs.mkdirSync(outputDir, { recursive: true });
    }

    return {
      clientName: matchedFolder,
      clientDir,
      inputDir,
      outputDir,
    };
  }

  // Get all input files recursively inside inputDir and clientDir
  getInputFiles(clientName) {
    const { clientDir, inputDir } = this.getClientPaths(clientName);
    const files = [];

    const scanDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name === "EXTERNAL" || entry.name === "External" || entry.name === "outputs") {
          continue;
        }
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else {
          files.push({
            name: entry.name,
            fullPath,
            size: fs.statSync(fullPath).size,
            relativePath: path.relative(clientDir, fullPath),
          });
        }
      }
    };

    scanDir(clientDir);
    return files;
  }

  // Get all output files inside outputDir
  getOutputFiles(clientName) {
    const { outputDir } = this.getClientPaths(clientName);
    if (!fs.existsSync(outputDir)) return [];

    return fs
      .readdirSync(outputDir, { withFileTypes: true })
      .filter((entry) => !entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => {
        const fullPath = path.join(outputDir, entry.name);
        const stats = fs.statSync(fullPath);
        return {
          name: entry.name,
          fullPath,
          size: stats.size,
          updatedAt: stats.mtime.toISOString(),
          isDocx: entry.name.endsWith(".docx"),
          isPptx: entry.name.endsWith(".pptx"),
          isMd: entry.name.endsWith(".md"),
          isChecklist: entry.name.startsWith("psf-checklist-"),
        };
      });
  }
}

module.exports = new ClientResolver();
