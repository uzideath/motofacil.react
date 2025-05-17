"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { formatCurrency, cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { es } from "date-fns/locale/es"
import { Wallet, ArrowUpToLine, ArrowDownToLine, CreditCard, Receipt, Banknote, Calendar, Clock, User, FileText, Bike, Building, Percent, AlertCircle, Info } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

enum Providers {
    MOTOFACIL = "MOTOFACIL",
    OBRASOCIAL = "OBRASOCIAL",
    PORCENTAJETITO = "PORCENTAJETITO",
}

const formatProviderName = (provider: string | undefined): string => {
    if (!provider) return "Desconocido"

    switch (provider) {
        case Providers.MOTOFACIL:
            return "Moto Facil"
        case Providers.OBRASOCIAL:
            return "Obra Social"
        case Providers.PORCENTAJETITO:
            return "Porcentaje Tito"
        default:
            return provider
    }
}

const providerMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    [Providers.MOTOFACIL]: {
        label: "Moto Facil",
        color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/30",
        icon: <Bike className="h-4 w-4" />,
    },
    [Providers.OBRASOCIAL]: {
        label: "Obra Social",
        color:
            "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30",
        icon: <Building className="h-4 w-4" />,
    },
    [Providers.PORCENTAJETITO]: {
        label: "Porcentaje Tito",
        color:
            "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800/30",
        icon: <Percent className="h-4 w-4" />,
    },
}

const categoryMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    RENT: {
        label: "Alquiler",
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800/30",
        icon: <FileText className="h-3 w-3" />,
    },
    SERVICES: {
        label: "Servicios",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/30",
        icon: <FileText className="h-3 w-3" />,
    },
    SALARIES: {
        label: "Salarios",
        color:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/30",
        icon: <User className="h-3 w-3" />,
    },
    TAXES: {
        label: "Impuestos",
        color:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/30",
        icon: <Receipt className="h-3 w-3" />,
    },
    MAINTENANCE: {
        label: "Mantenimiento",
        color:
            "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800/30",
        icon: <FileText className="h-3 w-3" />,
    },
    PURCHASES: {
        label: "Compras",
        color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800/30",
        icon: <Wallet className="h-3 w-3" />,
    },
    MARKETING: {
        label: "Marketing",
        color:
            "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/30",
        icon: <FileText className="h-3 w-3" />,
    },
    TRANSPORT: {
        label: "Transporte",
        color:
            "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800/30",
        icon: <FileText className="h-3 w-3" />,
    },
    OTHER: {
        label: "Otros",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800/30",
        icon: <FileText className="h-3 w-3" />,
    },
    "Cuota de préstamo": {
        label: "Cuota de préstamo",
        color:
            "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/30",
        icon: <CreditCard className="h-3 w-3" />,
    },
}

type Payment = {
    id: string
    paymentMethod: "CASH" | "TRANSACTION" | "CARD"
    amount: number
    paymentDate: string
    isLate: boolean
    loan?: {
        user?: {
            name: string
        }
        motorcycle?: {
            plate: string
            provider?: string
        }
    }
}

type Expense = {
    id: string
    amount: number
    date: string
    category: string
    paymentMethod: "CASH" | "TRANSACTION" | "CARD"
    beneficiary: string
    reference?: string
    description: string
    provider?: string
}

type Props = {
    open: boolean
    onClose: () => void
    payments: Payment[]
    expenses: Expense[]
    provider?: string
}

