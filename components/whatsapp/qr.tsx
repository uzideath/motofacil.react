"use client"

import { useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Smartphone } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useToast } from "@/components/ui/use-toast"
import { useWhatsApp } from "@/context/whatsapp"

export function QRCodeScanner() {
    const {
        status,
        qrCode,
        isLoading,
        error,
        reconnect,
        requestQrCode,
    } = useWhatsApp()

    const [isRequestingQr, setIsRequestingQr] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        console.log("🧪 COMPONENT MOUNTED")
        console.log("🧪 status?.isReady:", status?.isReady)
        console.log("🧪 qrCode:", qrCode)
        console.log("🧪 isLoading:", isLoading)
    }, [status?.isReady, qrCode, isLoading])

    useEffect(() => {
        if (!status?.isReady && !qrCode && !isLoading && !isRequestingQr) {
            console.log("📲 No conectado, solicitando QR inicial...")
            handleRequestQrCode()
        }
    }, [status?.isReady, qrCode, isLoading])

    const handleRequestQrCode = async () => {
        try {
            setIsRequestingQr(true)
            console.log("📨 Solicitando nuevo QR manualmente")
            requestQrCode()

            toast({
                title: "Solicitud enviada",
                description: "Generando nuevo código QR...",
            })
        } catch (error) {
            console.error("❌ Error solicitando QR:", error)
            toast({
                title: "Error",
                description: "No se pudo solicitar un nuevo código QR",
                variant: "destructive",
            })
        } finally {
            setIsRequestingQr(false)
        }
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
                    {/* Estado cargando */}
                    {(isLoading || isRequestingQr) && (
                        <div className="flex flex-col items-center justify-center">
                            <RefreshCw className="animate-spin h-12 w-12 text-blue-400 mb-4" />
                            <p className="text-blue-300">
                                {isRequestingQr ? "Generando código QR..." : "Cargando..."}
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {error && !isLoading && (
                        <div className="text-center">
                            <p className="text-red-400 mb-4">{error}</p>
                            <Button onClick={reconnect} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reintentar conexión
                            </Button>
                        </div>
                    )}

                    {/* QR válido */}
                    {qrCode && qrCode.length > 10 && (
                        <>
                            <p className="text-green-400 font-bold">✅ QR válido recibido</p>
                            <div className="bg-white p-4 rounded-lg">
                                <QRCodeSVG value={qrCode} size={256} />
                            </div>
                            <p className="text-xs text-blue-300 mt-2">Longitud del QR: {qrCode.length}</p>
                            <pre className="text-xs text-yellow-300 break-all text-center max-w-xs">{qrCode}</pre>
                        </>
                    )}

                    {/* QR inválido */}
                    {(!qrCode || qrCode.length <= 10) && !isLoading && !error && (
                        <div className="text-center">
                            <p className="text-yellow-400 font-medium">⚠️ No se ha recibido un QR válido</p>
                            <Button
                                onClick={handleRequestQrCode}
                                disabled={isRequestingQr}
                                className="bg-blue-600 hover:bg-blue-700 text-white mt-4"
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${isRequestingQr ? "animate-spin" : ""}`} />
                                Solicitar código QR
                            </Button>

                            {/* QR de prueba (control visual) */}
                            <div className="mt-6 text-sm text-blue-200">
                                <p className="mb-2">🧪 QR de prueba fijo:</p>
                                <div className="bg-white p-2 rounded-md">
                                    <QRCodeSVG value="https://wa.me/573001234567" size={150} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Instrucciones */}
                    <div className="text-center mt-6 text-blue-200/70">
                        <p className="mb-2">Pasos para conectar WhatsApp:</p>
                        <ol className="list-decimal list-inside text-left space-y-2 text-sm">
                            <li>Abre WhatsApp en tu teléfono</li>
                            <li>Selecciona <b>Dispositivos vinculados</b></li>
                            <li>Toca <b>Vincular un dispositivo</b></li>
                            <li>Escanea el código QR de esta pantalla</li>
                        </ol>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
