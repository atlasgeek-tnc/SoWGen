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

  // Get clients sorted by last modified time (most recent first)
  listRecentClients(limit = null, offset = 0) {
    if (!fs.existsSync(this.baseDir)) return [];
    const clientsWithStats = fs
      .readdirSync(this.baseDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => {
        const fullPath = path.join(this.baseDir, entry.name);
        try {
          const stats = fs.statSync(fullPath);
          return {
            name: entry.name,
            mtime: stats.mtime,
          };
        } catch (e) {
          return { name: entry.name, mtime: new Date(0) };
        }
      })
      .sort((a, b) => b.mtime - a.mtime);

    const total = clientsWithStats.length;
    const paged = limit ? clientsWithStats.slice(offset, offset + limit) : clientsWithStats.slice(offset);
    return {
      total,
      hasMore: offset + paged.length < total,
      clients: paged.map((c) => ({
        name: c.name,
        mtime: c.mtime.toISOString(),
      })),
    };
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

  // Get all deliverable files inside outputDir (strictly .docx files)
  getOutputFiles(clientName) {
    const { outputDir } = this.getClientPaths(clientName);
    if (!fs.existsSync(outputDir)) return [];

    return fs
      .readdirSync(outputDir, { withFileTypes: true })
      .filter((entry) => !entry.isDirectory() && entry.name.endsWith(".docx") && !entry.name.startsWith("."))
      .map((entry) => {
        const fullPath = path.join(outputDir, entry.name);
        const stats = fs.statSync(fullPath);
        return {
          name: entry.name,
          fullPath,
          size: stats.size,
          updatedAt: stats.mtime.toISOString(),
          isDocx: true,
        };
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  // Remove unwanted non-docx files (.md, .pptx) from EXTERNAL to keep folder clean
  cleanOutputs(clientName) {
    const { outputDir } = this.getClientPaths(clientName);
    if (!fs.existsSync(outputDir)) return [];
    const removed = [];
    const entries = fs.readdirSync(outputDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() && !entry.name.endsWith(".docx") && !entry.name.startsWith(".")) {
        const p = path.join(outputDir, entry.name);
        try {
          fs.unlinkSync(p);
          removed.push(entry.name);
        } catch (e) {}
      }
    }
    return removed;
  }

  // Search across all clients matching query
  searchClients(query = "") {
    const all = this.listClients();
    if (!query || !query.trim()) return all;
    const q = query.trim().toLowerCase();
    return all.filter((name) => name.toLowerCase().includes(q));
  }

  // Save an uploaded input file (PRD, transcript, doc) into client's INTERNAL folder
  saveInputFile(clientName, fileName, buffer) {
    const { clientDir, inputDir } = this.getClientPaths(clientName);
    // Ensure target input directory is specifically INTERNAL if possible
    let targetDir = inputDir;
    if (path.basename(targetDir) !== "INTERNAL" && path.basename(targetDir) !== "Internal" && path.basename(targetDir) !== "INT") {
      targetDir = path.join(clientDir, "INTERNAL");
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
    }

    const safeFileName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
    const targetPath = path.join(targetDir, safeFileName);
    fs.writeFileSync(targetPath, buffer);
    return {
      name: safeFileName,
      fullPath: targetPath,
      size: buffer.length,
      relativePath: path.relative(clientDir, targetPath),
    };
  }
}

module.exports = new ClientResolver();
