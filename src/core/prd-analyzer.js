const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");

class PrdAnalyzer {
  constructor() {}

  /**
   * Extract readable text from an input file (.md, .txt, .docx, or json/pdf)
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
      } else if (ext === ".pdf") {
        // Safe text extraction from PDF without binary stream garbage:
        // Extract printable English words that are at least 3 characters long
        const buffer = fs.readFileSync(filePath);
        const str = buffer.toString("binary");
        // Extract text blocks inside BT ... ET if present, or readable strings
        const textBlocks = [];
        const regex = /BT[\s\S]*?ET/g;
        let match;
        while ((match = regex.exec(str)) !== null) {
          // Extract strings inside parentheses (Tj / TJ operators)
          const strings = match[0].match(/\(([^)]+)\)/g);
          if (strings) {
            textBlocks.push(strings.map((s) => s.slice(1, -1)).join(" "));
          }
        }
        if (textBlocks.length > 0) {
          return textBlocks.join("\n");
        }
        // Fallback: extract continuous ASCII printable words of length >= 4
        const words = str.match(/[A-Za-z0-9\s.,;:'"()/-]{4,}/g) || [];
        return words.filter((w) => w.trim().length > 4).join(" ");
      } else {
        return "";
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
      if (text && text.trim().length > 20) {
        combinedText += `\n--- SOURCE FILE: ${path.basename(fp)} ---\n` + text.trim();
      }
    }

    if (userNotes && userNotes.trim()) {
      combinedText += `\n--- USER CONTEXT NOTES ---\n` + userNotes.trim();
    }

    const cleanText = combinedText.trim();

    // CRITICAL: If there is no real input text (no PRD and no commentary), return clean empty state!
    // Do NOT invent workloads or ask gap questions when there is no text to analyze.
    if (cleanText.length < 30) {
      return {
        hasInputs: false,
        totalSourceFiles: filePaths.length,
        detectedProvider: null,
        providerConfidence: "none",
        workloads: [],
        gaps: [],
        missingCount: 0,
        synthesizedSummary: "",
        rawTextSnippet: "",
      };
    }

    const norm = cleanText.toLowerCase();

    // 1. Detect Hyperscaler Preference using strict word boundaries
    let detectedProvider = null;
    let providerConfidence = "neutral";
    const googleMentions = (norm.match(/\b(google cloud|gcp|bigquery|gke|cloud sql|vertex ai|vertex|google psf|google daf)\b/g) || []).length;
    const awsMentions = (norm.match(/\b(aws|amazon web services|ec2|s3|rds|eks|map 2\.0|aws lambda|aws aurora)\b/g) || []).length;
    const azureMentions = (norm.match(/\b(azure|microsoft cloud|microsoft entra|entra id|azure ad|aks|cosmos db|azure ammp)\b/g) || []).length;

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

    // 2. Extract Key Workloads from the actual text
    const workloads = [];
    if (/\b(kubernetes|gke|eks|aks|container|docker|microservice|microservices)\b/i.test(cleanText)) {
      workloads.push({ name: "Container Orchestration / Kubernetes", type: "Compute", icon: "☸️" });
    }
    if (/\b(database|postgres|postgresql|mysql|sql server|oracle|rds|cloud sql|aurora)\b/i.test(cleanText)) {
      workloads.push({ name: "Relational Database Migration & Managed SQL", type: "Database", icon: "🗄️" });
    }
    if (/\b(bigquery|redshift|snowflake|data warehouse|etl|pipeline|analytics|data lake)\b/i.test(cleanText)) {
      workloads.push({ name: "Modern Data Platform & Analytics", type: "Data", icon: "📊" });
    }
    if (/\b(terraform|infrastructure as code|iac|landing zone|control tower)\b/i.test(cleanText)) {
      workloads.push({ name: "Terraform Infrastructure as Code (IaC) & Landing Zone", type: "DevOps", icon: "🏗️" });
    }
    if (/\b(ci\/cd|github actions|gitlab|jenkins|devops|continuous deployment)\b/i.test(cleanText)) {
      workloads.push({ name: "Automated CI/CD Deployment Pipelines", type: "DevOps", icon: "🚀" });
    }
    if (/\b(ai|llm|machine learning|genai|vertex|rag|bedrock|openai|model)\b/i.test(cleanText)) {
      workloads.push({ name: "GenAI & Foundation Model Integration", type: "AI/ML", icon: "🤖" });
    }
    if (/\b(security|iam|vpn|vpc|firewall|waf|compliance|zero-trust|hipaa|soc2)\b/i.test(cleanText)) {
      workloads.push({ name: "Zero-Trust Cloud Security, Networking & IAM", type: "Security", icon: "🛡️" });
    }

    // 3. Gap Detection & Targeted Clarifying Questions (Only for missing items from this text)
    const gaps = [];

    // Check Sizing & Sizing details
    const hasSizing = /\b(vcpus|ram|gb|tb|instances|cores|nodes|tps|rps|\d+\s*(vm|vms|servers|nodes|instances))\b/i.test(cleanText);
    if (!hasSizing) {
      gaps.push({
        id: "WORKLOAD_SIZING",
        category: "Architecture & Sizing",
        severity: "medium",
        question: "What is the approximate size/scale of the in-scope workloads (e.g. number of VMs/servers, database sizes in GB/TB, or traffic throughput)?",
        hint: "Workload Sizing: 4 application VMs (16 vCPU, 64GB RAM), 1 managed PostgreSQL DB (500GB storage).",
      });
    }

    // Check Target Region
    const hasRegion = /\b(us-central|us-east|us-west|ap-south|eu-west|region|mumbai|singapore|virginia|frankfurt)\b/i.test(cleanText);
    if (!hasRegion) {
      gaps.push({
        id: "TARGET_REGION",
        category: "Cloud Governance",
        severity: "low",
        question: "Which primary cloud region(s) should be targeted for deployment and data residency?",
        hint: "Target Region: us-central1 (Iowa) or ap-south-1 (Mumbai).",
      });
    }

    // Check Cutover Downtime / Maintenance Window
    const hasCutover = /\b(cutover|downtime|rto|rpo|maintenance window|business hours|blue\/green)\b/i.test(cleanText);
    if (!hasCutover) {
      gaps.push({
        id: "CUTOVER_WINDOW",
        category: "Migration Execution",
        severity: "low",
        question: "Is there an acceptable maintenance downtime window for production cutover, or is zero-downtime required?",
        hint: "Cutover Window: Weekend 4-hour maintenance window or zero-downtime blue/green cutover.",
      });
    }

    // Check Source Environment
    const hasSource = /\b(on-prem|on-premise|vmware|bare metal|digitalocean|heroku|co-lo|source aws|source azure|source gcp)\b/i.test(cleanText);
    if (!hasSource) {
      gaps.push({
        id: "SOURCE_ENVIRONMENT",
        category: "Prerequisites",
        severity: "medium",
        question: "Where are the existing workloads hosted today (e.g. on-premises VMware, AWS, Bare Metal)?",
        hint: "Source Environment: Self-hosted on AWS EC2 or On-Premise VMware vSphere cluster.",
      });
    }

    // 4. Synthesize Summary snippet
    let synthesizedSummary = "";
    const lines = cleanText
      .split(/[\n\r]+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 20 && !l.startsWith("#") && !l.startsWith("---"));
    synthesizedSummary = lines.slice(0, 3).join(" ");

    return {
      hasInputs: true,
      totalSourceFiles: filePaths.length,
      detectedProvider,
      providerConfidence,
      workloads,
      gaps,
      missingCount: gaps.length,
      synthesizedSummary,
      rawTextSnippet: cleanText.slice(0, 500),
    };
  }
}

module.exports = new PrdAnalyzer();
