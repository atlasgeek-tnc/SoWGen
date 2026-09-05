const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");

/**
 * Converts a .docx file into structured Markdown
 * Used for maintaining local parity when edits are made in Google Docs online.
 */
async function convertDocxToMarkdown(docxPath, options = {}) {
  if (!fs.existsSync(docxPath)) {
    throw new Error(`File does not exist: ${docxPath}`);
  }

  const result = await mammoth.convertToMarkdown({ path: docxPath });
  const markdown = result.value;

  if (options.outputPath) {
    fs.writeFileSync(options.outputPath, markdown, "utf-8");
  }

  return {
    markdown,
    messages: result.messages,
  };
}

module.exports = {
  convertDocxToMarkdown,
};
