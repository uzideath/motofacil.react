"use client"

import { TableHeader, TableRow, TableHead } from "@/components/ui/table"
import {
    ArrowDownUp,
    User,
    BikeIcon as Motorcycle,
    DollarSign,
    Calendar,
    CreditCard,
    Clock,
    FileText,
    BikeIcon,
} from "lucide-react"
import { SortField } from "../utils/types"

interface TableHeaderProps {
    sortField: SortField
    sortDirection: "asc" | "desc"
    onSort: (field: SortField) => void
}

export function InstallmentTableHeader({ sortField, sortDirection, onSort }: TableHeaderProps) {
    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <ArrowDownUp className="ml-1 h-4 w-4 text-blue-300/50" />
        return sortDirection === "asc" ? (
            <ArrowDownUp className="ml-1 h-4 w-4 text-blue-300" />
        ) : (
            <ArrowDownUp className="ml-1 h-4 w-4 text-blue-300 rotate-180" />
        )
    }

    return (
        <TableHeader className="bg-dark-blue-800/70 sticky top-0">
            <TableRow className="border-dark-blue-700 hover:bg-dark-blue-700/50">
                <TableHead className="text-blue-200 font-medium cursor-pointer" onClick={() => onSort("userName")}>
                    <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-blue-300/70" />
                        Cliente
                        {getSortIcon("userName")}
                    </div>
                </TableHead>
                <TableHead
                    className="hidden md:table-cell text-blue-200 font-medium cursor-pointer"
                    onClick={() => onSort("motorcycleModel")}
                >
                    <div className="flex items-center">
                        <Motorcycle className="mr-2 h-4 w-4 text-blue-300/70" />
                        Motocicleta
                        {getSortIcon("motorcycleModel")}
                    </div>
                </TableHead>
                <TableHead className="hidden md:table-cell text-blue-200 font-medium">
                    <div className="flex items-center">
                        <BikeIcon className="mr-2 h-4 w-4 text-blue-300/70" />
                        Placa
                    </div>
                </TableHead>
                <TableHead className="text-blue-200 font-medium cursor-pointer" onClick={() => onSort("amount")}>
                    <div className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4 text-blue-300/70" />
                        Monto
                        {getSortIcon("amount")}
                    </div>
                </TableHead>
                <TableHead className="text-blue-200 font-medium">
                    <div className="flex items-center">
                        <BikeIcon className="mr-2 h-4 w-4 text-blue-300/70" />
                        GPS
                    </div>
                </TableHead>
                <TableHead
                    className="hidden md:table-cell text-blue-200 font-medium cursor-pointer"
                    onClick={() => onSort("date")}
                >
                    <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-blue-300/70" />
                        Fecha
                        {getSortIcon("date")}
                    </div>
                </TableHead>
                <TableHead className="text-blue-200 font-medium">
                    <div className="flex items-center">
                        <CreditCard className="mr-2 h-4 w-4 text-blue-300/70" />
                        Método
                    </div>
                </TableHead>
                <TableHead className="text-blue-200 font-medium text-center">
                    <div className="flex items-center justify-center">
                        <Clock className="mr-2 h-4 w-4 text-blue-300/70" />
                        Estado
                    </div>
                </TableHead>
                <TableHead className="text-blue-200 font-medium">
                    <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-blue-300/70" />
                        Registrado por
                    </div>
                </TableHead>
                <TableHead className="text-blue-200 font-medium text-right">
                    <div className="flex items-center justify-end">
                        <FileText className="mr-2 h-4 w-4 text-blue-300/70" />
                        Acciones
                    </div>
                </TableHead>
            </TableRow>
        </TableHeader>
    )
}
