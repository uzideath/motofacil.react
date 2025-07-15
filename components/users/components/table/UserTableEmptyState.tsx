"use client"

import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

interface TableEmptyStateProps {
    searchTerm: string
    onClearSearch: () => void
}

export function UserTableEmptyState({ searchTerm, onClearSearch }: TableEmptyStateProps) {
    return (
        <TableRow className="border-blue-100 dark:border-blue-900/30">
            <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="h-10 w-10 text-blue-300/50 dark:text-blue-700/30" />
                    <p className="text-sm">No se encontraron usuarios</p>
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
