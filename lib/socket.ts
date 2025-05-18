import { io, type Socket } from "socket.io-client"

// Define the types for the socket events
export interface QrCodePayload {
    qr: string
}

export interface WhatsAppInfo {
    wid: {
        server: string
        user: string
        _serialized: string
    }
    platform: string | null
}

export interface WhatsAppStatusPayload {
    isReady: boolean
    info?: WhatsAppInfo | null
}

export interface WhatsAppLogPayload {
    type: "info" | "error" | "warning"
    message: string
    timestamp: string
}

// Create a singleton socket instance
let socket: Socket | null = null

export const getSocket = (url = "http://localhost:3000"): Socket => {
    if (!socket) {
        socket = io(url, {
            transports: ["websocket", "polling"],
        })
    }
    return socket
}

export const closeSocket = (): void => {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}
