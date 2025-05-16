"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
    CheckCircle2,
    AlertCircle,
    Banknote,
    CreditCard,
    ArrowDownToLine,
    ArrowUpFromLine,
    Receipt,
    TrendingUp,
    BarChart3,
    Clock,
    Info,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { HttpService } from "@/lib/http"
import { useAuth } from "@/hooks/use-auth"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import {
    BarChart,
    Bar,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    Legend,
    XAxis,
} from "recharts"

type SelectedTransaction = {
    id: string
    amount: number
    paymentMethod: "CASH" | "TRANSACTION" | "CARD"
    type: "income" | "expense"
}

type Props = {
    token: string
    selectedTransactions: SelectedTransaction[]
}

export function CashRegisterForm({ token, selectedTransactions }: Props) {
    
    const initialFormState = {
        cashInRegister: "",
        cashFromTransfers: "",
        cashFromCards: "",
        notes: "",
        submitting: false,
        success: false,
        error: false,
        errorMessage: "",
    }

    const [formState, setFormState] = useState(initialFormState)

    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [activeTab, setActiveTab] = useState("register")
    const { user } = useAuth()

    const incomes = useMemo(() => selectedTransactions.filter((t) => t.type === "income"), [selectedTransactions])
    const expenses = useMemo(() => selectedTransactions.filter((t) => t.type === "expense"), [selectedTransactions])

    // Autocompletar campos si hay ingresos seleccionados
    useEffect(() => {
        if (incomes.length === 0) return

        const cash = incomes.filter((i) => i.paymentMethod === "CASH").reduce((acc, i) => acc + i.amount, 0)
        const transfers = incomes.filter((i) => i.paymentMethod === "TRANSACTION").reduce((acc, i) => acc + i.amount, 0)
        const cards = incomes.filter((i) => i.paymentMethod === "CARD").reduce((acc, i) => acc + i.amount, 0)

        setFormState((prev) => ({
            ...prev,
            cashInRegister: cash.toString(),
            cashFromTransfers: transfers.toString(),
            cashFromCards: cards.toString(),
            success: false,
            error: false,
        }))
    }, [incomes])

    const handleInputChange = (field: string, value: string) => {
        setFormState((prev) => ({
            ...prev,
            [field]: value,
            success: false,
            error: false,
        }))
    }

    const totalExpected = useMemo(() => incomes.reduce((acc, item) => acc + item.amount, 0), [incomes])
    const totalExpenses = useMemo(() => expenses.reduce((acc, item) => acc + item.amount, 0), [expenses])

    const cashInRegister = Number.parseFloat(formState.cashInRegister) || 0
    const cashFromTransfers = Number.parseFloat(formState.cashFromTransfers) || 0
    const cashFromCards = Number.parseFloat(formState.cashFromCards) || 0
    const totalRegistered = cashInRegister + cashFromTransfers + cashFromCards
    const totalDifference = totalRegistered - totalExpected

    const hasAnyValue = cashInRegister > 0 || cashFromTransfers > 0 || cashFromCards > 0

    const isFormValid = useMemo(() => {
        return !formState.submitting && incomes.length > 0 && hasAnyValue
    }, [formState, incomes, hasAnyValue])

    const isReadOnly = incomes.length > 0

    // Data for charts
    const paymentMethodData = [
        { name: "Efectivo", value: cashInRegister },
        { name: "Transferencias", value: cashFromTransfers },
        { name: "Tarjetas", value: cashFromCards },
    ]

    const transactionTypeData = [
        { name: "Ingresos", value: totalExpected },
        { name: "Egresos", value: totalExpenses },
    ]

    const COLORS = ["#10b981", "#3b82f6", "#8b5cf6"]
    const TYPE_COLORS = ["#10b981", "#ef4444"]

    const filteredPaymentMethodData = paymentMethodData.filter((item) => item.value > 0)
    const filteredTransactionTypeData = transactionTypeData.filter((item) => item.value > 0)




    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormState((prev) => ({ ...prev, submitting: true, success: false, error: false }))

        try {
            await HttpService.post("/api/v1/closing", {
                cashInRegister,
                cashFromTransfers,
                cashFromCards,
                notes: formState.notes,
                installmentIds: incomes.map((i) => i.id),
                expenseIds: expenses.map((e) => e.id),
                createdById: user?.id,
            })

            setFormState((prev) => ({
                ...prev,
                submitting: false,
                success: true,
            }))
            setShowSuccessDialog(true)
        } catch (err) {
            console.error("Error registrando cierre:", err)
            setFormState((prev) => ({
                ...prev,
                submitting: false,
                error: true,
                errorMessage: err instanceof Error ? err.message : "Error desconocido",
            }))
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                {formState.error && (
                    <Alert variant="destructive" className="animate-in fade-in-50 slide-in-from-top-5">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error al registrar el cierre</AlertTitle>
                        <AlertDescription>
                            {formState.errorMessage ||
                                "Hubo un problema al registrar el cierre de caja. Por favor, intente nuevamente."}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Panel izquierdo - Formulario */}
                    <Card className="border shadow-sm lg:col-span-1">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Receipt className="h-5 w-5" />
                                Registro de Valores
                            </CardTitle>
                            <CardDescription>Ingrese los montos recibidos por cada método de pago</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-3">
                                <Label htmlFor="cashInRegister" className="text-sm font-medium flex items-center gap-2">
                                    <Banknote className="h-4 w-4 text-emerald-500" />
                                    Efectivo en Caja
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                    <Input
                                        id="cashInRegister"
                                        type="number"
                                        placeholder="0.00"
                                        value={formState.cashInRegister}
                                        onChange={(e) => handleInputChange("cashInRegister", e.target.value)}
                                        readOnly={isReadOnly}
                                        className={cn(
                                            "pl-8 transition-all focus-within:border-emerald-500 focus-within:ring-emerald-500/20",
                                            isReadOnly && "bg-muted text-muted-foreground cursor-not-allowed",
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="cashFromTransfers" className="text-sm font-medium flex items-center gap-2">
                                    <ArrowDownToLine className="h-4 w-4 text-blue-500" />
                                    Transferencias
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                    <Input
                                        id="cashFromTransfers"
                                        type="number"
                                        placeholder="0.00"
                                        value={formState.cashFromTransfers}
                                        onChange={(e) => handleInputChange("cashFromTransfers", e.target.value)}
                                        readOnly={isReadOnly}
                                        className={cn(
                                            "pl-8 transition-all focus-within:border-blue-500 focus-within:ring-blue-500/20",
                                            isReadOnly && "bg-muted text-muted-foreground cursor-not-allowed",
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="cashFromCards" className="text-sm font-medium flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-purple-500" />
                                    Tarjetas
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                    <Input
                                        id="cashFromCards"
                                        type="number"
                                        placeholder="0.00"
                                        value={formState.cashFromCards}
                                        onChange={(e) => handleInputChange("cashFromCards", e.target.value)}
                                        readOnly={isReadOnly}
                                        className={cn(
                                            "pl-8 transition-all focus-within:border-purple-500 focus-within:ring-purple-500/20",
                                            isReadOnly && "bg-muted text-muted-foreground cursor-not-allowed",
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
                                    <Info className="h-4 w-4 text-gray-500" />
                                    Notas y Observaciones
                                </Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Ingrese cualquier observación relevante para el cierre de caja..."
                                    value={formState.notes}
                                    onChange={(e) => handleInputChange("notes", e.target.value)}
                                    rows={4}
                                    className="resize-none transition-all focus-within:border-gray-500 focus-within:ring-gray-500/20"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2 pb-6 flex flex-col">
                            <Button type="submit" disabled={!isFormValid} className="w-full shadow-sm transition-all">
                                {formState.submitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Procesando...</span>
                                    </div>
                                ) : (
                                    <span>Registrar Cierre de Caja</span>
                                )}
                            </Button>

                            {!isFormValid && incomes.length === 0 && (
                                <p className="text-xs text-amber-600 mt-2 text-center">
                                    Seleccione al menos una transacción para continuar
                                </p>
                            )}
                        </CardFooter>
                    </Card>

                    {/* Panel derecho - Resumen y Visualización */}
                    <div className="lg:col-span-2 space-y-6">
                        <Tabs defaultValue="summary" className="w-full" onValueChange={setActiveTab}>
                            <div className="flex justify-between items-center mb-4">
                                <TabsList>
                                    <TabsTrigger value="summary" className="flex items-center gap-1">
                                        <Receipt className="h-4 w-4" />
                                        <span>Resumen</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="charts" className="flex items-center gap-1">
                                        <BarChart3 className="h-4 w-4" />
                                        <span>Gráficos</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="transactions" className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>Transacciones</span>
                                    </TabsTrigger>
                                </TabsList>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={totalDifference >= 0 ? "outline" : "destructive"} className="h-7">
                                                    <span className="font-medium mr-1">Diferencia:</span>
                                                    <span
                                                        className={cn(
                                                            "font-bold",
                                                            totalDifference === 0
                                                                ? "text-emerald-600"
                                                                : totalDifference > 0
                                                                    ? "text-emerald-600"
                                                                    : "text-destructive",
                                                        )}
                                                    >
                                                        {formatCurrency(totalDifference)}
                                                    </span>
                                                </Badge>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Diferencia entre el total registrado y el esperado</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            <TabsContent value="summary" className="mt-0">
                                <Card className="border shadow-sm">
                                    <CardHeader className="pb-3 border-b">
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            Resumen del Cierre
                                        </CardTitle>
                                        <CardDescription>Información detallada sobre las transacciones seleccionadas</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                            <div className="rounded-lg p-4 flex flex-col items-center justify-center border relative overflow-hidden">
                                                <div className="absolute inset-0 bg-emerald-50 opacity-20"></div>
                                                <div className="relative z-10">
                                                    <span className="text-emerald-600 font-medium text-sm">Total Ingresos</span>
                                                    <div className="flex items-center justify-center gap-2 mt-1">
                                                        <span className="text-2xl font-bold text-emerald-700">{formatCurrency(totalExpected)}</span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground mt-1 block">
                                                        {incomes.length} transacciones
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="rounded-lg p-4 flex flex-col items-center justify-center border relative overflow-hidden">
                                                <div className="absolute inset-0 bg-red-50 opacity-20"></div>
                                                <div className="relative z-10">
                                                    <span className="text-red-600 font-medium text-sm">Total Egresos</span>
                                                    <div className="flex items-center justify-center gap-2 mt-1">
                                                        <span className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground mt-1 block">
                                                        {expenses.length} transacciones
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="rounded-lg p-4 flex flex-col items-center justify-center border relative overflow-hidden">
                                                <div className="absolute inset-0 bg-blue-50 opacity-20"></div>
                                                <div className="relative z-10">
                                                    <span className="text-blue-600 font-medium text-sm">Total Registrado</span>
                                                    <div className="flex items-center justify-center gap-2 mt-1">
                                                        <span className="text-2xl font-bold text-blue-700">{formatCurrency(totalRegistered)}</span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground mt-1 block">Todos los métodos</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium text-muted-foreground">Desglose por Método de Pago</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center p-3 border rounded-md bg-emerald-50/20">
                                                    <div className="flex items-center gap-2">
                                                        <Banknote className="h-4 w-4 text-emerald-500" />
                                                        <span className="font-medium">Efectivo</span>
                                                    </div>
                                                    <span className="font-bold text-emerald-600">{formatCurrency(cashInRegister)}</span>
                                                </div>

                                                <div className="flex justify-between items-center p-3 border rounded-md bg-blue-50/20">
                                                    <div className="flex items-center gap-2">
                                                        <ArrowDownToLine className="h-4 w-4 text-blue-500" />
                                                        <span className="font-medium">Transferencias</span>
                                                    </div>
                                                    <span className="font-bold text-blue-600">{formatCurrency(cashFromTransfers)}</span>
                                                </div>

                                                <div className="flex justify-between items-center p-3 border rounded-md bg-purple-50/20">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="h-4 w-4 text-purple-500" />
                                                        <span className="font-medium">Tarjetas</span>
                                                    </div>
                                                    <span className="font-bold text-purple-600">{formatCurrency(cashFromCards)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator className="my-6" />

                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="font-medium text-lg">Diferencia</span>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {totalDifference === 0
                                                        ? "Los montos coinciden exactamente"
                                                        : totalDifference > 0
                                                            ? "Hay un excedente en el registro"
                                                            : "Hay un faltante en el registro"}
                                                </p>
                                            </div>
                                            <span
                                                className={cn(
                                                    "font-bold text-2xl",
                                                    totalDifference === 0
                                                        ? "text-emerald-600"
                                                        : totalDifference > 0
                                                            ? "text-emerald-600"
                                                            : "text-red-600",
                                                )}
                                            >
                                                {formatCurrency(totalDifference)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="charts" className="mt-0">
                                <Card className="border shadow-sm">
                                    <CardHeader className="pb-3 border-b">
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5" />
                                            Visualización de Datos
                                        </CardTitle>
                                        <CardDescription>Gráficos para analizar la distribución de ingresos y egresos</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-medium text-center">Distribución por Método de Pago</h3>
                                                <div className="h-[300px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RechartsPieChart>
                                                            <Pie
                                                                data={filteredPaymentMethodData}
                                                                cx="50%"
                                                                cy="50%"
                                                                labelLine={false}
                                                                outerRadius={80}
                                                                fill="#8884d8"
                                                                dataKey="value"
                                                                nameKey="name"
                                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                            >
                                                                {filteredPaymentMethodData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>

                                                            <Legend />
                                                            <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                                                        </RechartsPieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h3 className="text-sm font-medium text-center">Ingresos vs Egresos</h3>
                                                <div className="h-[300px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={filteredTransactionTypeData}>
                                                            <XAxis dataKey="name" />
                                                            <Bar dataKey="value">
                                                                {filteredTransactionTypeData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                                                                ))}
                                                            </Bar>
                                                            <RechartsTooltip
                                                                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                                                            />
                                                        </BarChart>

                                                    </ResponsiveContainer>

                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="transactions" className="mt-0">
                                <Card className="border shadow-sm">
                                    <CardHeader className="pb-3 border-b">
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <Clock className="h-5 w-5" />
                                            Transacciones Seleccionadas
                                        </CardTitle>
                                        <CardDescription>Detalle de las transacciones incluidas en este cierre</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {incomes.length === 0 && expenses.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                                <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
                                                <h3 className="text-lg font-medium text-amber-800">No hay transacciones seleccionadas</h3>
                                                <p className="text-sm text-amber-700 max-w-md mt-1">
                                                    Seleccione al menos una transacción para poder registrar el cierre de caja y ver los detalles
                                                    aquí.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {incomes.length > 0 && (
                                                    <div className="space-y-3">
                                                        <h3 className="text-sm font-medium flex items-center gap-2">
                                                            <ArrowDownToLine className="h-4 w-4 text-emerald-500" />
                                                            Ingresos ({incomes.length})
                                                        </h3>
                                                        <div className="border rounded-md overflow-hidden">
                                                            <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 text-xs font-medium text-muted-foreground">
                                                                <div>ID</div>
                                                                <div>Método de Pago</div>
                                                                <div className="text-right">Monto</div>
                                                            </div>
                                                            <div className="divide-y">
                                                                {incomes.map((income) => (
                                                                    <div
                                                                        key={income.id}
                                                                        className="grid grid-cols-3 gap-4 p-3 text-sm hover:bg-muted/20 transition-colors"
                                                                    >
                                                                        <div className="truncate">{income.id}</div>
                                                                        <div>
                                                                            {income.paymentMethod === "CASH" && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <Banknote className="h-3 w-3 text-emerald-500" />
                                                                                    Efectivo
                                                                                </span>
                                                                            )}
                                                                            {income.paymentMethod === "TRANSACTION" && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <ArrowDownToLine className="h-3 w-3 text-blue-500" />
                                                                                    Transferencia
                                                                                </span>
                                                                            )}
                                                                            {income.paymentMethod === "CARD" && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <CreditCard className="h-3 w-3 text-purple-500" />
                                                                                    Tarjeta
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-right font-medium text-emerald-600">
                                                                            {formatCurrency(income.amount)}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {expenses.length > 0 && (
                                                    <div className="space-y-3">
                                                        <h3 className="text-sm font-medium flex items-center gap-2">
                                                            <ArrowUpFromLine className="h-4 w-4 text-red-500" />
                                                            Egresos ({expenses.length})
                                                        </h3>
                                                        <div className="border rounded-md overflow-hidden">
                                                            <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 text-xs font-medium text-muted-foreground">
                                                                <div>ID</div>
                                                                <div>Método de Pago</div>
                                                                <div className="text-right">Monto</div>
                                                            </div>
                                                            <div className="divide-y">
                                                                {expenses.map((expense) => (
                                                                    <div
                                                                        key={expense.id}
                                                                        className="grid grid-cols-3 gap-4 p-3 text-sm hover:bg-muted/20 transition-colors"
                                                                    >
                                                                        <div className="truncate">{expense.id}</div>
                                                                        <div>
                                                                            {expense.paymentMethod === "CASH" && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <Banknote className="h-3 w-3 text-emerald-500" />
                                                                                    Efectivo
                                                                                </span>
                                                                            )}
                                                                            {expense.paymentMethod === "TRANSACTION" && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <ArrowDownToLine className="h-3 w-3 text-blue-500" />
                                                                                    Transferencia
                                                                                </span>
                                                                            )}
                                                                            {expense.paymentMethod === "CARD" && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <CreditCard className="h-3 w-3 text-purple-500" />
                                                                                    Tarjeta
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-right font-medium text-red-600">
                                                                            {formatCurrency(expense.amount)}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </form>

            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-700">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            Cierre registrado con éxito
                        </DialogTitle>
                        <DialogDescription className="text-emerald-600">
                            El cierre de caja ha sido registrado correctamente en el sistema.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-4 rounded-lg border my-2">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Total ingresos:</span>
                                <span className="font-medium text-emerald-600">{formatCurrency(totalExpected)}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm">Total registrado:</span>
                                <span className="font-medium text-blue-600">{formatCurrency(totalRegistered)}</span>
                            </div>

                            <Separator className="my-1" />

                            <div className="flex justify-between items-center">
                                <span className="font-medium">Diferencia:</span>
                                <span
                                    className={cn(
                                        "font-bold text-lg",
                                        totalDifference === 0
                                            ? "text-emerald-600"
                                            : totalDifference > 0
                                                ? "text-emerald-600"
                                                : "text-red-600",
                                    )}
                                >
                                    {formatCurrency(totalDifference)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-center">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowSuccessDialog(false)}
                            className="w-full sm:w-auto"
                        >
                            Cerrar
                        </Button>
                        <Button
                            type="button"
                            className="w-full sm:w-auto"
                            onClick={() => {
                                setShowSuccessDialog(false)
                                setFormState(initialFormState)
                            }}
                        >
                            Nuevo Cierre
                        </Button>

                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
