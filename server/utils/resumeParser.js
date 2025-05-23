const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, "..", "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
};

const extractTextFromDOCX = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({
      path: filePath,
    });
    return result.value;
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw error;
  }
};

const extractSkills = (text) => {
  const commonSkills = [
    "javascript",
    "python",
    "java",
    "react",
    "angular",
    "vue",
    "node",
    "express",
    "mongodb",
    "sql",
    "aws",
    "docker",
    "kubernetes",
    "machine learning",
    "data science",
    "artificial intelligence",
    "product management",
    "agile",
    "leadership",
    "communication",
    "teamwork",
    "problem solving",
    "project management",
    "marketing",
    "seo",
    "ui/ux",
    "html",
    "css",
    "git",
    "devops",
  ];

  const foundSkills = [];
  const lowerText = text.toLowerCase();

  commonSkills.forEach((skill) => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  return foundSkills;
};

module.exports = {
  extractTextFromPDF,
  extractTextFromDOCX,
  extractSkills,
};
