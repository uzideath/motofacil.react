"use client"

import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Building } from "lucide-react"

interface ProviderTableEmptyStateProps {
    searchTerm: string
    onClearSearch: () => void
}

export function ProviderTableEmptyState({ searchTerm, onClearSearch }: ProviderTableEmptyStateProps) {
    return (
        <TableRow className="border-blue-100 dark:border-blue-900/30">
            <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="flex flex-col items-center justify-center gap-2">
                    <Building className="h-10 w-10 text-blue-300/50 dark:text-blue-700/30" />
                    <p className="text-sm">No se encontraron proveedores</p>
                    {searchTerm && (
                        <Button variant="link" onClick={onClearSearch} className="text-blue-500 dark:text-blue-400">
                            Limpiar búsqueda
                        </Button>
                    )}
                </div>
            </TableCell>
        </TableRow>
    )
}
