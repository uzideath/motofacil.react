"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { ArrowUpToLine, CreditCard, Banknote, Wallet, PiggyBank, ArrowDownToLine } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { HttpService } from "@/lib/http"
import { ExpenseCategoryChart } from "./ExpenseCategoryChart"
import { SummaryData } from "@/lib/types"




export function DailySummary() {
    const [data, setData] = useState<SummaryData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await HttpService.get<SummaryData>("/api/v1/closing/summary")
                console.log(res.data)
                setData(res.data)
            } catch (error) {
                console.error("Error cargando el resumen diario:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchSummary()
    }, [])

    const getPercentage = (value: number, total: number) => {
        return Math.round((value / (total || 1)) * 100)
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Resumen financiero */}
                <Card className="card-hover-effect">
                    <CardHeader>
                        <CardTitle>Resumen Financiero</CardTitle>
                        <CardDescription>Totales del día</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {loading ? (
                            <>
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </>
                        ) : (
                            data && (
                                <>
                                    {/* Ingresos */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center mr-3">
                                                    <ArrowUpToLine className="h-5 w-5 text-green-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                                                    <h3 className="text-2xl font-bold text-green-500">{formatCurrency(data.totalIncome)}</h3>
                                                </div>
                                            </div>
                                            <div className="text-sm text-green-500 font-medium">
                                                +{data.previousDayComparison}% <span className="text-muted-foreground">vs ayer</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Egresos */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center mr-3">
                                                    <ArrowDownToLine className="h-5 w-5 text-red-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Egresos Totales</p>
                                                    <h3 className="text-2xl font-bold text-red-500">{formatCurrency(data.totalExpenses)}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Balance */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-3">
                                                    <PiggyBank className="h-5 w-5 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Balance del Día</p>
                                                    <h3 className="text-2xl font-bold text-blue-500">{formatCurrency(data.balance)}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )
                        )}
                    </CardContent>
                </Card>

                {/* Métodos de pago */}
                <Card className="card-hover-effect">
                    <CardHeader>
                        <CardTitle>Métodos de Pago</CardTitle>
                        <CardDescription>Distribución por método de pago</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {loading || !data ? (
                            <>
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </>
                        ) : (
                            <div className="space-y-4">
                                {[
                                    {
                                        label: "Efectivo",
                                        value: data.paymentMethods.cash,
                                        icon: <Banknote className="h-4 w-4 text-green-500 mr-2" />,
                                    },
                                    {
                                        label: "Transferencia",
                                        value: data.paymentMethods.transfer,
                                        icon: <Wallet className="h-4 w-4 text-blue-500 mr-2" />,
                                    },
                                    {
                                        label: "Tarjeta",
                                        value: data.paymentMethods.card,
                                        icon: <CreditCard className="h-4 w-4 text-purple-500 mr-2" />,
                                    },
                                    {
                                        label: "Otros",
                                        value: data.paymentMethods.other,
                                        icon: <div className="h-4 w-4 rounded-full border border-gray-300 mr-2" />,
                                    },
                                ].map((method) => (
                                    <div key={method.label} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                {method.icon}
                                                <span className="text-sm font-medium">{method.label}</span>
                                            </div>
                                            <span className="text-sm font-medium">{formatCurrency(method.value)}</span>
                                        </div>
                                        <Progress value={getPercentage(method.value, data.totalIncome)} className="h-2" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Categorías de ingreso */}
                <Card className="card-hover-effect">
                    <CardHeader>
                        <CardTitle>Categorías de Ingresos</CardTitle>
                        <CardDescription>Distribución por tipo de ingreso</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {loading || !data ? (
                            <>
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </>
                        ) : (
                            <div className="space-y-4">
                                {[
                                    { label: "Pagos de arrendamientos", value: data.categories.loanPayments },
                                    { label: "Otros Ingresos", value: data.categories.otherIncome },
                                ].map((cat) => (
                                    <div className="space-y-2" key={cat.label}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{cat.label}</span>
                                            <span className="text-sm font-medium">{formatCurrency(cat.value)}</span>
                                        </div>
                                        <Progress value={getPercentage(cat.value, data.totalIncome)} className="h-2" />
                                        <p className="text-xs text-muted-foreground">
                                            {getPercentage(cat.value, data.totalIncome)}% del total de ingresos
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Distribución de Egresos - Now as a compact card */}
                <ExpenseCategoryChart compact={true} />
            </div>
        </div>
    )
}
