import axios from "axios";
import type { AxiosInstance, AxiosError } from "axios";

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null

    const match = document.cookie.match(
        new RegExp(`(^| )${name}=([^;]+)`)
    )
    return match ? decodeURIComponent(match[2]) : null
}

const HttpService: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
})

HttpService.interceptors.request.use(
    (config) => {
        const token = getCookie("authToken")
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        console.error("Request Error:", error?.message || error)
        return Promise.reject(error)
    }
)

HttpService.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const status = error.response?.status
        console.error(
            "API Error:",
            status ? `Status ${status}` : error.message,
            error.response?.data || {}
        )

        if (status === 401) {
            console.warn("Unauthorized. Redirecting to login...")
        }

        return Promise.reject(error)
    }
)

export { HttpService }