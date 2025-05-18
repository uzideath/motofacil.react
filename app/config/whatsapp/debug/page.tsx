"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Bug, Smartphone, Wifi, WifiOff } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { HttpService } from "@/lib/http"
import { getSocket, requestQrCode } from "@/lib/socket"

export default function WhatsappDebugPage() {
    const [socketInfo, setSocketInfo] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [lastEvent, setLastEvent] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        fetchDebugInfo()
        setupEventListeners()
    }, [])

    const fetchDebugInfo = async () => {
        try {
            setIsLoading(true)
            const response = await HttpService.get("/api/v1/whatsapp/debug")
            setSocketInfo(response.data)
        } catch (error) {
            console.error("Error fetching debug info:", error)
            toast({
                title: "Error",
                description: "No se pudo obtener información de depuración",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const setupEventListeners = () => {
        const socket = getSocket()
        if (!socket) return

        const handleAnyEvent = (event: string, ...args: any[]) => {
            setLastEvent(`${event} - ${new Date().toISOString()}`)
            console.log(`Debug: Event received: ${event}`, args)
        }

        socket.onAny(handleAnyEvent)

        return () => {
            socket.offAny(handleAnyEvent)
        }
    }

    const handleRequestQr = () => {
        requestQrCode()
        toast({
            title: "Solicitud enviada",
            description: "Solicitud de QR enviada a través de WebSocket",
        })
    }

    const handleHttpRequestQr = async () => {
        try {
            setIsLoading(true)
            await HttpService.post("/api/v1/whatsapp/request-qr")
            toast({
                title: "Solicitud enviada",
                description: "Solicitud de QR enviada a través de HTTP",
            })
        } catch (error) {
            console.error("Error requesting QR:", error)
            toast({
                title: "Error",
                description: "No se pudo solicitar el código QR",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleReconnectSocket = () => {
        const socket = getSocket()
        if (socket) {
            if (!socket.connected) {
                socket.connect()
                toast({
                    title: "Reconectando",
                    description: "Intentando reconectar el socket",
                })
            } else {
                toast({
                    title: "Socket conectado",
                    description: "El socket ya está conectado",
                })
            }
        } else {
            toast({
                title: "Error",
                description: "No se pudo obtener la instancia del socket",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Bug className="h-6 w-6 text-red-400" />
                        Depuración de WhatsApp
                    </h1>
                    <p className="text-blue-300 mt-1">Herramientas para diagnosticar problemas con la conexión de WhatsApp</p>
                </div>
                <Button onClick={fetchDebugInfo} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    Actualizar
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-dark-blue-900/80 border-dark-blue-800/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-blue-300 flex items-center gap-2">
                            <Wifi className="h-5 w-5" />
                            Estado de la Conexión
                        </CardTitle>
                        <CardDescription className="text-blue-100">Información sobre la conexión WebSocket</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {socketInfo ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-dark-blue-800/50 rounded-lg">
                                    <div className="flex items-center">
                                        {socketInfo.socketConnected ? (
                                            <Wifi className="h-5 w-5 text-green-400 mr-2" />
                                        ) : (
                                            <WifiOff className="h-5 w-5 text-red-400 mr-2" />
                                        )}
                                        <span className="text-blue-100">Estado del Socket</span>
                                    </div>
                                    <span className={socketInfo.socketConnected ? "text-green-400" : "text-red-400"}>
                                        {socketInfo.socketConnected ? "Conectado" : "Desconectado"}
                                    </span>
                                </div>

                                <div className="p-3 bg-dark-blue-800/50 rounded-lg">
                                    <h3 className="text-blue-200 mb-2">Información del Socket</h3>
                                    <div className="text-sm text-blue-100 space-y-1">
                                        <p>ID: {socketInfo.socketId || "No disponible"}</p>
                                        <p>Timestamp: {socketInfo.timestamp}</p>
                                        <p>API URL: {socketInfo.environment.apiUrl}</p>
                                        <p>Entorno: {socketInfo.environment.nodeEnv}</p>
                                    </div>
                                </div>

                                <div className="p-3 bg-dark-blue-800/50 rounded-lg">
                                    <h3 className="text-blue-200 mb-2">Último Evento</h3>
                                    <p className="text-sm text-blue-100">{lastEvent || "Ningún evento recibido"}</p>
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={handleReconnectSocket} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <Wifi className="mr-2 h-4 w-4" />
                                        Reconectar Socket
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center p-6">
                                <RefreshCw className="animate-spin h-8 w-8 text-blue-400" />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-dark-blue-900/80 border-dark-blue-800/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-blue-300 flex items-center gap-2">
                            <Smartphone className="h-5 w-5" />
                            Acciones de Depuración
                        </CardTitle>
                        <CardDescription className="text-blue-100">
                            Herramientas para probar la funcionalidad de WhatsApp
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-dark-blue-800/50 rounded-lg">
                            <h3 className="text-blue-200 mb-3">Solicitar Código QR</h3>
                            <div className="space-y-3">
                                <Button onClick={handleRequestQr} className="w-full bg-green-600 hover:bg-green-700 text-white">
                                    <Smartphone className="mr-2 h-4 w-4" />
                                    Solicitar QR vía WebSocket
                                </Button>
                                <Button
                                    onClick={handleHttpRequestQr}
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Smartphone className="mr-2 h-4 w-4" />
                                    Solicitar QR vía HTTP
                                </Button>
                            </div>
                        </div>

                        <div className="p-4 bg-dark-blue-800/50 rounded-lg">
                            <h3 className="text-blue-200 mb-3">Instrucciones</h3>
                            <ol className="list-decimal list-inside text-sm text-blue-100 space-y-2">
                                <li>Verifica que el socket esté conectado</li>
                                <li>Intenta solicitar un código QR usando ambos métodos</li>
                                <li>Revisa la consola del navegador para ver los eventos recibidos</li>
                                <li>Si el socket está desconectado, usa el botón "Reconectar Socket"</li>
                                <li>Actualiza la información para ver los cambios en el estado</li>
                            </ol>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
