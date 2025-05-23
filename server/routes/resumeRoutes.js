const express = require("express");
const router = express.Router();
const { upload, handleMulterError } = require("../middlewares/upload");
const { uploadResume, getAnalysis, getAllAnalyses } = require("../controllers/resumeController");

// Upload and analyze resume
router.post("/analyze", upload.single("resume"), handleMulterError, uploadResume);

// Get specific resume analysis
router.get("/analysis/:id", getAnalysis);

// Get all analyses
router.get("/analyses", getAllAnalyses);

module.exports = router;
