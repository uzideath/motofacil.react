"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
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

export function WhatsAppProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [status, setStatus] = useState<WhatsAppStatus | null>(null)
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [socketConnected, setSocketConnected] = useState(false)

    // Inicializar socket
    useEffect(() => {
        try {
            const socketInstance = getSocket()
            setSocket(socketInstance)

            const onConnect = () => {
                console.log("Socket connected in context")
                setSocketConnected(true)
            }

            const onDisconnect = () => {
                console.log("Socket disconnected in context")
                setSocketConnected(false)
            }

            socketInstance.on("connect", onConnect)
            socketInstance.on("disconnect", onDisconnect)

            // Establecer estado de conexión inicial
            setSocketConnected(socketInstance.connected)

            return () => {
                socketInstance.off("connect", onConnect)
                socketInstance.off("disconnect", onDisconnect)
            }
        } catch (err) {
            console.error("Error initializing socket:", err)
            setError("Error al conectar con el servidor")
        }
    }, [])

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

        console.log("Setting up WebSocket event listeners")

        // QR code event
        const onQrCode = (data: { qr: string }) => {
            console.log("QR code received from server:", data.qr.substring(0, 20) + "...")
            console.log("QR code length:", data.qr.length)

            // Verificar que el QR es válido
            if (!data.qr || data.qr.length < 10) {
                console.error("QR code received is invalid or too short:", data.qr)
                setError("Código QR recibido no es válido")
                return
            }

            // Actualizar el estado con el QR recibido
            setQrCode(data.qr)
            setStatus((prev) => (prev ? { ...prev, isReady: false } : { isReady: false, info: null }))
            setIsLoading(false)

            // Notificar en consola para depuración
            console.log("QR code state updated successfully")
        }

        // Debug event para verificar si el QR se está enviando
        socket.on("debug_qr_sent", (data) => {
            console.log("Debug: QR was sent by server at", data.timestamp)
            console.log("Debug: QR length", data.qrLength)
        })

        // Connected status event
        const onConnected = (data: WhatsAppStatus) => {
            console.log("WhatsApp connected event received:", data)
            setStatus(data)
            setQrCode(null)
        }

        // Disconnected status event
        const onDisconnected = (data: WhatsAppStatus) => {
            console.log("WhatsApp disconnected event received:", data)
            setStatus(data)
        }

        socket.on("qr", onQrCode)
        socket.on("whatsapp_connected", onConnected)
        socket.on("whatsapp_disconnected", onDisconnected)

        // Solicitar QR code si no estamos conectados
        if (socketConnected && !status?.isReady) {
            console.log("Requesting QR code on initial setup")
            requestQrCode()
        }

        return () => {
            socket.off("qr", onQrCode)
            socket.off("whatsapp_connected", onConnected)
            socket.off("whatsapp_disconnected", onDisconnected)
            socket.off("debug_qr_sent")
        }
    }, [socket, socketConnected, status?.isReady])

    // Reconnect function
    const reconnect = async () => {
        try {
            setIsLoading(true)
            setError(null)
            console.log("Initiating WhatsApp reconnection")
            await HttpService.post("/api/v1/whatsapp/reconnect")
            // The server will emit events via WebSocket
        } catch (err) {
            setError("No se pudo reconectar a WhatsApp")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    // Función para solicitar código QR
    const handleRequestQrCode = () => {
        console.log("Requesting QR code from context")
        setQrCode(null) // Limpiar QR actual

        if (socket && socket.connected) {
            console.log("Socket is connected, emitting request_qr event")
            socket.emit("request_qr")
        } else {
            console.log("Socket is not connected, trying to reconnect")
            // Si el socket no está conectado, intentar reconectar
            if (socket) {
                socket.connect()
            } else {
                const socketInstance = getSocket()
                setSocket(socketInstance)
            }

            // Esperar un momento y luego emitir el evento
            setTimeout(() => {
                const currentSocket = getSocket()
                if (currentSocket && currentSocket.connected) {
                    console.log("Socket reconnected, emitting request_qr event")
                    currentSocket.emit("request_qr")
                } else {
                    console.log("Socket still not connected after reconnect attempt")
                    setError("No se pudo conectar al servidor para solicitar el código QR")
                }
            }, 1000)
        }
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
