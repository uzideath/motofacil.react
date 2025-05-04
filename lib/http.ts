import axios from "axios";
import type { AxiosInstance, AxiosError } from "axios";

const HttpService: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Request Interceptor
HttpService.interceptors.request.use(
    (config) => config,
    (error) => {
        console.error("Request Error:", error?.message || error);
        return Promise.reject(error);
    }
);

// Response Interceptor
HttpService.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const status = error.response?.status;

        console.error(
            "API Error:",
            status ? `Status ${status}` : error.message,
            error.response?.data || {}
        );

        if (status === 401) {
            console.warn("Unauthorized. Redirecting to login...");
        }

        return Promise.reject(error);
    }
);

export { HttpService };
