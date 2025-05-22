"use client"

import { Button } from "@/components/ui/button"
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, Download, FileText, Printer, RefreshCw } from "lucide-react"

interface TransactionHeaderProps {
    refreshing: boolean
    onRefresh: () => void
}

export function TransactionHeader({ refreshing, onRefresh }: TransactionHeaderProps) {
    return (
        <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Registro de Transacciones
                    </CardTitle>
                    <CardDescription>Gestiona y visualiza todas las transacciones del sistema</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing} className="h-9 gap-1.5">
                        <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                        Actualizar
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9">
                                <Download className="h-4 w-4 mr-1.5" />
                                Exportar
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Opciones de exportación</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Exportar a CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Exportar a Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </CardHeader>
    )
}
