"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QRCodeScanner } from "@/components/whatsapp/qr"
import { WhatsAppProvider } from "@/context/whatsapp"
import { Smartphone } from 'lucide-react'

export default function WhatsappConfigPage() {
    return (
        <WhatsAppProvider>
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Smartphone className="h-6 w-6 text-blue-400" />
                            Configuración de WhatsApp
                        </h1>
                        <p className="text-blue-300 mt-1">
                            Conecta y administra la integración de WhatsApp para enviar recibos y notificaciones.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <QRCodeScanner />

                    <Card className="bg-dark-blue-900/80 border-dark-blue-800/50 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-blue-300">Instrucciones</CardTitle>
                            <CardDescription className="text-blue-100">Cómo conectar y usar WhatsApp en el sistema</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-blue-200/70">
                            <div>
                                <h3 className="font-medium text-blue-200 mb-2">¿Por qué conectar WhatsApp?</h3>
                                <p>
                                    La integración con WhatsApp permite enviar recibos y notificaciones directamente a los clientes
                                    desde el sistema, mejorando la comunicación y reduciendo el trabajo manual.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium text-blue-200 mb-2">Consideraciones importantes</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>La conexión debe realizarse desde un dispositivo con WhatsApp instalado</li>
                                    <li>Se recomienda usar un número dedicado para el negocio</li>
                                    <li>La sesión permanecerá activa hasta que se cierre manualmente</li>
                                    <li>Si cambia de dispositivo o reinstala WhatsApp, deberá volver a escanear el código QR</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-medium text-blue-200 mb-2">Solución de problemas</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Si el código QR no aparece, haga clic en "Solicitar código QR"</li>
                                    <li>Si la conexión falla, asegúrese de que su teléfono tenga conexión a internet</li>
                                    <li>Para reconectar, use el botón "Reconectar" en la sección de conexión</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </WhatsAppProvider>
    )
}
