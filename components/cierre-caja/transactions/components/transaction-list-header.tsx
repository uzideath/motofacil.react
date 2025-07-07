"use client"

import { TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import type { SortField } from "../constants/types"

interface TransactionListHeaderProps {
    selectedAll: boolean
    indeterminate?: boolean
    onSelectAll: (checked: boolean) => void
    sortField: SortField
    sortDirection: string
    onSort: (field: SortField) => void
}

export function TransactionListHeader({
    selectedAll,
    indeterminate = false,
    onSelectAll,
    sortField,
    sortDirection,
    onSort,
}: TransactionListHeaderProps) {
    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />
        }
        return sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
    }

    return (
        <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                <TableHead className="w-12">
                    <Checkbox
                        checked={indeterminate ? "indeterminate" : selectedAll}
                        onCheckedChange={(checked) => onSelectAll(!!checked)}
                        aria-label="Seleccionar todas las transacciones"
                    />
                </TableHead>
                <TableHead>
                    <Button
                        variant="ghost"
                        onClick={() => onSort("date")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                    >
                        Fecha
                        {getSortIcon("date")}
                    </Button>
                </TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>
                    <Button
                        variant="ghost"
                        onClick={() => onSort("provider")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                    >
                        Proveedor
                        {getSortIcon("provider")}
                    </Button>
                </TableHead>
                <TableHead className="text-right">
                    <Button
                        variant="ghost"
                        onClick={() => onSort("amount")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                    >
                        Monto
                        {getSortIcon("amount")}
                    </Button>
                </TableHead>
                <TableHead>Método de Pago</TableHead>
                <TableHead>ID</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
        </TableHeader>
    )
}
