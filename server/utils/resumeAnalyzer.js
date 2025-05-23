const calculateMatchScore = (resumeSkills, requiredSkills) => {
  const matchingSkills = resumeSkills.filter((skill) =>
    requiredSkills.includes(skill.toLowerCase())
  );
  return (matchingSkills.length / requiredSkills.length) * 100;
};

const analyzeResume = (text, skills) => {
  const careerPaths = [];
  const suggestions = [];

  // Define career paths and their required skills
  const careerDefinitions = {
    "Full Stack Developer": {
      skills: ["javascript", "html", "css", "react", "node", "mongodb"],
      description:
        "Build complete web applications with both frontend and backend expertise.",
    },
    "Data Scientist": {
      skills: [
        "python",
        "machine learning",
        "data science",
        "artificial intelligence",
      ],
      description:
        "Analyze complex data sets to help organizations make better decisions.",
    },
    "DevOps Engineer": {
      skills: ["docker", "kubernetes", "aws", "devops", "git"],
      description:
        "Bridge the gaps between software development and operations.",
    },
    "Product Manager": {
      skills: ["product management", "agile", "leadership", "communication"],
      description:
        "Lead the development of products from conception to launch.",
    },
  };

  // Calculate match scores for each career path
  Object.entries(careerDefinitions).forEach(([career, details]) => {
    const matchScore = calculateMatchScore(skills, details.skills);
    if (matchScore > 30) {
      // Only suggest careers with >30% match
      careerPaths.push({
        title: career,
        description: details.description,
        matchScore,
      });
    }
  });

  // Sort career paths by match score
  careerPaths.sort((a, b) => b.matchScore - a.matchScore);

  // Generate suggestions based on analysis
  if (careerPaths.length === 0) {
    suggestions.push(
      "Consider adding more specific technical skills to your resume."
    );
  } else {
    const topCareer = careerPaths[0];
    const missingSkills = careerDefinitions[topCareer.title].skills.filter(
      (skill) => !skills.includes(skill)
    );

    if (missingSkills.length > 0) {
      suggestions.push(
        `To strengthen your ${
          topCareer.title
        } profile, consider learning: ${missingSkills.join(", ")}`
      );
    }
  }

  suggestions.push(
    "Keep your resume updated with your latest projects and achievements."
  );
  suggestions.push(
    "Consider adding quantifiable achievements to demonstrate impact."
  );

  return {
    careerPaths,
    suggestions,
  };
};

module.exports = {
  analyzeResume,
  calculateMatchScore,
};
