import { useEffect, useState } from "react"
import { getSocket, disconnectSocket } from "@/lib/socket"
import type { Socket } from "socket.io-client"

export function useSocket() {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        // Initialize socket connection
        const socketInstance = getSocket()
        setSocket(socketInstance)

        // Set up event listeners
        const onConnect = () => setIsConnected(true)
        const onDisconnect = () => setIsConnected(false)

        socketInstance.on("connect", onConnect)
        socketInstance.on("disconnect", onDisconnect)

        // Set initial connection state
        setIsConnected(socketInstance.connected)

        // Clean up on unmount
        return () => {
            socketInstance.off("connect", onConnect)
            socketInstance.off("disconnect", onDisconnect)
        }
    }, [])

    return { socket, isConnected }
}