const Resume = require("../models/Resume");
const {
  extractTextFromPDF,
  extractTextFromDOCX,
} = require("../utils/resumeParser");
const { analyzeResumeWithGemini } = require("../utils/geminiAnalyzer");
const path = require("path");
const fs = require("fs");

const uploadResume = async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    // Extract text based on file type
    let text;
    if (fileExt === ".pdf") {
      text = await extractTextFromPDF(filePath);
    } else if (fileExt === ".docx" || fileExt === ".doc") {
      text = await extractTextFromDOCX(filePath);
    } else {
      return res.status(400).json({ error: "Unsupported file format" });
    }

    // Verify Gemini API key is set
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    // Analyze resume using Gemini AI
    const analysis = await analyzeResumeWithGemini(text);

    // Save to database
    const resume = new Resume({
      fileName: req.file.originalname,
      content: text,
      skills: analysis.skills,
      analysis: {
        careerPaths: analysis.careerPaths,
        suggestions: analysis.suggestions,
      },
    });

    await resume.save();

    // Clean up uploaded file after successful processing
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });

    res.status(201).json({
      message: "Resume analyzed successfully",
      skills: analysis.skills,
      analysis: {
        careerPaths: analysis.careerPaths,
        suggestions: analysis.suggestions,
      },
    });
  } catch (error) {
    console.error("Error processing resume:", error);

    // Clean up uploaded file in case of error
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    // Send appropriate error message
    if (error.message.includes("GEMINI_API_KEY")) {
      res.status(500).json({
        error: "Server configuration error",
        details: "API key not configured properly",
      });
    } else if (error.name === "GoogleGenerativeAIError") {
      res.status(500).json({
        error: "AI Service Error",
        details: "Error communicating with AI service. Please try again later.",
      });
    } else {
      res.status(500).json({
        error: "Error processing resume",
        details: "An unexpected error occurred while processing your resume",
      });
    }
  }
};

const getAnalysis = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }
    res.json(resume);
  } catch (error) {
    console.error("Error fetching resume:", error);
    res.status(500).json({ error: "Error fetching resume" });
  }
};

const getAllAnalyses = async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    console.error("Error fetching resumes:", error);
    res.status(500).json({ error: "Error fetching resumes" });
  }
};

module.exports = {
  uploadResume,
  getAnalysis,
  getAllAnalyses,
};
