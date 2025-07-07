"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from 'lucide-react'
import { useWhatsApp } from "@/hooks/useWhatsapp"
import { useState } from "react"
import { useToast } from "@/hooks/useToast"

export function LogoutButton() {
    const { logout, isConnected } = useWhatsApp()
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const { toast } = useToast()

    const handleLogout = async () => {
        if (!isConnected) return

        setIsLoggingOut(true)
        try {
            const response = await logout()

            if (response.success) {
                toast({
                    title: "Desconectado exitosamente",
                    description: "Tu sesión de WhatsApp ha sido cerrada correctamente.",
                    variant: "default",
                })
            } else {
                toast({
                    title: "Error al desconectar",
                    description: response.message || "No se pudo cerrar la sesión de WhatsApp.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error al desconectar",
                description: "Ocurrió un error al intentar cerrar la sesión de WhatsApp.",
                variant: "destructive",
            })
        } finally {
            setIsLoggingOut(false)
        }
    }

    if (!isConnected) return null

    return (
        <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleLogout}
            disabled={isLoggingOut}
        >
            {isLoggingOut ? (
                <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Desconectando...
                </>
            ) : (
                <>
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                </>
            )}
        </Button>
    )
}
