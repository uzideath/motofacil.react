import { io, type Socket } from "socket.io-client"

// Singleton pattern for socket connection
let socket: Socket | null = null
let isConnecting = false
let reconnectAttempts = 0
const maxReconnectAttempts = 5

export const getSocket = (): Socket => {
    if (!socket && !isConnecting) {
        isConnecting = true
        console.log("Initializing socket connection...")

        // Create socket connection
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        console.log(`Connecting to WebSocket at ${apiUrl}`)

        socket = io(apiUrl, {
            transports: ["websocket", "polling"], // Intentar WebSocket primero, luego polling como fallback
            reconnectionAttempts: maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true,
        })

        // Log connection events
        socket.on("connect", () => {
            console.log("Socket connected successfully")
            isConnecting = false
            reconnectAttempts = 0
        })

        socket.on("disconnect", (reason) => {
            console.log(`Socket disconnected: ${reason}`)
        })

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error)
            reconnectAttempts++

            if (reconnectAttempts >= maxReconnectAttempts) {
                console.error(`Failed to connect after ${maxReconnectAttempts} attempts`)
                isConnecting = false
                socket = null
            }
        })

        // Debug events
        socket.on("connection_established", (data) => {
            console.log("Connection established with server:", data)
        })

        socket.on("whatsapp_log", (data) => {
            console.log(`WhatsApp Log [${data.type}]: ${data.message}`)
        })

        socket.onAny((event, ...args) => {
            console.log(`Socket event received: ${event}`, args)
        })
    }

    return socket as Socket
}

export const disconnectSocket = (): void => {
    if (socket) {
        console.log("Disconnecting socket")
        socket.disconnect()
        socket = null
        isConnecting = false
    }
}

export const requestQrCode = (): void => {
    const socketInstance = getSocket()
    console.log("Requesting QR code from server")
    socketInstance.emit("request_qr")
}
