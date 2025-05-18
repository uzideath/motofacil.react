import axios, {
    AxiosInstance,
    AxiosError,
    InternalAxiosRequestConfig,
    AxiosResponse,
} from "axios"
import { getClientAuthToken } from "@/lib/token"
import { User } from "@/hooks/use-auth"
import { AuthService } from "./services/auth.service"

const HttpService: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
})

let isRefreshing = false
let failedQueue: {
    resolve: (value: AxiosResponse) => void
    reject: (error: any) => void
    config: InternalAxiosRequestConfig
}[] = []

function processQueue(error: any, token: string | null = null): void {
    failedQueue.forEach(async ({ resolve, reject, config }) => {
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
            resolve(await HttpService(config))
        } else {
            reject(error)
        }
    })
    failedQueue = []
}

/** Interceptor de requests para incluir Authorization desde cookie del cliente */
HttpService.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = getClientAuthToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error: AxiosError): Promise<never> => {
        console.error("Request Error:", error.message)
        return Promise.reject(error)
    }
)

HttpService.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => response,
    async (error: AxiosError): Promise<any> => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        const status = error.response?.status || 0
        const isUnauthorized = status === 401
        const isAuthEndpoint =
            originalRequest?.url?.includes("/auth/login") ||
            originalRequest?.url?.includes("/auth/refresh")

        if (isUnauthorized && !originalRequest._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject, config: originalRequest })
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const user: User | null = await AuthService.refresh()

                if (user) {
                    const newToken = getClientAuthToken()
                    processQueue(null, newToken)

                    originalRequest.headers.Authorization = `Bearer ${newToken}`
                    return HttpService(originalRequest)
                } else {
                    processQueue(new Error("Usuario no encontrado tras refresh"), null)
                    throw error
                }
            } catch (refreshError) {
                processQueue(refreshError, null)
                AuthService.logout()
                window.location.href = "/login"
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)


export { HttpService }
