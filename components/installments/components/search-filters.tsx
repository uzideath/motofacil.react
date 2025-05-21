"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DateRangePicker } from "@/components/date-range-picker"
import {
    Search,
    Filter,
    RefreshCw,
    Banknote,
    CreditCard,
    FileText,
    Clock,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react"
import type { DateRange } from "react-day-picker"

interface SearchFiltersProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    dateRange: DateRange | undefined
    onDateRangeChange: (range: DateRange | undefined) => void
    paymentFilter: string | null
    onPaymentFilterChange: (value: string | null) => void
    statusFilter: boolean | null
    onStatusFilterChange: (value: boolean | null) => void
    onResetFilters: () => void
    onRefresh: () => void
    hasActiveFilters: boolean
}

export function SearchFilters({
    searchTerm,
    onSearchChange,
    dateRange,
    onDateRangeChange,
    paymentFilter,
    onPaymentFilterChange,
    statusFilter,
    onStatusFilterChange,
    onResetFilters,
    onRefresh,
    hasActiveFilters,
}: SearchFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300" />
                <Input
                    type="search"
                    placeholder="Buscar por cliente, modelo o placa..."
                    className="pl-10 pr-4 py-2 bg-dark-blue-800/50 border-dark-blue-700/50 text-white placeholder:text-blue-300/70 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="flex gap-2 flex-wrap">
                <DateRangePicker onRangeChange={onDateRangeChange} className="w-full sm:w-[280px]" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-dark-blue-800/50 border-dark-blue-700/50 text-blue-300 hover:bg-dark-blue-700/70"
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Método de Pago
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-dark-blue-800 border-dark-blue-700 text-white">
                        <DropdownMenuItem onClick={() => onPaymentFilterChange(null)} className="focus:bg-dark-blue-700">
                            Todos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onPaymentFilterChange("CASH")} className="focus:bg-dark-blue-700">
                            <Banknote className="mr-2 h-4 w-4 text-green-400" />
                            Efectivo
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onPaymentFilterChange("CARD")} className="focus:bg-dark-blue-700">
                            <CreditCard className="mr-2 h-4 w-4 text-blue-400" />
                            Tarjeta
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onPaymentFilterChange("TRANSACTION")} className="focus:bg-dark-blue-700">
                            <FileText className="mr-2 h-4 w-4 text-purple-400" />
                            Transferencia
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-dark-blue-800/50 border-dark-blue-700/50 text-blue-300 hover:bg-dark-blue-700/70"
                        >
                            <Clock className="mr-2 h-4 w-4" />
                            Estado
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-dark-blue-800 border-dark-blue-700 text-white">
                        <DropdownMenuItem onClick={() => onStatusFilterChange(null)} className="focus:bg-dark-blue-700">
                            Todos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusFilterChange(false)} className="focus:bg-dark-blue-700">
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-400" />A tiempo
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusFilterChange(true)} className="focus:bg-dark-blue-700">
                            <AlertTriangle className="mr-2 h-4 w-4 text-red-400" />
                            Atrasada
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onResetFilters}
                        className="text-blue-300 hover:text-white hover:bg-dark-blue-700/50"
                    >
                        Limpiar filtros
                    </Button>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    className="bg-dark-blue-800/50 border-dark-blue-700/50 text-blue-300 hover:bg-dark-blue-700/70"
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Actualizar
                </Button>
            </div>
        </div>
    )
}
