"use client"

import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DollarSign, RefreshCw, MoreHorizontal, FileSpreadsheet, Calendar } from "lucide-react"

interface LoanTableHeaderProps {
    onRefresh: () => void
    onExportCSV: () => void
}

export function LoanTableHeader({ onRefresh, onExportCSV }: LoanTableHeaderProps) {
    return (
        <CardHeader className="bg-gradient-to-r from-blue-600 to-sky-500 text-white p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                        <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">Gestión de arrendamientos</CardTitle>
                        <CardDescription className="text-blue-100">Administra los arrendamientos y financiamientos</CardDescription>
                    </div>
                </div>
                <div className="flex gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onRefresh}
                                    className="bg-white/10 hover:bg-white/20 text-white"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Actualizar datos</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 text-white">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onExportCSV}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Exportar a CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                Ver calendario de pagos
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </CardHeader>
    )
}