export function CashRegisterDetailModal({ open, onClose, payments, expenses, provider }: Props) {
    const formatMethod = (method: string) => {
        switch (method) {
            case "CASH":
                return "Efectivo"
            case "TRANSACTION":
                return "Transferencia"
            case "CARD":
                return "Tarjeta"
            default:
                return method
        }
    }

    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case "CASH":
                return <Banknote className="h-4 w-4 text-emerald-500" />
            case "TRANSACTION":
                return <Receipt className="h-4 w-4 text-blue-500" />
            case "CARD":
                return <CreditCard className="h-4 w-4 text-purple-500" />
            default:
                return <Wallet className="h-4 w-4 text-gray-500" />
        }
    }

    const totalIncome = payments.reduce((acc, p) => acc + p.amount, 0)
    const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0)
    const balance = totalIncome - totalExpense

    const renderProvider = (providerValue?: string) => {
        if (!providerValue) return <span className="text-muted-foreground text-sm">—</span>

        return (
            <Badge
                className={`flex items-center justify-center gap-1.5 text-sm px-3 py-1 rounded-full ${providerMap[providerValue]?.color || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                    }`}
                variant="outline"
            >
                {providerMap[providerValue]?.icon || <FileText className="h-3 w-3" />}
                <span>{formatProviderName(providerValue)}</span>
            </Badge>
        )
    }

    const renderCategory = (category: string) => {
        return (
            <Badge
                className={`flex items-center justify-center gap-1.5 text-sm px-3 py-1 rounded-full ${categoryMap[category]?.color || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                    }`}
                variant="outline"
            >
                {categoryMap[category]?.icon || <FileText className="h-3 w-3" />}
                <span>{categoryMap[category]?.label || category}</span>
            </Badge>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        Detalle del Cierre de Caja
                    </DialogTitle>
                    <DialogDescription>
                        Información detallada sobre las transacciones incluidas en este cierre
                    </DialogDescription>
                </DialogHeader>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Ingresos</p>
                                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCurrency(totalIncome)}</p>
                                </div>
                                <div className="bg-green-100 dark:bg-green-800/30 p-3 rounded-full">
                                    <ArrowUpToLine className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                            <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-2">
                                {payments.length} transacciones registradas
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Egresos</p>
                                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">{formatCurrency(totalExpense)}</p>
                                </div>
                                <div className="bg-red-100 dark:bg-red-800/30 p-3 rounded-full">
                                    <ArrowDownToLine className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                            <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-2">
                                {expenses.length} transacciones registradas
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className={`${balance >= 0
                                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30"
                                : "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30"
                            }`}
                    >
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p
                                        className={`text-sm font-medium ${balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"
                                            }`}
                                    >
                                        Balance Neto
                                    </p>
                                    <p
                                        className={`text-2xl font-bold ${balance >= 0 ? "text-blue-700 dark:text-blue-300" : "text-amber-700 dark:text-amber-300"
                                            }`}
                                    >
                                        {formatCurrency(balance)}
                                    </p>
                                </div>
                                <div
                                    className={`p-3 rounded-full ${balance >= 0 ? "bg-blue-100 dark:bg-blue-800/30" : "bg-amber-100 dark:bg-amber-800/30"
                                        }`}
                                >
                                    <Wallet
                                        className={`h-6 w-6 ${balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"
                                            }`}
                                    />
                                </div>
                            </div>
                            <p
                                className={`text-xs ${balance >= 0
                                        ? "text-blue-600/70 dark:text-blue-400/70"
                                        : "text-amber-600/70 dark:text-amber-400/70"
                                    } mt-2`}
                            >
                                {balance >= 0 ? "Cierre con ganancia" : "Cierre con pérdida"}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Provider Information */}
                {provider && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`p-2.5 rounded-full ${provider === Providers.MOTOFACIL
                                            ? "bg-cyan-100 dark:bg-cyan-900/30"
                                            : provider === Providers.OBRASOCIAL
                                                ? "bg-amber-100 dark:bg-amber-900/30"
                                                : "bg-violet-100 dark:bg-violet-900/30"
                                        }`}
                                >
                                    {provider === Providers.MOTOFACIL && <Bike className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />}
                                    {provider === Providers.OBRASOCIAL && (
                                        <Building className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                                    )}
                                    {provider === Providers.PORCENTAJETITO && (
                                        <Percent className="h-5 w-5 text-violet-700 dark:text-violet-300" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Proveedor</h3>
                                    <p className="text-lg font-semibold">{formatProviderName(provider)}</p>
                                </div>
                            </div>
                            {renderProvider(provider)}
                        </div>
                    </div>
                )}

                <Tabs defaultValue="payments" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="payments" className="flex items-center gap-1.5">
                            <ArrowUpToLine className="h-4 w-4 text-green-500" />
                            <span>Pagos Registrados</span>
                        </TabsTrigger>
                        <TabsTrigger value="expenses" className="flex items-center gap-1.5">
                            <ArrowDownToLine className="h-4 w-4 text-red-500" />
                            <span>Egresos Asociados</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="payments" className="space-y-4">
                        {payments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Info className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                                <h3 className="text-lg font-medium">No hay pagos registrados</h3>
                                <p className="text-sm text-muted-foreground max-w-md mt-1">
                                    Este cierre de caja no tiene pagos (ingresos) asociados.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        Fecha
                                                    </div>
                                                </TableHead>
                                                <TableHead>
                                                    <div className="flex items-center">
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        Hora
                                                    </div>
                                                </TableHead>
                                                <TableHead>
                                                    <div className="flex items-center">
                                                        <Wallet className="h-4 w-4 mr-2" />
                                                        Método
                                                    </div>
                                                </TableHead>
                                                <TableHead>
                                                    <div className="flex items-center">
                                                        <User className="h-4 w-4 mr-2" />
                                                        Cliente
                                                    </div>
                                                </TableHead>
                                                <TableHead>
                                                    <div className="flex items-center">
                                                        <Bike className="h-4 w-4 mr-2" />
                                                        Proveedor
                                                    </div>
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    <div className="flex items-center justify-end">
                                                        <ArrowUpToLine className="h-4 w-4 mr-2 text-green-500" />
                                                        Monto
                                                    </div>
                                                </TableHead>
                                                <TableHead>Estado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payments.map((p) => {
                                                const paymentDate = new Date(p.paymentDate)
                                                return (
                                                    <TableRow key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                                        <TableCell className="font-medium font-mono text-xs">
                                                            <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit">
                                                                {p.id.substring(0, 8)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{format(paymentDate, "dd/MM/yyyy", { locale: es })}</TableCell>
                                                        <TableCell>{format(paymentDate, "HH:mm", { locale: es })}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {getPaymentMethodIcon(p.paymentMethod)}
                                                                <span>{formatMethod(p.paymentMethod)}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {p.loan?.user?.name ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
                                                                        <User className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                                                                    </div>
                                                                    <span>{p.loan.user.name}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {renderProvider(p.loan?.motorcycle?.provider)}
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                                                            {formatCurrency(p.amount)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {p.isLate ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800/30 flex items-center gap-1.5"
                                                                >
                                                                    <AlertCircle className="h-3 w-3" />
                                                                    Tardío
                                                                </Badge>
                                                            ) : (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/30 flex items-center gap-1.5"
                                                                >
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                                                    A tiempo
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="expenses" className="space-y-4">
                        {expenses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Info className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                                <h3 className="text-lg font-medium">No hay egresos registrados</h3>
                                <p className="text-sm text-muted-foreground max-w-md mt-1">
                                    Este cierre de caja no tiene egresos asociados.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        Fecha
                                                    </div>
                                                </TableHead>
                                                <TableHead>
                                                    <div className="flex items-center">
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        Hora
                                                    </div>
                                                </TableHead>
                                                <TableHead>
                                                    <div className="flex items-center">
                                                        <Wallet className="h-4 w-4 mr-2" />
                                                        Método
                                                    </div>
                                                </TableHead>
                                                <TableHead>
                                                    <div className="flex items-center">
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        Categoría
                                                    </div>
                                                </TableHead>
                                                <TableHead>
                                                    <div className="flex items-center">
                                                        <User className="h-4 w-4 mr-2" />
                                                        Beneficiario
                                                    </div>
                                                </TableHead>
                                                <TableHead>
                                                    <div className="flex items-center">
                                                        <Bike className="h-4 w-4 mr-2" />
                                                        Proveedor
                                                    </div>
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    <div className="flex items-center justify-end">
                                                        <ArrowDownToLine className="h-4 w-4 mr-2 text-red-500" />
                                                        Monto
                                                    </div>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {expenses.map((e) => {
                                                const expenseDate = new Date(e.date)
                                                return (
                                                    <TableRow key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                                        <TableCell className="font-medium font-mono text-xs">
                                                            <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit">
                                                                {e.id.substring(0, 8)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{format(expenseDate, "dd/MM/yyyy", { locale: es })}</TableCell>
                                                        <TableCell>{format(expenseDate, "HH:mm", { locale: es })}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {getPaymentMethodIcon(e.paymentMethod)}
                                                                <span>{formatMethod(e.paymentMethod)}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{renderCategory(e.category)}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
                                                                    <User className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                                                                </div>
                                                                <span>{e.beneficiary}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{renderProvider(e.provider)}</TableCell>
                                                        <TableCell className="text-right font-medium text-red-600 dark:text-red-400">
                                                            {formatCurrency(e.amount)}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        {expenses.length > 0 && (
                            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                    <h3 className="text-sm font-medium">Detalles adicionales</h3>
                                </div>
                                <div className="space-y-3 mt-3">
                                    {expenses.map((e) => (
                                        <div key={`desc-${e.id}`} className="p-3 bg-white dark:bg-slate-950 rounded-md border">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono text-xs">
                                                        {e.id.substring(0, 8)}
                                                    </div>
                                                    {renderCategory(e.category)}
                                                </div>
                                                <span className="font-medium text-red-600 dark:text-red-400">{formatCurrency(e.amount)}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{e.description}</p>
                                            {e.reference && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">Referencia:</span>
                                                    <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                        {e.reference}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <Separator className="my-4" />

                <div className="flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
