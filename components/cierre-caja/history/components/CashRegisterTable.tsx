"use client"

import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Calendar,
    Clock,
    User,
    Bike,
    ArrowUpToLine,
    ArrowDownToLine,
    Wallet,
    Eye,
    Search,
    FileSpreadsheet,
} from "lucide-react"
import { FileIcon as FilePdf } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"
import { CashRegisterDisplay } from "../types"
import { ProviderBadge } from "./ProviderBadge"
import { StatusBadge } from "./StatusBadge"

interface CashRegisterTableProps {
    data: CashRegisterDisplay[]
    loading: boolean
    onViewDetails: (register: CashRegisterDisplay) => void
    onPrint: (id: string) => void
    isGenerating: boolean
}

export const CashRegisterTable: React.FC<CashRegisterTableProps> = ({
    data,
    loading,
    onViewDetails,
    onPrint,
    isGenerating,
}) => {
    if (loading) {
        return (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                            <TableRow className="hover:bg-slate-100 dark:hover:bg-slate-800/50">
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead className="w-[100px]">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Fecha
                                    </div>
                                </TableHead>
                                <TableHead className="w-[80px]">
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2" />
                                        Hora
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div className="flex items-center">
                                        <User className="h-4 w-4 mr-2" />
                                        Usuario
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div className="flex items-center">
                                        <Bike className="h-4 w-4 mr-2" />
                                        Proveedor
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">
                                    <div className="flex items-center justify-end">
                                        <ArrowUpToLine className="h-4 w-4 mr-2 text-green-500" />
                                        Ingresos
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">
                                    <div className="flex items-center justify-end">
                                        <ArrowDownToLine className="h-4 w-4 mr-2 text-red-500" />
                                        Egresos
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">
                                    <div className="flex items-center justify-end">
                                        <Wallet className="h-4 w-4 mr-2 text-blue-500" />
                                        Balance
                                    </div>
                                </TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                    {Array.from({ length: 10 }).map((__, i) => (
                                        <TableCell key={i}>
                                            <Skeleton className="h-5 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                            <TableRow className="hover:bg-slate-100 dark:hover:bg-slate-800/50">
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead className="w-[100px]">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Fecha
                                    </div>
                                </TableHead>
                                <TableHead className="w-[80px]">
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2" />
                                        Hora
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div className="flex items-center">
                                        <User className="h-4 w-4 mr-2" />
                                        Usuario
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div className="flex items-center">
                                        <Bike className="h-4 w-4 mr-2" />
                                        Proveedor
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">
                                    <div className="flex items-center justify-end">
                                        <ArrowUpToLine className="h-4 w-4 mr-2 text-green-500" />
                                        Ingresos
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">
                                    <div className="flex items-center justify-end">
                                        <ArrowDownToLine className="h-4 w-4 mr-2 text-red-500" />
                                        Egresos
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">
                                    <div className="flex items-center justify-end">
                                        <Wallet className="h-4 w-4 mr-2 text-blue-500" />
                                        Balance
                                    </div>
                                </TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={10} className="text-center py-10">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <Search className="h-10 w-10 mb-2 opacity-20" />
                                        <p className="text-lg font-medium">No se encontraron registros de cierre de caja</p>
                                        <p className="text-sm">Intenta con otros criterios de búsqueda o limpia los filtros</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow className="hover:bg-slate-100 dark:hover:bg-slate-800/50">
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead className="w-[100px]">
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Fecha
                                </div>
                            </TableHead>
                            <TableHead className="w-[80px]">
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Hora
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center">
                                    <User className="h-4 w-4 mr-2" />
                                    Usuario
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center">
                                    <Bike className="h-4 w-4 mr-2" />
                                    Proveedor
                                </div>
                            </TableHead>
                            <TableHead className="text-right">
                                <div className="flex items-center justify-end">
                                    <ArrowUpToLine className="h-4 w-4 mr-2 text-green-500" />
                                    Ingresos
                                </div>
                            </TableHead>
                            <TableHead className="text-right">
                                <div className="flex items-center justify-end">
                                    <ArrowDownToLine className="h-4 w-4 mr-2 text-red-500" />
                                    Egresos
                                </div>
                            </TableHead>
                            <TableHead className="text-right">
                                <div className="flex items-center justify-end">
                                    <Wallet className="h-4 w-4 mr-2 text-blue-500" />
                                    Balance
                                </div>
                            </TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((r) => (
                            <TableRow key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                <TableCell className="font-medium font-mono text-xs">
                                    <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit">{r.id.substring(0, 8)}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
                                            <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                                        </div>
                                        <span>{r.date}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{r.time}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
                                            <User className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                                        </div>
                                        <span>{r.user}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <ProviderBadge provider={r.provider} />
                                </TableCell>
                                <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                                    {formatCurrency(r.totalIncome)}
                                </TableCell>
                                <TableCell className="text-right font-medium text-red-600 dark:text-red-400">
                                    {formatCurrency(r.totalExpense)}
                                </TableCell>
                                <TableCell
                                    className={cn(
                                        "text-right font-medium",
                                        r.balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400",
                                    )}
                                >
                                    {formatCurrency(r.balance)}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={r.status} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onViewDetails(r)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Ver detalles</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => onPrint(r.id)}
                                                        disabled={isGenerating}
                                                    >
                                                        <FilePdf className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Descargar e imprimir PDF</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                                        <FileSpreadsheet className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Exportar Excel</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
