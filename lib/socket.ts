import { io, type Socket } from "socket.io-client"

type QrCallback = (qr: string) => void
type StatusCallback = (status: any) => void
type ErrorCallback = (message: string) => void

let socket: Socket | null = null
let isConnecting = false
let reconnectAttempts = 0
const maxReconnectAttempts = 5

// Callbacks registrados desde el contexto u otras partes
let qrListener: QrCallback | null = null
let statusConnectedListener: StatusCallback | null = null
let statusDisconnectedListener: StatusCallback | null = null
let errorListener: ErrorCallback | null = null

const setupListeners = (socketInstance: Socket) => {
    socketInstance.on("connect", () => {
        console.log("✅ Socket conectado correctamente")
        isConnecting = false
        reconnectAttempts = 0
    })

    socketInstance.on("disconnect", (reason) => {
        console.warn(`⚠️ Socket desconectado: ${reason}`)
    })

    socketInstance.on("connect_error", (error) => {
        console.error("❌ Error de conexión del socket:", error)
        reconnectAttempts++
        if (reconnectAttempts >= maxReconnectAttempts) {
            console.error(`❌ Falló la conexión tras ${maxReconnectAttempts} intentos`)
            isConnecting = false
            socketInstance.disconnect()
            socket = null
        }
    })

    socketInstance.on("connection_established", (data) => {
        console.log("🌐 Conexión establecida:", data)
    })

    socketInstance.on("qr", (data) => {
        console.log("📲 QR recibido desde el servidor:", data.qr?.substring(0, 30) + "...")
        if (qrListener && data.qr) {
            qrListener(data.qr)
        }
    })

    socketInstance.on("whatsapp_connected", (data) => {
        console.log("✅ Estado conectado recibido:", data)
        if (statusConnectedListener) statusConnectedListener(data)
    })

    socketInstance.on("whatsapp_disconnected", (data) => {
        console.log("🔌 Estado desconectado recibido:", data)
        if (statusDisconnectedListener) statusDisconnectedListener(data)
    })

    socketInstance.on("whatsapp_log", (data) => {
        console.log(`🧾 WhatsApp Log [${data.type}]: ${data.message}`)
    })

    socketInstance.on("qr_requested", (data) => {
        console.log("📤 QR solicitado manualmente desde el cliente", data)
    })

    socketInstance.onAny((event, ...args) => {
        console.log(`📡 Evento socket recibido: ${event}`, args.length > 0 ? "con datos" : "")
    })
}

export const getSocket = (): Socket => {
    if (!socket && !isConnecting) {
        isConnecting = true
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

        console.log("🔌 Iniciando conexión WebSocket con:", apiUrl)

        socket = io(apiUrl, {
            transports: ["websocket", "polling"],
            reconnectionAttempts: maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true,
        })

        setupListeners(socket)
    }

    return socket as Socket
}

export const disconnectSocket = (): void => {
    if (socket) {
        console.log("🛑 Desconectando socket manualmente")
        socket.disconnect()
        socket = null
        isConnecting = false
    }
}

export const requestQrCode = (): void => {
    const socketInstance = getSocket()

    if (!socketInstance) {
        console.error("❌ No hay instancia activa del socket")
        return
    }

    if (!socketInstance.connected) {
        console.log("⏳ Socket no conectado, esperando reconexión")
        socketInstance.connect()
        socketInstance.once("connect", () => {
            console.log("✅ Re-conectado, solicitando nuevo QR")
            socketInstance.emit("request_qr")
        })
        return
    }

    console.log("📨 Solicitando QR al servidor vía socket")
    socketInstance.emit("request_qr")
}

// Funciones para registrar callbacks
export const onQrReceived = (callback: QrCallback) => {
    qrListener = callback
}

export const onStatusConnected = (callback: StatusCallback) => {
    statusConnectedListener = callback
}

export const onStatusDisconnected = (callback: StatusCallback) => {
    statusDisconnectedListener = callback
}

export const onSocketError = (callback: ErrorCallback) => {
    errorListener = callback
}
