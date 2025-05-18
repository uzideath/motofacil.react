import { io, Socket } from "socket.io-client"

// Singleton pattern for socket connection
let socket: Socket | null = null

export const getSocket = (): Socket => {
    if (!socket) {
        // Create socket connection
        socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000", {
            transports: ["websocket"],
            autoConnect: true,
        })

        // Log connection events
        socket.on("connect", () => {
            console.log("Socket connected")
        })

        socket.on("disconnect", () => {
            console.log("Socket disconnected")
        })

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error)
        })
    }

    return socket
}

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}
