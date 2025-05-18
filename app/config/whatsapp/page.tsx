"use client"


import { Card } from "@/components/ui/card"
import WhatsAppQrCode from "@/components/whatsapp/qr"
import { WhatsAppProvider } from "@/context/whatsapp"
import type { JSX } from "react"

export default function WhatsAppPage(): JSX.Element {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto py-10 px-4 h-[calc(100vh-80px)] flex flex-col">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Conexión de WhatsApp</h1>
                    <p className="text-muted-foreground text-lg">
                        Conecta tu cuenta de WhatsApp para habilitar la funcionalidad de mensajería
                    </p>
                </div>

                <Card className="border-0 shadow-lg overflow-hidden flex-1 flex flex-col">
                    <WhatsAppProvider>
                        <WhatsAppQrCode showLogs={true} />
                    </WhatsAppProvider>
                </Card>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    <p>Escanea el código QR con tu aplicación móvil de WhatsApp para establecer una conexión</p>
                    <p className="mt-1">Tus datos de WhatsApp permanecen privados y seguros</p>
                </div>
            </div>
        </div>
    )
}
