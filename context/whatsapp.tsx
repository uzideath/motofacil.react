import React, { createContext, useContext, useEffect, useState } from "react"
import { HttpService } from "@/lib/http"
import { useSocket } from "@/hooks/useSocket"

interface WhatsAppStatus {
    isReady: boolean
    info: {
        wid: any
        platform: string | null
    } | null
}

interface WhatsAppContextType {
    status: WhatsAppStatus | null
    qrCode: string | null
    isLoading: boolean
    error: string | null
    reconnect: () => Promise<void>
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined)

export function WhatsAppProvider({ children }: { children: React.ReactNode }) {
    const { socket, isConnected } = useSocket()
    const [status, setStatus] = useState<WhatsAppStatus | null>(null)
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch initial status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                setIsLoading(true)
                const response = await HttpService.get("/api/v1/whatsapp/status")
                setStatus(response.data)
                setError(null)
            } catch (err) {
                setError("No se pudo obtener el estado de WhatsApp")
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchStatus()
    }, [])

    // Listen for WebSocket events
    useEffect(() => {
        if (!socket) return

        // QR code event
        const onQrCode = (data: { qr: string }) => {
            setQrCode(data.qr)
            setStatus(prev => prev ? { ...prev, isReady: false } : null)
        }

        // Connected status event
        const onConnected = (data: WhatsAppStatus) => {
            setStatus(data)
            setQrCode(null)
        }

        // Disconnected status event
        const onDisconnected = (data: WhatsAppStatus) => {
            setStatus(data)
        }

        socket.on("qr", onQrCode)
        socket.on("whatsapp_connected", onConnected)
        socket.on("whatsapp_disconnected", onDisconnected)

        return () => {
            socket.off("qr", onQrCode)
            socket.off("whatsapp_connected", onConnected)
            socket.off("whatsapp_disconnected", onDisconnected)
        }
    }, [socket])

    // Reconnect function
    const reconnect = async () => {
        try {
            setIsLoading(true)
            setError(null)
            await HttpService.post("/api/v1/whatsapp/reconnect")
            // The server will emit events via WebSocket
        } catch (err) {
            setError("No se pudo reconectar a WhatsApp")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <WhatsAppContext.Provider value={{ status, qrCode, isLoading, error, reconnect }}>
            {children}
        </WhatsAppContext.Provider>
    )
}

export function useWhatsApp() {
    const context = useContext(WhatsAppContext)
    if (context === undefined) {
        throw new Error("useWhatsApp must be used within a WhatsAppProvider")
    }
    return context
}