import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../lib/use-toast";
import axios from "axios";

// API URL configuration
const API_URL =
  import.meta.env.VITE_API_URL || "https://resume-analyser-env.eba-42cra3ib.ap-south-1.elasticbeanstalk.com";

const HomePage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const { toast } = useToast();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      (selectedFile.type === "application/pdf" ||
        selectedFile.type === "application/msword" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ) {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document",
        variant: "destructive",
      });
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a resume file to upload",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await axios.post(`${API_URL}/api/analyze`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      console.log(response.data);

      setAnalysis(response.data);
      toast({
        title: "Analysis complete",
        description: "Your resume has been analyzed successfully!",
      });
    } catch (error) {
      console.error("Error analyzing resume:", error);
      toast({
        title: "Analysis failed",
        description:
          error.response?.data?.message ||
          "There was an error analyzing your resume",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">AI Resume Career Advisor</h1>
        <p className="text-lg text-gray-600">
          Upload your resume and get AI-powered career path suggestions based on
          your skills and experience
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="resume" className="block text-sm font-medium">
              Upload your resume (PDF or Word)
            </label>
            <Input
              id="resume"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500">
              Your resume will be analyzed to suggest potential career paths
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Resume"}
          </Button>
        </form>
      </div>

      {analysis && (
        <div className="mt-10 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Career Analysis Results</h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Skills Identified</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">
              Recommended Career Paths
            </h3>
            <div className="space-y-4">
              {analysis?.analysis?.careerPaths?.map((career, index) => (
                <div
                  key={index}
                  className="border-l-4 border-green-500 pl-4 py-2"
                >
                  <h4 className="font-bold text-lg">{career.title}</h4>
                  <p className="text-gray-600">{career.description}</p>
                  <div className="mt-2">
                    <span className="text-sm font-medium">Match Score: </span>
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                      {career.matchScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">
              Improvement Suggestions
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              {analysis?.analysis?.suggestions?.map((suggestion, index) => (
                <li key={index} className="text-gray-700">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
