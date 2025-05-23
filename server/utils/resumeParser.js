const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, "..", "temp");
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const extractTextFromPDF = async (fileBuffer) => {
    try {
        if (!fileBuffer || fileBuffer.length === 0) {
            throw new Error("Empty or invalid file buffer received");
        }

        console.log("Buffer size:", fileBuffer.length);
        console.log("Buffer type:", fileBuffer.constructor.name);

        // Ensure we have a proper buffer
        const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);

        // Parse PDF with options
        const data = await pdfParse(buffer, {
            max: 0, // No page limit
            version: "v2.0.550",
        });

        if (!data || !data.text) {
            throw new Error("No text content extracted from PDF");
        }

        return data.text;
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        throw new Error(`PDF parsing failed: ${error.message}`);
    }
};

const extractTextFromDOCX = async (fileBuffer) => {
    try {
        if (!fileBuffer || fileBuffer.length === 0) {
            throw new Error("Empty or invalid file buffer received");
        }

        console.log("DOCX Buffer size:", fileBuffer.length);

        const result = await mammoth.extractRawText({
            buffer: fileBuffer,
        });

        if (!result || !result.value) {
            throw new Error("No text content extracted from DOCX");
        }

        return result.value;
    } catch (error) {
        console.error("Error extracting text from DOCX:", error);
        throw new Error(`DOCX parsing failed: ${error.message}`);
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
