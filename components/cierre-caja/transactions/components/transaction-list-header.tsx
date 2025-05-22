"use client"

import { TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDownUp } from "lucide-react"
import { SortField } from "../constants/types"

interface TransactionListHeaderProps {
    selectedAll: boolean
    onSelectAll: (checked: boolean) => void
    sortField: SortField
    sortDirection: string
    onSort: (field: SortField) => void
}

export function TransactionListHeader({
    selectedAll,
    onSelectAll,
    sortField,
    sortDirection,
    onSort,
}: TransactionListHeaderProps) {
    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <ArrowDownUp className="ml-1 h-4 w-4 opacity-50" />
        return sortDirection === "asc" ? (
            <ArrowDownUp className="ml-1 h-4 w-4" />
        ) : (
            <ArrowDownUp className="ml-1 h-4 w-4 rotate-180" />
        )
    }

    return (
        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow className="hover:bg-slate-100 dark:hover:bg-slate-800/50">
                <TableHead className="w-[40px]">
                    <div className="flex items-center justify-center">
                        <input
                            type="checkbox"
                            className="rounded border-slate-300 dark:border-slate-700"
                            checked={selectedAll}
                            onChange={(e) => onSelectAll(e.target.checked)}
                        />
                    </div>
                </TableHead>
                <TableHead
                    className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    onClick={() => onSort("time")}
                >
                    <div className="flex items-center">
                        Hora
                        {getSortIcon("time")}
                    </div>
                </TableHead>
                <TableHead
                    className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    onClick={() => onSort("description")}
                >
                    <div className="flex items-center">
                        Descripción
                        {getSortIcon("description")}
                    </div>
                </TableHead>
                <TableHead
                    className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    onClick={() => onSort("category")}
                >
                    <div className="flex items-center">
                        Categoría
                        {getSortIcon("category")}
                    </div>
                </TableHead>
                <TableHead
                    className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    onClick={() => onSort("provider")}
                >
                    <div className="flex items-center">
                        Proveedor
                        {getSortIcon("provider")}
                    </div>
                </TableHead>
                <TableHead
                    className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    onClick={() => onSort("amount")}
                >
                    <div className="flex items-center">
                        Monto
                        {getSortIcon("amount")}
                    </div>
                </TableHead>
                <TableHead>Método de Pago</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
        </TableHeader>
    )
}
