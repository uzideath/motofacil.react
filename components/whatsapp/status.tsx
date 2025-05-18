"use client"

import { Badge } from "@/components/ui/badge"
import { useWhatsApp } from "@/context/whatsapp"
import { Smartphone } from 'lucide-react'


export function WhatsappStatus() {
    const { status, isLoading } = useWhatsApp()

    if (isLoading) {
        return null
    }

    return (
        <Badge
            variant={status?.isReady ? "default" : "outline"}
            className={
                status?.isReady
                    ? "bg-green-600/80 hover:bg-green-700 text-white border-green-500 flex items-center gap-1"
                    : "bg-transparent border-red-500/50 text-red-400 flex items-center gap-1"
            }
        >
            <Smartphone className="h-3 w-3" />
            {status?.isReady ? "WhatsApp Conectado" : "WhatsApp Desconectado"}
        </Badge>
    )
}