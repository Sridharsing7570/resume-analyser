const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema(
  {
    fileName: String,
    content: String,
    skills: [String],
    analysis: {
      careerPaths: [
        {
          title: String,
          description: String,
          matchScore: Number,
          requiredSkills: [String],
        },
      ],
      suggestions: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    writeConcern: {
      w: 1,
      j: true,
    },
  }
);

module.exports = mongoose.model("Resume", ResumeSchema);
