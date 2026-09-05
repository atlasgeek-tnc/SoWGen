const path = require("path");

const BRAND = {
  name: "Atlas Geek",
  website: "https://atlasgeek.in",
  email: "business@atlasgeek.in",
  logoPath: path.resolve(__dirname, "../../assets/atlasgeek_logo.png"),

  // Color Palette (Hex without # for docx, with # for pptx)
  colors: {
    primary: "3F51B5",         // Atlas Geek Indigo / Royal Blue
    primaryDark: "283593",
    primaryLight: "E8EAF6",
    accent: "FF7A00",          // Energetic Orange
    accentLight: "FFF3E0",
    dark: "1E293B",            // Slate Navy
    body: "334155",            // Slate
    muted: "64748B",           // Gray
    lightBg: "F8FAFC",         // Clean Slate White
    border: "E2E8F0",
    success: "059669",         // Emerald green for In-Scope
    danger: "DC2626",          // Red for Out-of-Scope
    white: "FFFFFF",
  },

  fonts: {
    primary: "Calibri",
    header: "Calibri",
  },
};

module.exports = BRAND;
