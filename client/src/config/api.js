// API Configuration
export const API_URL =
    "http://resume-analyser-v2-env.eba-htccxpau.ap-south-1.elasticbeanstalk.com/";

// Create axios instance with default config
import axios from "axios";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: false, // Changed to false to avoid CORS issues
    timeout: 30000, // 30 seconds timeout
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Add request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        console.log("Request:", config);
        return config;
    },
    (error) => {
        console.error("Request Error:", error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
api.interceptors.response.use(
    (response) => {
        console.log("Response:", response);
        return response;
    },
    (error) => {
        console.error("Response Error:", error);
        if (error.code === "ERR_NETWORK") {
            console.error("Network Error - Please check if the API server is running");
        }
        return Promise.reject(error);
    }
);

export default api;
