// API Configuration
export const API_URL = "https://resume-analyser-env.eba-42cra3ib.ap-south-1.elasticbeanstalk.com";

// Create axios instance with default config
import axios from "axios";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
