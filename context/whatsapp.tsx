"use client"

import type React from "react"
import { createContext, useEffect, useState, useCallback, type ReactNode } from "react"
import {
    getSocket,
    closeSocket,
    type QrCodePayload,
    type WhatsAppStatusPayload,
    type WhatsAppLogPayload,
    type WhatsAppInfo,
} from "@/lib/socket"
import { HttpService } from "@/lib/http"

interface ApiResponse {
    success: boolean
    message: string
    [key: string]: unknown
}

interface WhatsAppContextType {
    qrCode: string | null
    isConnected: boolean
    isConnecting: boolean
    connectionInfo: WhatsAppInfo | null
    logs: WhatsAppLogPayload[]
    requestQrCode: () => void
    reconnect: () => Promise<ApiResponse>
    logout: () => Promise<ApiResponse>
}

export const WhatsAppContext = createContext<WhatsAppContextType>({
    qrCode: null,
    isConnected: false,
    isConnecting: false,
    connectionInfo: null,
    logs: [],
    requestQrCode: () => { },
    reconnect: async () => ({ success: false, message: "Context not initialized" }),
    logout: async () => ({ success: false, message: "Context not initialized" }),
})

interface WhatsAppProviderProps {
    children: ReactNode
    socketUrl?: string
}

export const WhatsAppProvider: React.FC<WhatsAppProviderProps> = ({
    children,
    socketUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
}) => {
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [isConnected, setIsConnected] = useState<boolean>(false)
    const [isConnecting, setIsConnecting] = useState<boolean>(false)
    const [connectionInfo, setConnectionInfo] = useState<WhatsAppInfo | null>(null)
    const [logs, setLogs] = useState<WhatsAppLogPayload[]>([])

    // Helper function to add logs
    const addLog = (type: "info" | "error" | "warning", message: string): void => {
        const newLog: WhatsAppLogPayload = {
            type,
            message,
            timestamp: new Date().toISOString(),
        }
        setLogs((prevLogs) => [...prevLogs, newLog])
    }

    // Initialize socket connection
    useEffect(() => {
        const socket = getSocket(socketUrl)


        // Listen for QR code updates
        socket.on("qr", (payload: QrCodePayload) => {
            console.log("✅ QR code received", payload)
            setQrCode(payload.qr)
            setIsConnecting(true)
        })

        // Listen for WhatsApp connection status
        socket.on("whatsapp_connected", (payload: WhatsAppStatusPayload) => {
            console.log("WhatsApp connected", payload)
            setIsConnected(true)
            setIsConnecting(false)
            setConnectionInfo(payload.info || null)
            setQrCode(null) // Clear QR code when connected
        })

        socket.on("whatsapp_ready", () => {
            console.log("✅ WhatsApp session is ready")
            setIsConnected(true)
            setIsConnecting(false)
            setQrCode(null)
            addLog("info", "WhatsApp session established")
        })


        socket.on("whatsapp_disconnected", (payload: WhatsAppStatusPayload) => {
            console.log("WhatsApp disconnected", payload)
            setIsConnected(false)
            setConnectionInfo(null)
        })

        // Listen for logs
        socket.on("whatsapp_log", (payload: WhatsAppLogPayload) => {
            setLogs((prevLogs) => [...prevLogs, payload])
        })

        // Request initial status
        HttpService.get("/api/v1/whatsapp/status")
            .then((response) => {
                const data: WhatsAppStatusPayload = response.data
                if (data.isReady) {
                    setIsConnected(true)
                    setConnectionInfo(data.info || null)
                }
            })
            .catch((err: Error) => {
                console.error("Failed to fetch initial status:", err)
                addLog("error", `Failed to fetch initial status: ${err.message}`)
            })

        // Check if there's an existing QR code
        HttpService.get("/api/v1/whatsapp/qr")
            .then((response) => {
                const data: { qr: string | null } = response.data
                if (data.qr) {
                    setQrCode(data.qr)
                    setIsConnecting(true)
                }
            })
            .catch((err: Error) => {
                console.error("Failed to fetch QR code:", err)
                addLog("error", `Failed to fetch QR code: ${err.message}`)
            })

        // Cleanup on unmount
        return () => {
            closeSocket()
        }
    }, [socketUrl])

    // Request a new QR code
    const requestQrCode = useCallback((): void => {
        const socket = getSocket(socketUrl)
        socket.emit("request_qr")
        addLog("info", "Requesting new QR code")
        setIsConnecting(true)

        // Also make an HTTP request as a fallback
        HttpService.post("/api/v1/whatsapp/request-qr")
            .then((response) => response.data)
            .catch((err: Error) => {
                console.error("Failed to request QR code via HTTP:", err)
                addLog("error", `Failed to request QR code via HTTP: ${err.message}`)
            })
    }, [socketUrl])

    // Reconnect to WhatsApp
    const reconnect = useCallback(async (): Promise<ApiResponse> => {
        try {
            addLog("info", "Attempting to reconnect to WhatsApp")
            const response = await HttpService.post("/api/v1/whatsapp/reconnect")
            const data: ApiResponse = response.data

            if (data.success) {
                addLog("info", "Reconnection initiated successfully")
            } else {
                addLog("error", `Reconnection failed: ${data.message || "Unknown error"}`)
            }

            return data
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error"
            console.error("Error reconnecting:", error)
            addLog("error", `Error reconnecting: ${errorMessage}`)
            return { success: false, message: errorMessage }
        }
    }, [])

    // Logout from WhatsApp
    const logout = useCallback(async (): Promise<ApiResponse> => {
        try {
            addLog("info", "Logging out from WhatsApp")
            const response = await HttpService.post("/api/v1/whatsapp/logout")
            const data: ApiResponse = response.data

            if (data.success) {
                setIsConnected(false)
                setConnectionInfo(null)
                addLog("info", "Logged out successfully")
            } else {
                addLog("error", `Logout failed: ${data.message || "Unknown error"}`)
            }

            return data
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error"
            console.error("Error logging out:", error)
            addLog("error", `Error logging out: ${errorMessage}`)
            return { success: false, message: errorMessage }
        }
    }, [])

    const value: WhatsAppContextType = {
        qrCode,
        isConnected,
        isConnecting,
        connectionInfo,
        logs,
        requestQrCode,
        reconnect,
        logout,
    }

    return <WhatsAppContext.Provider value={value}>{children}</WhatsAppContext.Provider>
}
