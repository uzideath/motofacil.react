"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Smartphone } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { HttpService } from "@/lib/http"
import { useToast } from "@/components/ui/use-toast"
import { useWhatsApp } from "@/context/whatsapp"

export function QRCodeScanner() {
    const { status, qrCode, isLoading, error, reconnect, requestQrCode } = useWhatsApp()
    const [isRequestingQr, setIsRequestingQr] = useState(false)
    const { toast } = useToast()

    // Solicitar QR code al montar el componente si no estamos conectados
    useEffect(() => {
        if (!status?.isReady && !qrCode && !isLoading) {
            console.log("Requesting QR code on component mount")
            handleRequestQrCode()
        }
    }, [status?.isReady, qrCode, isLoading])

    // Función para manejar la solicitud de QR
    const handleRequestQrCode = async () => {
        try {
            setIsRequestingQr(true)
            console.log("Requesting new QR code...")

            // Llamar al endpoint del API
            await HttpService.post("/api/v1/whatsapp/request-qr")

            // También llamar a la función del contexto
            requestQrCode()

            toast({
                title: "Solicitud enviada",
                description: "Generando nuevo código QR...",
                variant: "default",
            })
        } catch (error) {
            console.error("Error requesting QR:", error)
            toast({
                title: "Error",
                description: "No se pudo solicitar un nuevo código QR",
                variant: "destructive",
            })
        } finally {
            setIsRequestingQr(false)
        }
    }

    if (status?.isReady) {
        return (
            <Card className="bg-dark-blue-900/80 border-dark-blue-800/50 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-green-400 flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        WhatsApp Conectado
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                        La conexión con WhatsApp está activa y funcionando correctamente.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center p-6 space-y-4">
                        <div className="bg-green-600/20 p-6 rounded-full">
                            <Smartphone className="h-16 w-16 text-green-500" />
                        </div>
                        <p className="text-green-400 text-lg font-medium">Listo para enviar mensajes</p>
                        <Button
                            variant="outline"
                            onClick={reconnect}
                            className="bg-dark-blue-800/50 border-dark-blue-700/50 text-blue-300 hover:bg-dark-blue-700/70"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reconectar
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-dark-blue-900/80 border-dark-blue-800/50 shadow-lg">
            <CardHeader>
                <CardTitle className="text-blue-300 flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Conectar WhatsApp
                </CardTitle>
                <CardDescription className="text-blue-100">
                    Escanea el código QR con tu teléfono para conectar WhatsApp.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center p-6 space-y-4">
                    {isLoading || isRequestingQr ? (
                        <div className="flex flex-col items-center justify-center p-6">
                            <RefreshCw className="animate-spin h-12 w-12 text-blue-400 mb-4" />
                            <p className="text-blue-300">{isRequestingQr ? "Generando código QR..." : "Cargando..."}</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center p-6 text-center">
                            <p className="text-red-400 mb-4">{error}</p>
                            <Button onClick={reconnect} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reintentar
                            </Button>
                        </div>
                    ) : qrCode ? (
                        <div className="bg-white p-4 rounded-lg">
                            <QRCodeSVG value={qrCode} size={256} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center">
                            <p className="text-blue-300 mb-4">Esperando código QR...</p>
                            <Button
                                onClick={handleRequestQrCode}
                                disabled={isRequestingQr}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${isRequestingQr ? "animate-spin" : ""}`} />
                                Solicitar código QR
                            </Button>
                        </div>
                    )}

                    <div className="text-center mt-4 text-blue-200/70">
                        <p className="mb-2">Para conectar WhatsApp:</p>
                        <ol className="list-decimal list-inside text-left space-y-2">
                            <li>Abre WhatsApp en tu teléfono</li>
                            <li>Toca en Menú o Configuración y selecciona WhatsApp Web</li>
                            <li>Apunta tu teléfono hacia esta pantalla para escanear el código QR</li>
                        </ol>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
