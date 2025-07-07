"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Square, X, ReplaceAllIcon as SelectAll } from 'lucide-react'
import { formatCurrency } from "@/lib/utils"

interface TransactionSelectionSummaryProps {
    selectedCount: number
    selectedSummary: {
        totalIncome: number
        totalExpense: number
        netAmount: number
        count: number
    }
    onSelectAllFiltered: (checked: boolean) => void
    onClearAll: () => void
    totalFilteredItems: number
}

export function TransactionSelectionSummary({
    selectedCount,
    selectedSummary,
    onSelectAllFiltered,
    onClearAll,
    totalFilteredItems,
}: TransactionSelectionSummaryProps) {
    const allFilteredSelected = selectedCount === totalFilteredItems && totalFilteredItems > 0

    return (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-blue-900 dark:text-blue-100">
                                {selectedCount} transacción{selectedCount !== 1 ? "es" : ""} seleccionada
                                {selectedCount !== 1 ? "s" : ""}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                            >
                                Ingresos: {formatCurrency(selectedSummary.totalIncome)}
                            </Badge>
                            <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                                Egresos: {formatCurrency(selectedSummary.totalExpense)}
                            </Badge>
                            <Badge
                                variant="secondary"
                                className={`${selectedSummary.netAmount >= 0
                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                        : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
                                    }`}
                            >
                                Neto: {formatCurrency(selectedSummary.netAmount)}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectAllFiltered(!allFilteredSelected)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950/40"
                        >
                            {allFilteredSelected ? (
                                <>
                                    <Square className="mr-2 h-4 w-4" />
                                    Deseleccionar todas
                                </>
                            ) : (
                                <>
                                    <SelectAll className="mr-2 h-4 w-4" />
                                    Seleccionar todas ({totalFilteredItems})
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearAll}
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/40 bg-transparent"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Limpiar selección
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
