import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpToLine, ArrowDownToLine, Wallet } from 'lucide-react'
import { formatCurrency } from "@/lib/utils"

interface SummaryCardsProps {
    totalIncome: number
    totalExpense: number
    totalBalance: number
    totalPayments: number
    totalExpenses: number
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
    totalIncome,
    totalExpense,
    totalBalance,
    totalPayments,
    totalExpenses,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
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
                        {totalPayments} transacciones registradas
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
                        {totalExpenses} transacciones registradas
                    </p>
                </CardContent>
            </Card>

            <Card
                className={`${totalBalance >= 0
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30"
                        : "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30"
                    }`}
            >
                <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p
                                className={`text-sm font-medium ${totalBalance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"
                                    }`}
                            >
                                Balance Neto
                            </p>
                            <p
                                className={`text-2xl font-bold ${totalBalance >= 0 ? "text-blue-700 dark:text-blue-300" : "text-amber-700 dark:text-amber-300"
                                    }`}
                            >
                                {formatCurrency(totalBalance)}
                            </p>
                        </div>
                        <div
                            className={`p-3 rounded-full ${totalBalance >= 0 ? "bg-blue-100 dark:bg-blue-800/30" : "bg-amber-100 dark:bg-amber-800/30"
                                }`}
                        >
                            <Wallet
                                className={`h-6 w-6 ${totalBalance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"
                                    }`}
                            />
                        </div>
                    </div>
                    <p
                        className={`text-xs ${totalBalance >= 0
                                ? "text-blue-600/70 dark:text-blue-400/70"
                                : "text-amber-600/70 dark:text-amber-400/70"
                            } mt-2`}
                    >
                        {totalBalance >= 0 ? "Balance positivo" : "Balance negativo"}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
