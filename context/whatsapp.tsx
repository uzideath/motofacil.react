"use client"

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react"
import { getSocket, requestQrCode } from "@/lib/socket"
import { HttpService } from "@/lib/http"
import type { Socket } from "socket.io-client"

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
    requestQrCode: () => void
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined)

export function WhatsAppProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [status, setStatus] = useState<WhatsAppStatus | null>(null)
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Obtener estado inicial del backend (REST)
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                setIsLoading(true)
                const res = await HttpService.get("/api/v1/whatsapp/status")
                setStatus(res.data)
                setQrCode(null)
            } catch (err) {
                console.error("❌ Error al obtener estado inicial:", err)
                setError("No se pudo obtener el estado de WhatsApp")
            } finally {
                setIsLoading(false)
            }
        }

        fetchStatus()
    }, [])

    // Conectar socket y registrar eventos
    useEffect(() => {
        const socketInstance = getSocket()
        setSocket(socketInstance)

        const handleQr = (qr: string) => {
            console.log("✅ QR recibido en useWhatsApp y guardado")
            setQrCode(qr)
            setStatus((prev) =>
                prev ? { ...prev, isReady: false } : { isReady: false, info: null },
            )
            setIsLoading(false)
        }

        const handleConnected = (data: WhatsAppStatus) => {
            console.log("✅ WhatsApp conectado:", data)
            setStatus(data)
            setQrCode(null)
            setIsLoading(false)
        }

        const handleDisconnected = (data: WhatsAppStatus) => {
            console.log("🔌 WhatsApp desconectado:", data)
            setStatus(data)
            setIsLoading(false)
        }

        // Suscribirse a eventos
        socketInstance.on("qr", (data) => {
            if (data?.qr) handleQr(data.qr)
        })
        socketInstance.on("whatsapp_connected", handleConnected)
        socketInstance.on("whatsapp_disconnected", handleDisconnected)

        return () => {
            socketInstance.off("qr")
            socketInstance.off("whatsapp_connected", handleConnected)
            socketInstance.off("whatsapp_disconnected", handleDisconnected)
        }
    }, [])

    // Reconectar vía HTTP
    const reconnect = async () => {
        try {
            setIsLoading(true)
            setError(null)
            console.log("🔁 Solicitando reconexión de WhatsApp")
            await HttpService.post("/api/v1/whatsapp/reconnect")
        } catch (err) {
            console.error("❌ Error al reconectar:", err)
            setError("No se pudo reconectar a WhatsApp")
        } finally {
            setIsLoading(false)
        }
    }

    // Solicitar nuevo QR
    const handleRequestQrCode = () => {
        setQrCode(null)
        setError(null)
        console.log("📨 Solicitando nuevo QR desde el contexto")
        requestQrCode()
    }

    return (
        <WhatsAppContext.Provider
            value={{
                status,
                qrCode,
                isLoading,
                error,
                reconnect,
                requestQrCode: handleRequestQrCode,
            }}
        >
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
