"use client"

import React, { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bike, Filter, Search, Loader2, CalendarIcon, X } from "lucide-react"
import { FILTER_OPTIONS } from "../../constants"
import { useProviders } from "@/components/providers/hooks/useProviders"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { utcToZonedTime } from "date-fns-tz"

interface TransactionFiltersProps {
    searchTerm: string
    typeFilter: string
    providerFilter: string
    startDate?: string
    endDate?: string
    onSearchChange: (value: string) => void
    onTypeFilterChange: (value: string) => void
    onProviderFilterChange: (value: string) => void
    onDateRangeChange: (startDate?: string, endDate?: string) => void
    onResetFilters: () => void
    hasActiveFilters: boolean
}

export const TransactionFilters = React.memo(function TransactionFilters({
    searchTerm,
    typeFilter,
    providerFilter,
    startDate,
    endDate,
    onSearchChange,
    onTypeFilterChange,
    onProviderFilterChange,
    onDateRangeChange,
    onResetFilters,
    hasActiveFilters,
}: TransactionFiltersProps) {
    const { providers, loading: providersLoading, error: providersError } = useProviders()

    // Convert string dates to DateRange for the picker
    const dateRange = useMemo<DateRange | undefined>(() => {
        if (!startDate && !endDate) return undefined
        
        const colombiaTimeZone = 'America/Bogota'
        return {
            from: startDate ? utcToZonedTime(new Date(startDate), colombiaTimeZone) : undefined,
            to: endDate ? utcToZonedTime(new Date(endDate), colombiaTimeZone) : undefined,
        }
    }, [startDate, endDate])

    // Handle date range change from picker
    const handleDateChange = (range: DateRange | undefined) => {
        if (!range) {
            onDateRangeChange(undefined, undefined)
            return
        }

        // Convert to ISO string format for the API (Colombia timezone)
        const start = range.from ? format(range.from, 'yyyy-MM-dd') : undefined
        const end = range.to ? format(range.to, 'yyyy-MM-dd') : undefined
        
        onDateRangeChange(start, end)
    }

    // Clear date filter
    const handleClearDate = () => {
        onDateRangeChange(undefined, undefined)
    }

    return (
        <div className="flex flex-col gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar por cliente, descripción o referencia..."
                    className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2 w-full">
                {/* Date Range Picker */}
                <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                    <DatePickerWithRange
                        date={dateRange}
                        onDateChange={handleDateChange}
                        className="flex-1"
                    />
                    {(startDate || endDate) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClearDate}
                            className="h-10 w-10 text-muted-foreground hover:text-foreground"
                            title="Limpiar fechas"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Type Filter */}
                <Select key={`type-${typeFilter}`} value={typeFilter} onValueChange={onTypeFilterChange}>
                    <SelectTrigger className="w-full md:w-[180px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Filtrar por tipo" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {FILTER_OPTIONS.TYPE.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Provider Filter */}
                <Select
                    key={`provider-${providerFilter}`}
                    value={providerFilter}
                    onValueChange={onProviderFilterChange}
                    disabled={providersLoading}
                >
                    <SelectTrigger className="w-full md:w-[180px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Bike className="h-4 w-4 text-muted-foreground" />
                            {providersLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Cargando...</span>
                                </div>
                            ) : (
                                <SelectValue placeholder="Filtrar por proveedor" />
                            )}
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los proveedores</SelectItem>
                        {providersError ? (
                            <SelectItem value="error" disabled>
                                Error al cargar proveedores
                            </SelectItem>
                        ) : (
                            providers.map((provider) => (
                                <SelectItem key={provider.id} value={provider.name}>
                                    {provider.name}
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>

                {/* Reset Filters Button */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onResetFilters}
                        className="h-10 px-3 text-muted-foreground hover:text-foreground ml-auto"
                    >
                        Limpiar todos los filtros
                    </Button>
                )}
            </div>
        </div>
    )
})
