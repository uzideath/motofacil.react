"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Search, Plus, Filter } from "lucide-react"
import type { Motorcycle } from "@/lib/types"
import { MotorcycleForm } from "../MotorcycleForm"

interface MotorcycleTableControlsProps {
    searchTerm: string
    setSearchTerm: (term: string) => void
    providerFilter: string
    setProviderFilter: (provider: string) => void
    itemsPerPage: number
    setItemsPerPage: (items: number) => void
    setCurrentPage: (page: number) => void
    uniqueProviders: string[]
    getProviderLabel: (providerName: string) => string
    onMotorcycleCreated: (motorcycle?: Motorcycle) => void
}

export function MotorcycleTableControls({
    searchTerm,
    setSearchTerm,
    providerFilter,
    setProviderFilter,
    itemsPerPage,
    setItemsPerPage,
    setCurrentPage,
    uniqueProviders,
    getProviderLabel,
    onMotorcycleCreated,
}: MotorcycleTableControlsProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-500/70" />
                    <Input
                        type="search"
                        placeholder="Buscar por marca, modelo, placa, motor o chasis..."
                        className="pl-9 border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-blue-500/70" />
                    <Select
                        value={providerFilter}
                        onValueChange={(value) => {
                            setProviderFilter(value)
                            setCurrentPage(1)
                        }}
                    >
                        <SelectTrigger className="w-[180px] border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700">
                            <SelectValue placeholder="Todos los proveedores" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los proveedores</SelectItem>
                            {uniqueProviders.map((provider) => (
                                <SelectItem key={provider} value={provider}>
                                    {getProviderLabel(provider)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                        setItemsPerPage(Number(value))
                        setCurrentPage(1)
                    }}
                >
                    <SelectTrigger className="w-[130px] border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700">
                        <SelectValue placeholder="Mostrar" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5 por página</SelectItem>
                        <SelectItem value="10">10 por página</SelectItem>
                        <SelectItem value="20">20 por página</SelectItem>
                        <SelectItem value="50">50 por página</SelectItem>
                    </SelectContent>
                </Select>
                <MotorcycleForm onCreated={onMotorcycleCreated}>
                    <Button className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white shadow-sm hover:shadow-md transition-all">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Motocicleta
                    </Button>
                </MotorcycleForm>
            </div>
        </div>
    )
}
