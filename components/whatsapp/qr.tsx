"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Smartphone, Check, AlertTriangle, QrCode, Info, Clock, Activity } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import type { WhatsAppLogPayload } from "@/lib/socket"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { PlatformIcon } from "@/components/ui/platform-icon"
import { CountryFlag } from "@/components/ui/country-flag"
import { useWhatsApp } from "@/hooks/useWhatsapp"
import { formatPhoneNumber, CountryData } from "@/lib/countries"
import { getPlatformInfo } from "@/lib/phones"
import { LogoutButton } from "./logout"

export interface WhatsAppQrCodeProps {
    title?: string
    description?: string
    showLogs?: boolean
    maxLogs?: number
}

export const WhatsAppQrCode: React.FC<WhatsAppQrCodeProps> = ({
    title = "Conexión de WhatsApp",
    description = "Escanea el código QR con tu WhatsApp para conectar",
    showLogs = false,
    maxLogs = 5,
}) => {
    const { qrCode, isConnected, isConnecting, connectionInfo, logs, requestQrCode, reconnect } = useWhatsApp()

    // Estado de verificación inicial
    const [isVerifying, setIsVerifying] = useState<boolean>(true)

    // QR code expiration timer (60 seconds is typical for WhatsApp)
    const [qrExpiration, setQrExpiration] = useState<number>(60)
    const [qrExpirationActive, setQrExpirationActive] = useState<boolean>(false)
    const [isQrExpired, setIsQrExpired] = useState<boolean>(false)

    // Efecto para simular la verificación inicial
    useEffect(() => {
        const verificationTimer = setTimeout(() => {
            setIsVerifying(false)
        }, 2500) // Mostrar el spinner de verificación durante 2.5 segundos

        return () => clearTimeout(verificationTimer)
    }, [])

    // Auto request new QR code when expired
    const handleQrExpired = useCallback(async (): Promise<void> => {
        setIsQrExpired(true)
        try {
            await reconnect()
            setTimeout(() => {
                requestQrCode()
            }, 1000)
        } catch (error) {
            console.error("Error al reconectar:", error)
            setTimeout(() => {
                requestQrCode()
            }, 3000)
        }
    }, [reconnect, requestQrCode])

    // Auto request QR code on initial load
    useEffect(() => {
        if (!qrCode && !isConnected && !isConnecting && !isVerifying) {
            const timer = setTimeout(() => {
                requestQrCode()
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [qrCode, isConnected, isConnecting, isVerifying, requestQrCode])

    // Effect to handle QR code received
    useEffect(() => {
        if (qrCode) {
            setIsQrExpired(false)

            // Start QR code expiration timer
            setQrExpiration(60)
            setQrExpirationActive(true)
        } else {
            setQrExpirationActive(false)
        }
    }, [qrCode])

    // QR code expiration timer
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null

        if (qrExpirationActive && qrExpiration > 0) {
            timer = setInterval(() => {
                setQrExpiration((prev) => prev - 1)
            }, 1000)
        } else if (qrExpiration === 0) {
            setQrExpirationActive(false)
            handleQrExpired()
        }

        return () => {
            if (timer) clearInterval(timer)
        }
    }, [qrExpirationActive, qrExpiration, handleQrExpired])

    const recentLogs: WhatsAppLogPayload[] = showLogs ? logs.slice(-maxLogs) : []

    // Calculate QR expiration progress
    const qrExpirationProgress = qrExpirationActive ? (qrExpiration / 60) * 100 : 0

    // Format phone number if available
    const phoneInfo = connectionInfo?.wid?.user
        ? formatPhoneNumber(connectionInfo.wid.user)
        : {
            formatted: "Desconocido",
            country: {
                code: "INTL",
                name: "Internacional",
                dialCode: "",
                flag: "globe",
                format: (number: string) => number,
            } as CountryData,
        }

    // Get platform info
    const platformInfo = getPlatformInfo(connectionInfo?.platform || "Desconocido")

    // Si estamos verificando, mostrar el spinner de carga
    if (isVerifying) {
        return (
            <div className="flex flex-col h-full">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2">{title}</CardTitle>
                            <CardDescription className="mt-1 text-base">{description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-8 flex-1 flex flex-col items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-16 w-16 text-primary/70 animate-spin mx-auto mb-6" />
                        <h3 className="text-2xl font-medium mb-3">Verificando conexión</h3>
                        <p className="text-muted-foreground max-w-md text-lg">
                            Comprobando el estado de la conexión de WhatsApp...
                        </p>
                    </div>
                </CardContent>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            {title}
                            <ConnectionStatusBadge isConnected={isConnected} isConnecting={isConnecting} />
                        </CardTitle>
                        <CardDescription className="mt-1 text-base">{description}</CardDescription>
                    </div>
                    {isConnected && (
                        <div className="ml-auto">
                            <LogoutButton />
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-8 flex-1 flex flex-col">
                <div className="grid lg:grid-cols-2 gap-8 h-full">
                    {/* Left column - QR Code */}
                    <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800/20 rounded-xl p-8 shadow-sm border">
                        <AnimatePresence mode="wait">
                            {isConnected ? (
                                <motion.div
                                    key="connected"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-center"
                                >
                                    <div className="w-40 h-40 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                                        <Check className="h-20 w-20 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-2xl font-medium mt-6">Conectado Exitosamente</h3>
                                    <p className="text-muted-foreground mt-2 text-lg">
                                        Tu cuenta de WhatsApp está ahora conectada y lista para usar
                                    </p>
                                </motion.div>
                            ) : qrCode ? (
                                <motion.div
                                    key="qrcode"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-[330px] h-[330px] rounded-lg border-2 border-dashed border-primary/50 animate-pulse" />
                                        </div>

                                        <div className="p-6 bg-white rounded-lg shadow-md relative z-10">
                                            <QRCodeSVG value={qrCode} size={300} />
                                        </div>
                                    </div>

                                    {qrExpirationActive && (
                                        <div className="mt-6 w-full max-w-[312px]">
                                            <div className="flex items-center text-sm text-muted-foreground mb-2">
                                                <Clock className="h-4 w-4 mr-1.5" />
                                                <span>El código QR expira en {qrExpiration} segundos</span>
                                            </div>
                                            <Progress value={qrExpirationProgress} className="h-2" />
                                        </div>
                                    )}
                                    {isConnecting && (
                                        <div className="mt-4 text-center text-muted-foreground text-sm">
                                            <span className="inline-flex items-center gap-2 animate-pulse">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Esperando escaneo del QR...
                                            </span>
                                        </div>
                                    )}

                                </motion.div>

                            ) : (
                                <motion.div
                                    key="waiting"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center"
                                >
                                    <div className="relative w-40 h-40 mx-auto mb-6">
                                        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                                        <div className="relative flex items-center justify-center w-full h-full">
                                            {isQrExpired ? (
                                                <Loader2 className="h-20 w-20 text-primary/70 animate-spin" />
                                            ) : (
                                                <QrCode className="h-20 w-20 text-primary/70" />
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-medium mb-3">
                                        {isQrExpired ? "Esperando un nuevo código QR" : "Esperando código QR"}
                                    </h3>
                                    <p className="text-muted-foreground max-w-md text-lg">
                                        {isQrExpired
                                            ? "El código QR ha expirado. Generando uno nuevo automáticamente..."
                                            : "Generando un código QR para conectar tu WhatsApp..."}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {qrCode && !isConnected && (
                            <div className="mt-8 text-center max-w-md">
                                <h3 className="font-medium text-xl mb-3">Cómo conectar</h3>
                                <ol className="mt-2 text-base text-muted-foreground text-left space-y-3">
                                    <li className="flex items-start">
                                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full h-6 w-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                                            1
                                        </span>
                                        <span>Abre WhatsApp en tu teléfono</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full h-6 w-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                                            2
                                        </span>
                                        <span>Toca Menú o Ajustes y selecciona WhatsApp Web</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full h-6 w-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                                            3
                                        </span>
                                        <span>Apunta tu teléfono a esta pantalla para escanear el código QR</span>
                                    </li>
                                </ol>
                            </div>
                        )}
                    </div>

                    {/* Right column - Status */}
                    <div className="flex flex-col">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border h-full flex flex-col">
                            <div className="flex items-center gap-2 mb-5 pb-4 border-b">
                                <Activity className="h-5 w-5 text-primary" />
                                <h3 className="font-medium text-xl">Estado de Conexión</h3>
                            </div>

                            <AnimatePresence mode="wait">
                                {isConnected ? (
                                    <motion.div
                                        key="connected-status"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-6 flex-1"
                                    >
                                        <div className="flex items-center gap-3 bg-green-100 dark:bg-green-900/30 p-4 rounded-lg">
                                            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                                            <span className="font-medium text-green-800 dark:text-green-300 text-lg">WhatsApp Conectado</span>
                                        </div>

                                        {connectionInfo && (
                                            <div className="space-y-4">
                                                <h4 className="font-medium text-lg">Información del Dispositivo</h4>
                                                <div className="bg-white dark:bg-slate-800/60 p-4 rounded-lg border">
                                                    <div className="grid grid-cols-[150px_1fr] gap-y-4 gap-x-4 text-base">
                                                        <div className="font-medium text-muted-foreground">Número de Teléfono:</div>
                                                        <div className="flex items-center gap-2">
                                                            <CountryFlag country={phoneInfo.country} size="md" />
                                                            <div className="flex flex-col">
                                                                <span>{phoneInfo.formatted}</span>
                                                                <span className="text-xs text-muted-foreground">{phoneInfo.country.name}</span>
                                                            </div>
                                                        </div>

                                                        <div className="font-medium text-muted-foreground">Plataforma:</div>
                                                        <div className="flex items-center gap-2">
                                                            <PlatformIcon platform={platformInfo.icon} size={16} />
                                                            <span>{platformInfo.name}</span>
                                                        </div>

                                                        <div className="font-medium text-muted-foreground">Estado:</div>
                                                        <div className="text-green-600 dark:text-green-400 flex items-center gap-1.5">
                                                            <span className="relative flex h-2.5 w-2.5">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                                            </span>
                                                            Activo
                                                        </div>

                                                        <div className="font-medium text-muted-foreground">Conectado en:</div>
                                                        <div>{new Date().toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-base text-blue-800 dark:text-blue-300 flex items-start gap-3">
                                            <Smartphone className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium mb-1">Conexión Exitosa</p>
                                                <p>
                                                    Tu cuenta de WhatsApp está conectada correctamente y lista para usar. Ahora puedes enviar y
                                                    recibir mensajes a través de esta conexión.
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="disconnected-status"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-6 flex-1"
                                    >
                                        <div className="flex items-center gap-3 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg">
                                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                            <span className="font-medium text-red-800 dark:text-red-300 text-lg">No Conectado</span>
                                        </div>

                                        <div className="grid grid-cols-[150px_1fr] gap-y-4 gap-x-4 text-base bg-white dark:bg-slate-800/60 p-4 rounded-lg border">
                                            <div className="font-medium text-muted-foreground">Estado:</div>
                                            <div className="text-red-600 dark:text-red-400 flex items-center gap-1.5">
                                                <span className="relative flex h-2.5 w-2.5">
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                                </span>
                                                Desconectado
                                            </div>
                                            <div className="font-medium text-muted-foreground">Última Actividad:</div>
                                            <div>{new Date().toLocaleString()}</div>
                                            <div className="font-medium text-muted-foreground">Conexión:</div>
                                            <div>{qrCode ? "Código QR Generado" : "Sin Código QR"}</div>
                                            <div className="font-medium text-muted-foreground">Siguiente Paso:</div>
                                            <div>{qrCode ? "Escanear Código QR" : "Generando Código QR"}</div>
                                        </div>

                                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-base text-amber-800 dark:text-amber-300 flex items-start gap-3">
                                            <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium mb-1">Conexión Requerida</p>
                                                <p>
                                                    {qrCode
                                                        ? "Escanea el código QR con tu aplicación móvil de WhatsApp para conectar tu cuenta. El código QR expirará después de 60 segundos si no se escanea."
                                                        : "Espera mientras se genera un código QR, luego escanéalo con tu aplicación móvil de WhatsApp para establecer una conexión."}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {showLogs && (
                                <div className="mt-auto pt-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-base font-medium flex items-center">
                                            <Activity className="h-4 w-4 mr-2" />
                                            Actividad Reciente
                                        </h4>
                                        {recentLogs.length > 0 && (
                                            <Badge variant="outline" className="font-mono">
                                                {recentLogs.length} {recentLogs.length === 1 ? "entrada" : "entradas"}
                                            </Badge>
                                        )}
                                    </div>

                                    {recentLogs.length > 0 ? (
                                        <div className="max-h-[180px] overflow-y-auto border rounded-lg bg-white dark:bg-slate-900">
                                            {recentLogs.map((log, index) => (
                                                <div
                                                    key={index}
                                                    className={`px-4 py-2.5 text-sm border-b last:border-b-0 ${log.type === "error"
                                                        ? "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
                                                        : log.type === "warning"
                                                            ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400"
                                                            : "text-muted-foreground"
                                                        }`}
                                                >
                                                    <span className="text-xs opacity-70 font-mono">
                                                        {new Date(log.timestamp).toLocaleTimeString()}:
                                                    </span>{" "}
                                                    {log.message}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="border rounded-lg p-4 text-center text-muted-foreground bg-white dark:bg-slate-900">
                                            <p>No hay actividad reciente para mostrar</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </div>
    )
}

// Status badge component
const ConnectionStatusBadge = ({ isConnected, isConnecting }: { isConnected: boolean; isConnecting: boolean }) => {
    let variant: "default" | "success" | "warning" | "destructive" = "destructive"
    let label = "Desconectado"
    let icon = <AlertTriangle className="h-3 w-3 mr-1" />

    if (isConnected) {
        variant = "success"
        label = "Conectado"
        icon = <Check className="h-3 w-3 mr-1" />
    } else if (isConnecting) {
        variant = "warning"
        label = "Conectando"
        icon = <Loader2 className="h-3 w-3 mr-1 animate-spin" />
    }

    return (
        <Badge variant={variant} className="flex items-center text-sm py-1 px-3">
            {icon}
            {label}
        </Badge>
    )
}

export default WhatsAppQrCode
