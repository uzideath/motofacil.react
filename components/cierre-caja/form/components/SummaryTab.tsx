import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, Banknote, ArrowDownToLine, CreditCard, AlertCircle, Bike, Building, Percent } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"
import { Providers, type FormCalculations } from "../types"
import { formatProviderName } from "../utils"

interface SummaryTabProps {
    calculations: FormCalculations
    incomes: any[]
    expenses: any[]
    currentProvider?: string
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ calculations, incomes, expenses, currentProvider }) => {
    return (
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
                                <span className="text-2xl font-bold text-emerald-700">
                                    {formatCurrency(calculations.totalExpected)}
                                </span>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1 block">{incomes.length} transacciones</span>
                        </div>
                    </div>

                    <div className="rounded-lg p-4 flex flex-col items-center justify-center border relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-50 opacity-20"></div>
                        <div className="relative z-10">
                            <span className="text-red-600 font-medium text-sm">Total Egresos</span>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <span className="text-2xl font-bold text-red-700">{formatCurrency(calculations.totalExpenses)}</span>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1 block">{expenses.length} transacciones</span>
                        </div>
                    </div>

                    <div className="rounded-lg p-4 flex flex-col items-center justify-center border relative overflow-hidden">
                        <div className="absolute inset-0 bg-blue-50 opacity-20"></div>
                        <div className="relative z-10">
                            <span className="text-blue-600 font-medium text-sm">Total Registrado</span>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <span className="text-2xl font-bold text-blue-700">{formatCurrency(calculations.totalRegistered)}</span>
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
                            <span className="font-bold text-emerald-600">{formatCurrency(calculations.cashInRegister)}</span>
                        </div>

                        <div className="flex justify-between items-center p-3 border rounded-md bg-blue-50/20">
                            <div className="flex items-center gap-2">
                                <ArrowDownToLine className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">Transferencias</span>
                            </div>
                            <span className="font-bold text-blue-600">{formatCurrency(calculations.cashFromTransfers)}</span>
                        </div>

                        <div className="flex justify-between items-center p-3 border rounded-md bg-purple-50/20">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-purple-500" />
                                <span className="font-medium">Tarjetas</span>
                            </div>
                            <span className="font-bold text-purple-600">{formatCurrency(calculations.cashFromCards)}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 mt-6">
                    <h3 className="text-sm font-medium text-muted-foreground">Información del Proveedor</h3>
                    {currentProvider ? (
                        <div className="flex justify-between items-center p-3 border rounded-md bg-slate-50/20">
                            <div className="flex items-center gap-2">
                                {currentProvider === Providers.MOTOFACIL && <Bike className="h-4 w-4 text-cyan-500" />}
                                {currentProvider === Providers.OBRASOCIAL && <Building className="h-4 w-4 text-amber-500" />}
                                {currentProvider === Providers.PORCENTAJETITO && <Percent className="h-4 w-4 text-violet-500" />}
                                <span className="font-medium">Proveedor</span>
                            </div>
                            <Badge
                                className={`${currentProvider === Providers.MOTOFACIL
                                        ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300"
                                        : currentProvider === Providers.OBRASOCIAL
                                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                            : "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
                                    }`}
                                variant="outline"
                            >
                                {formatProviderName(currentProvider)}
                            </Badge>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center p-3 border rounded-md bg-amber-50/20">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                <span className="font-medium">Proveedor</span>
                            </div>
                            <span className="text-amber-600 text-sm">No seleccionado</span>
                        </div>
                    )}
                </div>

                <Separator className="my-6" />

                <div className="flex justify-between items-center">
                    <div>
                        <span className="font-medium text-lg">Diferencia</span>
                        <p className="text-xs text-muted-foreground mt-1">
                            {calculations.totalDifference === 0
                                ? "Los montos coinciden exactamente"
                                : calculations.totalDifference > 0
                                    ? "Hay un excedente en el registro"
                                    : "Hay un faltante en el registro"}
                        </p>
                    </div>
                    <span
                        className={cn(
                            "font-bold text-2xl",
                            calculations.totalDifference === 0
                                ? "text-emerald-600"
                                : calculations.totalDifference > 0
                                    ? "text-emerald-600"
                                    : "text-red-600",
                        )}
                    >
                        {formatCurrency(calculations.totalDifference)}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
