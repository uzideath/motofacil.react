"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bike, Filter, Search } from "lucide-react"
import { FILTER_OPTIONS } from "../../constants"

interface TransactionFiltersProps {
    searchTerm: string
    typeFilter: string
    providerFilter: string
    onSearchChange: (value: string) => void
    onTypeFilterChange: (value: string) => void
    onProviderFilterChange: (value: string) => void
    onResetFilters: () => void
    hasActiveFilters: boolean
}

export function TransactionFilters({
    searchTerm,
    typeFilter,
    providerFilter,
    onSearchChange,
    onTypeFilterChange,
    onProviderFilterChange,
    onResetFilters,
    hasActiveFilters,
}: TransactionFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
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
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <Select value={typeFilter} onValueChange={onTypeFilterChange}>
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

                <Select value={providerFilter} onValueChange={onProviderFilterChange}>
                    <SelectTrigger className="w-full md:w-[180px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Bike className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Filtrar por proveedor" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {FILTER_OPTIONS.PROVIDER.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onResetFilters}
                        className="h-10 px-3 text-muted-foreground hover:text-foreground"
                    >
                        Limpiar filtros
                    </Button>
                )}
            </div>
        </div>
    )
}
