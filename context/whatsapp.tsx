"use client"

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react"
import {
    getSocket,
    requestQrCode,
    onQrReceived,
    onStatusConnected,
    onStatusDisconnected,
} from "@/lib/socket"
import { HttpService } from "@/lib/http"

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
    const [status, setStatus] = useState<WhatsAppStatus | null>(null)
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Obtener estado inicial desde API
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                setIsLoading(true)
                const res = await HttpService.get("/api/v1/whatsapp/status")
                setStatus(res.data)
                setQrCode(null) // Limpiar QR si ya está conectado
            } catch (err) {
                console.error("Error al obtener estado de WhatsApp:", err)
                setError("No se pudo obtener el estado de WhatsApp")
            } finally {
                setIsLoading(false)
            }
        }

        fetchStatus()
    }, [])

    // Establecer listeners del socket
    useEffect(() => {
        const socket = getSocket()

        onQrReceived((qr) => {
            console.log("✅ QR actualizado desde socket")
            setQrCode(qr)
            setStatus((prev) =>
                prev ? { ...prev, isReady: false } : { isReady: false, info: null }
            )
            setIsLoading(false)
        })

        onStatusConnected((newStatus) => {
            console.log("✅ Estado conectado recibido")
            setStatus(newStatus)
            setQrCode(null)
        })

        onStatusDisconnected((newStatus) => {
            console.log("🔌 Estado desconectado recibido")
            setStatus(newStatus)
        })
    }, [])

    // Función para reconectar WhatsApp (vía HTTP)
    const reconnect = async () => {
        try {
            setIsLoading(true)
            setError(null)
            console.log("🔁 Solicitando reconexión de WhatsApp")
            await HttpService.post("/api/v1/whatsapp/reconnect")
        } catch (err) {
            console.error("❌ Error al reconectar WhatsApp:", err)
            setError("No se pudo reconectar a WhatsApp")
        } finally {
            setIsLoading(false)
        }
    }

    // Función para solicitar nuevo QR (vía socket)
    const handleRequestQrCode = () => {
        setQrCode(null)
        setError(null)
        console.log("📨 Solicitando nuevo código QR")
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
