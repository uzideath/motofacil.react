"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, Bike, Filter } from "lucide-react"
import { format } from "date-fns"
import es from "date-fns/locale/es"
import { Providers, type FilterState } from "../types"

interface FiltersSectionProps {
    filters: FilterState
    onFilterChange: (key: keyof FilterState, value: string) => void
    onResetFilters: () => void
}

export const FiltersSection: React.FC<FiltersSectionProps> = ({ filters, onFilterChange, onResetFilters }) => {
    const hasActiveFilters =
        filters.searchTerm || filters.month !== "all" || filters.providerFilter !== "all" || filters.statusFilter !== "all"

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar por ID, usuario o proveedor..."
                    className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    value={filters.searchTerm}
                    onChange={(e) => onFilterChange("searchTerm", e.target.value)}
                />
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <Select value={filters.month} onValueChange={(value) => onFilterChange("month", value)}>
                    <SelectTrigger className="w-full md:w-[150px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Filtrar por mes" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los meses</SelectItem>
                        {[...Array(12)].map((_, i) => {
                            const value = `${i + 1}`.padStart(2, "0")
                            const label = format(new Date(2025, i, 1), "MMMM", { locale: es })
                            return (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>

                <Select value={filters.providerFilter} onValueChange={(value) => onFilterChange("providerFilter", value)}>
                    <SelectTrigger className="w-full md:w-[180px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Bike className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Filtrar por proveedor" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los proveedores</SelectItem>
                        <SelectItem value={Providers.MOTOFACIL}>Moto Facil</SelectItem>
                        <SelectItem value={Providers.OBRASOCIAL}>Obra Social</SelectItem>
                        <SelectItem value={Providers.PORCENTAJETITO}>Porcentaje Tito</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filters.statusFilter} onValueChange={(value) => onFilterChange("statusFilter", value)}>
                    <SelectTrigger className="w-full md:w-[150px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Filtrar por estado" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="balanced">Cuadrado</SelectItem>
                        <SelectItem value="minor-diff">Diferencia Menor</SelectItem>
                        <SelectItem value="major-diff">Diferencia Mayor</SelectItem>
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
