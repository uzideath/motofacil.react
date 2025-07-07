import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertCircle, ArrowDownToLine, ArrowUpFromLine, Banknote, CreditCard } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Providers, type SelectedTransaction } from "../types"
import { formatProviderName } from "../utils"

interface TransactionsTabProps {
    incomes: SelectedTransaction[]
    expenses: SelectedTransaction[]
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({ incomes, expenses }) => {
    if (incomes.length === 0 && expenses.length === 0) {
        return (
            <Card className="border shadow-sm">
                <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Transacciones Seleccionadas
                    </CardTitle>
                    <CardDescription>Detalle de las transacciones incluidas en este cierre</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
                        <h3 className="text-lg font-medium text-amber-800">No hay transacciones seleccionadas</h3>
                        <p className="text-sm text-amber-700 max-w-md mt-1">
                            Seleccione al menos una transacción para poder registrar el cierre de caja y ver los detalles aquí.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Transacciones Seleccionadas
                </CardTitle>
                <CardDescription>Detalle de las transacciones incluidas en este cierre</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-6">
                    {incomes.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium flex items-center gap-2">
                                <ArrowDownToLine className="h-4 w-4 text-emerald-500" />
                                Ingresos ({incomes.length})
                            </h3>
                            <div className="border rounded-md overflow-hidden">
                                <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 text-xs font-medium text-muted-foreground">
                                    <div>ID</div>
                                    <div>Método de Pago</div>
                                    <div>Proveedor</div>
                                    <div className="text-right">Monto</div>
                                </div>
                                <div className="divide-y">
                                    {incomes.map((income) => (
                                        <div
                                            key={income.id}
                                            className="grid grid-cols-4 gap-4 p-3 text-sm hover:bg-muted/20 transition-colors"
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
                                            <div>
                                                {income.provider ? (
                                                    <Badge
                                                        className={`${income.provider === Providers.MOTOFACIL
                                                                ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300"
                                                                : income.provider === Providers.OBRASOCIAL
                                                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                                                    : "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
                                                            }`}
                                                        variant="outline"
                                                    >
                                                        {formatProviderName(income.provider)}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">—</span>
                                                )}
                                            </div>
                                            <div className="text-right font-medium text-emerald-600">{formatCurrency(income.amount)}</div>
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
                                <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 text-xs font-medium text-muted-foreground">
                                    <div>ID</div>
                                    <div>Método de Pago</div>
                                    <div>Proveedor</div>
                                    <div className="text-right">Monto</div>
                                </div>
                                <div className="divide-y">
                                    {expenses.map((expense) => (
                                        <div
                                            key={expense.id}
                                            className="grid grid-cols-4 gap-4 p-3 text-sm hover:bg-muted/20 transition-colors"
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
                                            <div>
                                                {expense.provider ? (
                                                    <Badge
                                                        className={`${expense.provider === Providers.MOTOFACIL
                                                                ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300"
                                                                : expense.provider === Providers.OBRASOCIAL
                                                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                                                    : "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
                                                            }`}
                                                        variant="outline"
                                                    >
                                                        {formatProviderName(expense.provider)}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">—</span>
                                                )}
                                            </div>
                                            <div className="text-right font-medium text-red-600">{formatCurrency(expense.amount)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
