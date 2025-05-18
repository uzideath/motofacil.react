import { io, type Socket } from "socket.io-client"

// Singleton pattern for socket connection
let socket: Socket | null = null
let isConnecting = false
let reconnectAttempts = 0
const maxReconnectAttempts = 5

// Mejorar el manejo de eventos para asegurar que se recibe el QR
export const getSocket = (): Socket => {
    if (!socket && !isConnecting) {
        isConnecting = true
        console.log("Initializing socket connection...")

        // Create socket connection
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
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

        // Registrar específicamente el evento QR para depuración
        socket.on("qr", (data) => {
            console.log(
                "QR event received in socket.ts:",
                data.qr ? `${data.qr.substring(0, 20)}... (length: ${data.qr.length})` : "No QR data",
            )
        })

        socket.onAny((event, ...args) => {
            console.log(`Socket event received: ${event}`, args.length > 0 ? "with data" : "without data")
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

    if (!socketInstance) {
        console.error("No socket instance available")
        return
    }

    if (!socketInstance.connected) {
        console.log("Socket not connected, attempting to connect")
        socketInstance.connect()

        // Esperar a que se conecte antes de enviar la solicitud
        socketInstance.once("connect", () => {
            console.log("Socket connected, now requesting QR code")
            socketInstance.emit("request_qr")
        })

        return
    }

    console.log("Requesting QR code from server via socket")
    socketInstance.emit("request_qr")
}
