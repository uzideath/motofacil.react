"use client"

import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Bike } from "lucide-react"

interface MotorcycleTableEmptyStateProps {
    hasActiveFilters: boolean
    onClearFilters: () => void
}

export function MotorcycleTableEmptyState({ hasActiveFilters, onClearFilters }: MotorcycleTableEmptyStateProps) {
    return (
        <TableRow className="border-blue-100 dark:border-blue-900/30">
            <TableCell colSpan={10} className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="flex flex-col items-center justify-center gap-2">
                    <Bike className="h-10 w-10 text-blue-300/50 dark:text-blue-700/30" />
                    <p className="text-sm">No se encontraron motocicletas</p>
                    {hasActiveFilters && (
                        <Button variant="link" onClick={onClearFilters} className="text-blue-500 dark:text-blue-400">
                            Limpiar filtros
                        </Button>
                    )}
                </div>
            </TableCell>
        </TableRow>
    )
}
