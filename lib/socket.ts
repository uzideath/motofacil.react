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
    const parsedUrl = new URL(url)
    parsedUrl.protocol = parsedUrl.protocol === "https:" ? "wss:" : "ws:"

    if (!socket) {
        socket = io(parsedUrl.toString(), {
            transports: ["websocket"],
        })
    }
    socket = io(url, {
        transports: ["websocket", "polling"],
    })

    socket.on("connect", () => {
        console.log("✅ Socket connected!", socket?.id)
    })

    socket.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err)
    })
    return socket
}

export const closeSocket = (): void => {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}
