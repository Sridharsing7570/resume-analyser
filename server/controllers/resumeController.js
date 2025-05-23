const Resume = require("../models/Resume");
const { extractTextFromPDF, extractTextFromDOCX } = require("../utils/resumeParser");
const { analyzeResumeWithGemini } = require("../utils/geminiAnalyzer");

const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log("File received:", {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            buffer: req.file.buffer
                ? `Buffer present (${req.file.buffer.length} bytes)`
                : "No buffer",
        });

        const fileBuffer = req.file.buffer;
        if (!fileBuffer || fileBuffer.length === 0) {
            return res
                .status(400)
                .json({ error: "Invalid file: Empty or corrupted file received" });
        }

        const fileExt = req.file.originalname.split(".").pop().toLowerCase();
        console.log("Processing file with extension:", fileExt);

        // Extract text based on file type
        let text;
        if (fileExt === "pdf") {
            text = await extractTextFromPDF(fileBuffer);
        } else if (fileExt === "docx" || fileExt === "doc") {
            text = await extractTextFromDOCX(fileBuffer);
        } else {
            return res.status(400).json({ error: "Unsupported file format" });
        }

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: "Could not extract text from the file" });
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
                details:
                    error.message || "An unexpected error occurred while processing your resume",
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
