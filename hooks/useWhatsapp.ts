"use client"

import { useContext } from "react"
import type { WhatsAppInfo, WhatsAppLogPayload } from "@/lib/socket"
import { WhatsAppContext } from "@/context/whatsapp"

interface ApiResponse {
    success: boolean
    message: string
    [key: string]: unknown
}

interface UseWhatsAppReturn {
    qrCode: string | null
    isConnected: boolean
    isConnecting: boolean
    connectionInfo: WhatsAppInfo | null
    logs: WhatsAppLogPayload[]
    requestQrCode: () => void
    reconnect: () => Promise<ApiResponse>
    logout: () => Promise<ApiResponse>
}

export const useWhatsApp = (): UseWhatsAppReturn => {
    const context = useContext(WhatsAppContext)

    if (context === undefined) {
        throw new Error("useWhatsApp must be used within a WhatsAppProvider")
    }

    return context
}
