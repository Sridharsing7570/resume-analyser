const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const docxParser = require('docx-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-analyzer', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Define Resume Schema
const ResumeSchema = new mongoose.Schema({
  fileName: String,
  content: String,
  skills: [String],
  analysis: {
    careerPaths: [{
      title: String,
      description: String,
      matchScore: Number
    }],
    suggestions: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Resume = mongoose.model('Resume', ResumeSchema);

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'));
    }
  }
});

// Extract text from PDF
const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
};

// Extract text from DOCX
const extractTextFromDOCX = (filePath) => {
  return new Promise((resolve, reject) => {
    docxParser.parseDocx(filePath, (err, text) => {
      if (err) {
        reject(err);
      } else {
        resolve(text);
      }
    });
  });
};

// Extract skills from resume text
const extractSkills = (text) => {
  // This is a simplified version - in a real app, you'd use NLP or a more sophisticated approach
  const commonSkills = [
    "javascript",
    "python",
    "java",
    "c++",
    "c#",
    "react",
    "angular",
    "vue",
    "node",
    "express",
    "mongodb",
    "sql",
    "nosql",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "ci/cd",
    "machine learning",
    "data science",
    "artificial intelligence",
    "nlp",
    "deep learning",
    "product management",
    "agile",
    "scrum",
    "leadership",
    "communication",
    "teamwork",
    "problem solving",
    "critical thinking",
    "project management",
    "marketing",
    "seo",
    "content writing",
    "social media",
    "graphic design",
    "ui/ux",
    "adobe",
    "photoshop",
    "illustrator",
    "figma",
    "sketch",
    "html",
    "css",
    "sass",
    "less",
    "bootstrap",
    "tailwind",
    "jquery",
    "rest api",
    "graphql",
    "git",
    "github",
    "gitlab",
    "bitbucket",
    "jira",
    "confluence",
    "trello",
    "asana",
    "slack",
    "microsoft office",
    "excel",
    "powerpoint",
    "word",
    "outlook",
    "salesforce",
    "hubspot",
    "crm",
    "erp",
    "sap",
    "oracle",
    "data analysis",
    "statistics",
    "r",
    "tableau",
    "power bi",
    "excel",
    "data visualization",
    "blockchain",
    "cryptocurrency",
    "smart contracts",
    "solidity",
    "ethereum",
    "finance",
    "accounting",
    "budgeting",
    "forecasting",
    "financial analysis",
    "investment",
    "human resources",
    "recruiting",
    "talent acquisition",
    "onboarding",
    "training",
    "development",
    "performance management",
    "compensation",
    "benefits",
    "payroll",
    "operations",
    "supply chain",
    "logistics",
    "inventory management",
    "procurement",
    "quality assurance",
    "quality control",
    "testing",
    "manual testing",
    "automated testing",
    "selenium",
    "cypress",
    "jest",
    "mocha",
    "chai",
    "junit",
    "testng",
    "cucumber",
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

// Analyze resume and suggest career paths
const analyzeResume = (text, skills) => {
  // This is a simplified version - in a real app, you'd use AI/ML for better analysis
  const careerPaths = [];
  const suggestions = [];

  // Basic career path suggestions based on skills
  if (
    skills.some((skill) =>
      ["javascript", "react", "angular", "vue", "html", "css"].includes(skill)
    )
  ) {
    const matchScore = calculateMatchScore(skills, [
      "javascript",
      "react",
      "html",
      "css",
    ]);
    careerPaths.push({
      title: "Frontend Developer",
      description:
        "Build user interfaces and web applications using modern JavaScript frameworks",
      matchScore,
    });
  }

  if (
    skills.some((skill) =>
      ["node", "express", "mongodb", "sql", "api"].includes(skill)
    )
  ) {
    const matchScore = calculateMatchScore(skills, [
      "node",
      "express",
      "mongodb",
      "sql",
    ]);
    careerPaths.push({
      title: "Backend Developer",
      description:
        "Develop server-side logic, databases, and APIs for web applications",
      matchScore,
    });
  }

  if (
    skills.some((skill) =>
      [
        "python",
        "machine learning",
        "data science",
        "ai",
        "deep learning",
        "nlp",
      ].includes(skill)
    )
  ) {
    const matchScore = calculateMatchScore(skills, [
      "python",
      "machine learning",
      "data science",
    ]);
    careerPaths.push({
      title: "Machine Learning Engineer",
      description: "Build and deploy machine learning models and AI systems",
      matchScore,
    });
  }

  if (
    skills.some((skill) =>
      ["ui/ux", "figma", "sketch", "adobe", "design"].includes(skill)
    )
  ) {
    const matchScore = calculateMatchScore(skills, [
      "ui/ux",
      "figma",
      "design",
    ]);
    careerPaths.push({
      title: "UI/UX Designer",
      description:
        "Create user-centered designs for digital products and experiences",
      matchScore,
    });
  }

  if (
    skills.some((skill) =>
      ["product management", "agile", "scrum", "jira", "leadership"].includes(
        skill
      )
    )
  ) {
    const matchScore = calculateMatchScore(skills, [
      "product management",
      "agile",
      "leadership",
    ]);
    careerPaths.push({
      title: "Product Manager",
      description:
        "Lead product development and strategy to meet user needs and business goals",
      matchScore,
    });
  }

  if (
    skills.some((skill) =>
      [
        "devops",
        "aws",
        "azure",
        "gcp",
        "docker",
        "kubernetes",
        "ci/cd",
      ].includes(skill)
    )
  ) {
    const matchScore = calculateMatchScore(skills, [
      "devops",
      "aws",
      "docker",
      "ci/cd",
    ]);
    careerPaths.push({
      title: "DevOps Engineer",
      description:
        "Implement and manage infrastructure, deployment pipelines, and cloud resources",
      matchScore,
    });
  }

  // If no specific career paths were identified, suggest a general one
  if (careerPaths.length === 0) {
    careerPaths.push({
      title: "IT Professional",
      description:
        "Various roles in technology based on your background and interests",
      matchScore: 60,
    });
  }

  // Sort career paths by match score
  careerPaths.sort((a, b) => b.matchScore - a.matchScore);

  // Generate improvement suggestions
  if (skills.length < 5) {
    suggestions.push(
      "Consider adding more specific technical skills to your resume"
    );
  }

  suggestions.push(
    "Quantify your achievements with metrics and results where possible"
  );
  suggestions.push(
    "Tailor your resume for specific job applications by highlighting relevant skills"
  );

  if (!text.toLowerCase().includes("project")) {
    suggestions.push(
      "Add details about projects you've worked on to showcase practical experience"
    );
  }

  if (!text.toLowerCase().includes("education")) {
    suggestions.push(
      "Include your educational background and any relevant certifications"
    );
  }

  return {
    careerPaths: careerPaths.slice(0, 3), // Return top 3 matches
    suggestions,
  };
};

// Calculate match score between resume skills and career path required skills
const calculateMatchScore = (resumeSkills, requiredSkills) => {
  let matchCount = 0;

  requiredSkills.forEach((skill) => {
    if (
      resumeSkills.some(
        (resumeSkill) =>
          resumeSkill.includes(skill) || skill.includes(resumeSkill)
      )
    ) {
      matchCount++;
    }
  });

  return Math.round((matchCount / requiredSkills.length) * 100);
};

// API Routes
app.post("/api/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    let text = "";

    // Extract text based on file type
    if (req.file.mimetype === "application/pdf") {
      text = await extractTextFromPDF(filePath);
    } else {
      text = await extractTextFromDOCX(filePath);
    }

    // Extract skills from resume
    const skills = extractSkills(text);

    // Analyze resume and get career suggestions
    const analysis = analyzeResume(text, skills);

    // Save to database
    const resume = new Resume({
      fileName: req.file.originalname,
      content: text,
      skills,
      analysis,
    });

    await resume.save();

    // Return analysis results
    res.json({
      skills,
      careerPaths: analysis.careerPaths,
      suggestions: analysis.suggestions,
    });

    // Clean up uploaded file
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });
  } catch (error) {
    console.error("Error processing resume:", error);
    res
      .status(500)
      .json({ message: "Error processing resume", error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

