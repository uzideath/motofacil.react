import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { ArrowDownToLine, ArrowUpToLine, Wallet, CheckSquare } from "lucide-react"

interface TransactionSummaryProps {
    totalIncome: number
    totalExpense: number
    netAmount: number
    selectedCount?: number
    selectedSummary?: {
        totalIncome: number
        totalExpense: number
        netAmount: number
    }
}

export function TransactionSummary({
    totalIncome,
    totalExpense,
    netAmount,
    selectedCount = 0,
    selectedSummary,
}: TransactionSummaryProps) {
    // Show selected summary if there are selections, otherwise show total summary
    const displayIncome = selectedCount > 0 ? selectedSummary?.totalIncome || 0 : totalIncome
    const displayExpense = selectedCount > 0 ? selectedSummary?.totalExpense || 0 : totalExpense
    const displayNet = selectedCount > 0 ? selectedSummary?.netAmount || 0 : netAmount
    const isShowingSelected = selectedCount > 0

    return (
        <div className="space-y-4">
            {isShowingSelected && (
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <CheckSquare className="h-4 w-4" />
                    <span>Mostrando resumen de {selectedCount} transacciones seleccionadas</span>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                    className={`${isShowingSelected ? "ring-2 ring-blue-200 dark:ring-blue-800" : ""} bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30`}
                >
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                    {isShowingSelected ? "Ingresos Seleccionados" : "Total Ingresos"}
                                </p>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCurrency(displayIncome)}</p>
                            </div>
                            <div className="bg-green-100 dark:bg-green-800/30 p-3 rounded-full">
                                <ArrowUpToLine className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card
                    className={`${isShowingSelected ? "ring-2 ring-blue-200 dark:ring-blue-800" : ""} bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30`}
                >
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                    {isShowingSelected ? "Egresos Seleccionados" : "Total Egresos"}
                                </p>
                                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{formatCurrency(displayExpense)}</p>
                            </div>
                            <div className="bg-red-100 dark:bg-red-800/30 p-3 rounded-full">
                                <ArrowDownToLine className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card
                    className={`${isShowingSelected ? "ring-2 ring-blue-200 dark:ring-blue-800" : ""} ${displayNet >= 0
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30"
                            : "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30"
                        }`}
                >
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p
                                    className={`text-sm font-medium ${displayNet >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"
                                        }`}
                                >
                                    {isShowingSelected ? "Balance Seleccionado" : "Balance Neto"}
                                </p>
                                <p
                                    className={`text-2xl font-bold ${displayNet >= 0 ? "text-blue-700 dark:text-blue-300" : "text-amber-700 dark:text-amber-300"
                                        }`}
                                >
                                    {formatCurrency(displayNet)}
                                </p>
                            </div>
                            <div
                                className={`p-3 rounded-full ${displayNet >= 0 ? "bg-blue-100 dark:bg-blue-800/30" : "bg-amber-100 dark:bg-amber-800/30"
                                    }`}
                            >
                                <Wallet
                                    className={`h-6 w-6 ${displayNet >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"
                                        }`}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
