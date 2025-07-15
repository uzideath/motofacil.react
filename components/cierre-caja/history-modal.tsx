"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { formatCurrency, formatProviderName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import es from "date-fns/locale/es"
import {
    Wallet,
    ArrowUpToLine,
    ArrowDownToLine,
    CreditCard,
    Receipt,
    Banknote,
    Calendar,
    User,
    FileText,
    Bike,
    Building,
    Percent,
    AlertCircle,
    Info,
    DollarSign,
    CreditCardIcon,
    BanknoteIcon,
    Eye,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Providers, PaymentMethods, Closing } from "@/lib/types"

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
        label: "Tito",
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
}



type Props = {
    open: boolean
    onClose: () => void
    cashRegister: Closing
}

export function CashRegisterDetailModal({ open, onClose, cashRegister }: Props) {
    const formatMethod = (method: string) => {
        switch (method) {
            case PaymentMethods.CASH:
                return "Efectivo"
            case PaymentMethods.TRANSACTION:
                return "Transferencia"
            case PaymentMethods.CARD:
                return "Tarjeta"
            default:
                return method
        }
    }

    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case PaymentMethods.CASH:
                return <Banknote className="h-4 w-4 text-emerald-500" />
            case PaymentMethods.TRANSACTION:
                return <Receipt className="h-4 w-4 text-blue-500" />
            case PaymentMethods.CARD:
                return <CreditCard className="h-4 w-4 text-purple-500" />
            default:
                return <Wallet className="h-4 w-4 text-gray-500" />
        }
    }

    const totalIncome = cashRegister.payments.reduce((acc, p) => acc + p.amount + p.gps, 0)
    const totalExpense = cashRegister.expense.reduce((acc, e) => acc + e.amount, 0)
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

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        Detalle del Cierre de Caja
                    </DialogTitle>
                    <DialogDescription>Información detallada sobre las transacciones incluidas en este cierre</DialogDescription>
                </DialogHeader>

                {/* Cash Register Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <Card className="lg:col-span-2 shadow-sm">
                        <CardHeader className="pb-2 bg-slate-50 dark:bg-slate-900/50 rounded-t-lg">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Info className="h-4 w-4 text-primary" />
                                Información General
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs">ID:</span>
                                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs mt-1 w-fit">
                                        {cashRegister.id}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs">Fecha:</span>
                                    <span className="font-medium">
                                        {format(new Date(cashRegister.date), "dd/MM/yyyy", { locale: es })}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs">Hora:</span>
                                    <span className="font-medium">{format(new Date(cashRegister.date), "HH:mm", { locale: es })}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs">Usuario:</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-xs bg-primary/20 text-primary">
                                                {getInitials(cashRegister.createdBy?.username || "UN")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>{cashRegister.createdBy?.username}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs">Proveedor:</span>
                                    <div className="mt-1">{renderProvider(cashRegister.provider.name)}</div>
                                </div>

                                {cashRegister.notes && (
                                    <div className="flex-1">
                                        <span className="text-muted-foreground text-xs">Notas:</span>
                                        <p className="text-sm mt-1 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-md border border-slate-200 dark:border-slate-800">
                                            {cashRegister.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="pb-2 bg-slate-50 dark:bg-slate-900/50 rounded-t-lg">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Wallet className="h-4 w-4 text-primary" />
                                Resumen Financiero
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full">
                                        <BanknoteIcon className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Efectivo en Caja</p>
                                        <p className="font-medium">{formatCurrency(cashRegister.cashInRegister)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full">
                                        <Receipt className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Transferencias</p>
                                        <p className="font-medium">{formatCurrency(cashRegister.cashFromTransfers)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-full">
                                        <CreditCardIcon className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Tarjetas</p>
                                        <p className="font-medium">{formatCurrency(cashRegister.cashFromCards)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-full">
                                        <DollarSign className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Registrado</p>
                                        <p className="font-medium">
                                            {formatCurrency(
                                                cashRegister.cashInRegister + cashRegister.cashFromTransfers + cashRegister.cashFromCards,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Ingresos</p>
                                    <p className="font-medium text-green-600">{formatCurrency(totalIncome)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Egresos</p>
                                    <p className="font-medium text-red-600">{formatCurrency(totalExpense)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Balance</p>
                                    <p className={`font-medium ${balance >= 0 ? "text-blue-600" : "text-amber-600"}`}>
                                        {formatCurrency(balance)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="payments" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                        <TabsTrigger value="payments" className="flex items-center gap-2 text-base">
                            <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full">
                                <ArrowUpToLine className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <span>Pagos Registrados ({cashRegister.payments.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="expenses" className="flex items-center gap-2 text-base">
                            <div className="bg-red-100 dark:bg-red-900/30 p-1.5 rounded-full">
                                <ArrowDownToLine className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                            <span>Egresos Asociados ({cashRegister.expense.length})</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="payments" className="space-y-4">
                        {cashRegister.payments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-full mb-4 shadow-sm">
                                    <Info className="h-12 w-12 text-muted-foreground opacity-50" />
                                </div>
                                <h3 className="text-lg font-medium">No hay pagos registrados</h3>
                                <p className="text-sm text-muted-foreground max-w-md mt-2">
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
                                                        <User className="h-4 w-4 mr-2" />
                                                        Cliente
                                                    </div>
                                                </TableHead>
                                                <TableHead>
                                                    <div className="flex items-center">
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        Contrato
                                                    </div>
                                                </TableHead>
                                                <TableHead>
                                                    <div className="flex items-center">
                                                        <Bike className="h-4 w-4 mr-2" />
                                                        Placa
                                                    </div>
                                                </TableHead>
                                                <TableHead>
                                                    <div className="flex items-center">
                                                        <Wallet className="h-4 w-4 mr-2" />
                                                        Método
                                                    </div>
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    <div className="flex items-center justify-end">
                                                        <ArrowUpToLine className="h-4 w-4 mr-2 text-green-500" />
                                                        Monto
                                                    </div>
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    <div className="flex items-center justify-end">
                                                        <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
                                                        GPS
                                                    </div>
                                                </TableHead>
                                                <TableHead>Estado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {cashRegister.payments.map((p) => {
                                                const paymentDate = new Date(p.paymentDate)
                                                return (
                                                    <TableRow key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                                        <TableCell className="font-medium font-mono text-xs">
                                                            <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit">
                                                                {p.id.substring(0, 8)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span>{format(paymentDate, "dd/MM/yyyy", { locale: es })}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {format(paymentDate, "HH:mm", { locale: es })}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {p.loan?.user?.name ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarFallback className="text-xs">{getInitials(p.loan.user.name)}</AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-sm font-medium">{p.loan.user.name}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono">
                                                                {p.loan?.contractNumber || "—"}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {p.loan?.motorcycle?.plate ? (
                                                                <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 font-mono text-xs">
                                                                    {p.loan.motorcycle.plate}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {getPaymentMethodIcon(p.paymentMethod)}
                                                                <span>{formatMethod(p.paymentMethod)}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                                                            {formatCurrency(p.amount)}
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">
                                                            {formatCurrency(p.gps)}
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
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>Al día
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
                        {cashRegister.expense.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-full mb-4 shadow-sm">
                                    <Info className="h-12 w-12 text-muted-foreground opacity-50" />
                                </div>
                                <h3 className="text-lg font-medium">No hay egresos registrados</h3>
                                <p className="text-sm text-muted-foreground max-w-md mt-2">
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
                                                        <Wallet className="h-4 w-4 mr-2" />
                                                        Método
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
                                                <TableHead>Referencia</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {cashRegister.expense.map((e) => {
                                                const expenseDate = new Date(e.date)
                                                return (
                                                    <TableRow key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                                        <TableCell className="font-medium font-mono text-xs">
                                                            <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit">
                                                                {e.id.substring(0, 8)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span>{format(expenseDate, "dd/MM/yyyy", { locale: es })}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {format(expenseDate, "HH:mm", { locale: es })}
                                                                </span>
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
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {getPaymentMethodIcon(e.paymentMethod)}
                                                                <span>{formatMethod(e.paymentMethod)}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{renderProvider(e.provider?.name)}</TableCell>
                                                        <TableCell className="text-right font-medium text-red-600 dark:text-red-400">
                                                            {formatCurrency(e.amount)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {e.reference ? (
                                                                <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono">
                                                                    {e.reference.substring(0, 12)}...
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
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

                        {cashRegister.expense.length > 0 && (
                            <div className="mt-6 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="bg-white dark:bg-slate-800 p-1.5 rounded-full">
                                        <Info className="h-4 w-4 text-primary" />
                                    </div>
                                    <h3 className="text-base font-medium">Detalles adicionales de gastos</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {cashRegister.expense.map((e) => (
                                        <div key={`desc-${e.id}`} className="p-4 bg-white dark:bg-slate-950 rounded-md border shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono text-xs">
                                                        {e.id.substring(0, 8)}
                                                    </div>
                                                    {renderCategory(e.category)}
                                                </div>
                                                <span className="font-medium text-red-600 dark:text-red-400">{formatCurrency(e.amount)}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900/50 p-2 rounded-md border border-slate-200 dark:border-slate-800">
                                                {e.description}
                                            </p>
                                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                                {e.reference && (
                                                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                        <span className="text-xs text-muted-foreground">Ref:</span>
                                                        <span className="text-xs font-mono">{e.reference.substring(0, 12)}...</span>
                                                    </div>
                                                )}
                                                {e.attachmentUrl && (
                                                    <a
                                                        href={e.attachmentUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md"
                                                    >
                                                        <FileText className="h-3 w-3" />
                                                        Ver comprobante
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <Separator className="my-4" />

                <div className="flex justify-end mt-6">
                    <Button variant="default" onClick={onClose} className="gap-2">
                        <Eye className="h-4 w-4" />
                        Cerrar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
