const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini AI with your API key
let ai;
try {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (error) {
  console.error("Error initializing Gemini AI:", error);
  throw error;
}

// Helper function to clean JSON string from markdown formatting
const cleanJsonResponse = (text) => {
  // Remove markdown code block indicators and any language specifiers
  let cleaned = text.replace(/```(json)?/g, "").trim();

  // Remove any trailing backticks
  cleaned = cleaned.replace(/`+$/, "").trim();

  // If the response starts with a newline and {, trim the newline
  cleaned = cleaned.replace(/^\n*{/, "{");

  return cleaned;
};

const analyzeResumeWithGemini = async (resumeText) => {
  try {
    // Truncate very long resumes to save tokens
    const truncatedResume =
      resumeText.length > 5000
        ? resumeText.substring(0, 5000) + "... [truncated]"
        : resumeText;

    const prompt = `You are a resume analysis expert. Analyze this resume and provide career recommendations. Return ONLY a JSON object with this exact structure, no markdown formatting or additional text:
    {
      "skills": ["skill1", "skill2"],
      "careerPaths": [
        {
          "title": "Job Title",
          "suitability": "Why this role is suitable",
          "matchingSkills": ["skill1", "skill2"],
          "skillsToAcquire": ["skill1", "skill2"]
        }
      ],
      "suggestions": ["suggestion1", "suggestion2"],
      "industryTrends": ["trend1", "trend2"]
    }

    Resume text: ${truncatedResume}`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH",
          },
        ],
      });

      const text = response.text;
      console.log("Raw AI response:", text); // Debug log

      // Clean the response text before parsing
      const cleanedText = cleanJsonResponse(text);
      console.log("Cleaned response:", cleanedText); // Debug log

      // Parse the JSON response
      const analysis = JSON.parse(cleanedText);

      return {
        skills: analysis.skills || [],
        careerPaths: (analysis.careerPaths || []).map((path) => ({
          title: path.title,
          description: path.suitability,
          matchScore: calculateMatchScore(
            analysis.skills || [],
            path.matchingSkills || []
          ),
          requiredSkills: path.skillsToAcquire || [],
        })),
        suggestions: [
          ...(analysis.suggestions || []),
          ...(analysis.industryTrends || []).map(
            (trend) => `Industry Trend: ${trend}`
          ),
        ],
      };
    } catch (apiError) {
      if (apiError.message.includes("429")) {
        console.log("Rate limit hit, waiting 30 seconds before retry...");
        await new Promise((resolve) => setTimeout(resolve, 30000));
        return analyzeResumeWithGemini(resumeText); // Retry once after waiting
      }
      throw apiError;
    }
  } catch (error) {
    console.error("Analysis error:", error);
    throw error;
  }
};

const calculateMatchScore = (userSkills, requiredSkills) => {
  if (!userSkills.length || !requiredSkills.length) return 0;

  const matchingSkills = requiredSkills.filter((skill) =>
    userSkills.some(
      (userSkill) =>
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
    )
  );
  return Math.round((matchingSkills.length / requiredSkills.length) * 100);
};

module.exports = {
  analyzeResumeWithGemini,
};
