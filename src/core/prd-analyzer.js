const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");

class PrdAnalyzer {
  constructor() {}

  /**
   * Extract text from a file (.md, .txt, .docx, or json)
   */
  async extractFileText(filePath) {
    if (!fs.existsSync(filePath)) return "";
    const ext = path.extname(filePath).toLowerCase();

    try {
      if (ext === ".docx") {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value || "";
      } else if (ext === ".md" || ext === ".txt" || ext === ".json" || ext === ".csv") {
        return fs.readFileSync(filePath, "utf-8");
      } else {
        // For other formats (like pdf), read as utf-8 or extract printable strings
        const buffer = fs.readFileSync(filePath);
        // Extract basic ASCII strings if binary
        return buffer.toString("utf-8").replace(/[^\x20-\x7E\t\n\r]/g, " ");
      }
    } catch (e) {
      console.warn(`Could not extract text from ${filePath}:`, e.message);
      return "";
    }
  }

  /**
   * Analyze all discovery inputs in client's internal directory + user context notes
   * @param {string[]} filePaths - Array of absolute file paths to input documents
   * @param {string} userNotes - Free-form commentary / notes entered in UI
   * @returns {Promise<object>} Analysis results with extracted info, gaps, and suggested questions
   */
  async analyzeDiscovery(filePaths = [], userNotes = "") {
    let combinedText = "";

    for (const fp of filePaths) {
      const text = await this.extractFileText(fp);
      if (text) {
        combinedText += `\n--- SOURCE FILE: ${path.basename(fp)} ---\n` + text;
      }
    }

    if (userNotes && userNotes.trim()) {
      combinedText += `\n--- USER CONTEXT NOTES ---\n` + userNotes.trim();
    }

    const norm = combinedText.toLowerCase();

    // 1. Detect Hyperscaler Preference if present
    let detectedProvider = null;
    let providerConfidence = "neutral";
    const googleMentions = (norm.match(/google cloud|gcp|bigquery|gke|cloud sql|vertex|psf|daf/g) || []).length;
    const awsMentions = (norm.match(/aws|amazon web services|ec2|s3|rds|eks|map 2\.0|lambda/g) || []).length;
    const azureMentions = (norm.match(/azure|microsoft cloud|entra|aks|cosmos|ammp|caf/g) || []).length;

    if (googleMentions > awsMentions && googleMentions > azureMentions && googleMentions >= 2) {
      detectedProvider = "google";
      providerConfidence = `High (Google Cloud mentions: ${googleMentions})`;
    } else if (awsMentions > googleMentions && awsMentions > azureMentions && awsMentions >= 2) {
      detectedProvider = "aws";
      providerConfidence = `High (AWS mentions: ${awsMentions})`;
    } else if (azureMentions > googleMentions && azureMentions > awsMentions && azureMentions >= 2) {
      detectedProvider = "azure";
      providerConfidence = `High (Azure mentions: ${azureMentions})`;
    }

    // 2. Extract Key Workloads & Components
    const workloads = [];
    if (/kubernetes|gke|eks|aks|container|docker/i.test(combinedText)) {
      workloads.push({ name: "Container Orchestration / Kubernetes", type: "Compute", icon: "☸️" });
    }
    if (/database|postgres|mysql|sql server|oracle|rds|cloud sql/i.test(combinedText)) {
      workloads.push({ name: "Relational Database Migration & Managed SQL", type: "Database", icon: "🗄️" });
    }
    if (/bigquery|redshift|snowflake|data warehouse|etl|pipeline|analytics/i.test(combinedText)) {
      workloads.push({ name: "Modern Data Platform & Analytics", type: "Data", icon: "📊" });
    }
    if (/terraform|infrastructure as code|iac|landing zone/i.test(combinedText)) {
      workloads.push({ name: "Terraform Infrastructure as Code (IaC) & Landing Zone", type: "DevOps", icon: "🏗️" });
    }
    if (/ci\/cd|github actions|gitlab|jenkins|devops/i.test(combinedText)) {
      workloads.push({ name: "Automated CI/CD Deployment Pipelines", type: "DevOps", icon: "🚀" });
    }
    if (/ai|llm|machine learning|vertex|rag|bedrock/i.test(combinedText)) {
      workloads.push({ name: "GenAI & Foundation Model Integration", type: "AI/ML", icon: "🤖" });
    }
    if (/security|iam|vpn|vpc|firewall|waf|compliance/i.test(combinedText)) {
      workloads.push({ name: "Zero-Trust Cloud Security, Networking & IAM", type: "Security", icon: "🛡️" });
    }

    // Default workload if none detected
    if (workloads.length === 0) {
      workloads.push({ name: "Cloud Infrastructure Modernization & Migration", type: "Core", icon: "☁️" });
    }

    // 3. Gap Detection & Clarifying Questions
    const gaps = [];

    // Check Sizing & Inventory
    const hasSizing = /(vcpus|ram|gb|tb|instances|cores|nodes|tps|rps|\d+\s*(vm|vms|servers|nodes))/i.test(combinedText);
    if (!hasSizing) {
      gaps.push({
        id: "WORKLOAD_SIZING",
        category: "Architecture & Sizing",
        severity: "medium",
        question: "What is the approximate size/scale of the in-scope workloads (e.g., number of VMs/servers, database sizes in GB/TB, or traffic throughput)?",
        hint: "Example: 4 application VMs (16 vCPU, 64GB RAM), 1 managed PostgreSQL DB (500GB storage).",
      });
    }

    // Check Target Region
    const hasRegion = /(us-central|us-east|us-west|ap-south|eu-west|region|mumbai|singapore|virginia)/i.test(combinedText);
    if (!hasRegion) {
      gaps.push({
        id: "TARGET_REGION",
        category: "Cloud Governance",
        severity: "low",
        question: "Which primary cloud region(s) should be targeted for deployment and data residency?",
        hint: "Example: us-central1 (Iowa) or ap-south-1 (Mumbai).",
      });
    }

    // Check Cutover Downtime / RTO
    const hasCutover = /(cutover|downtime|rto|rpo|maintenance window|business hours)/i.test(combinedText);
    if (!hasCutover) {
      gaps.push({
        id: "CUTOVER_WINDOW",
        category: "Migration Execution",
        severity: "low",
        question: "Is there an acceptable maintenance downtime window for production cutover, or is zero-downtime required?",
        hint: "Example: Weekend 4-hour maintenance window or zero-downtime blue/green cutover.",
      });
    }

    // Check Source Environment
    const hasSource = /(on-prem|aws|azure|gcp|vmware|bare metal|digitalocean|heroku|co-lo)/i.test(combinedText);
    if (!hasSource) {
      gaps.push({
        id: "SOURCE_ENVIRONMENT",
        category: "Prerequisites",
        severity: "medium",
        question: "Where are the existing workloads hosted today (e.g., on-premises VMware, AWS, Azure, Bare Metal)?",
        hint: "Example: Self-hosted on AWS EC2 or On-Premise VMware vSphere cluster.",
      });
    }

    // 4. Synthesize Executive Summary snippet
    let synthesizedSummary = "";
    if (combinedText.trim().length > 50) {
      // Find sentences discussing business goals or scope
      const lines = combinedText
        .split(/[\n\r]+/)
        .map((l) => l.trim())
        .filter((l) => l.length > 20 && !l.startsWith("#") && !l.startsWith("---"));
      synthesizedSummary = lines.slice(0, 3).join(" ");
    }

    return {
      hasInputs: combinedText.trim().length > 0,
      totalSourceFiles: filePaths.length,
      detectedProvider,
      providerConfidence,
      workloads,
      gaps,
      missingCount: gaps.length,
      synthesizedSummary,
      rawTextSnippet: combinedText.slice(0, 500),
    };
  }
}

module.exports = new PrdAnalyzer();
