"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Archive, ArchiveRestore } from "lucide-react"
import { LoanForm } from "../LoanForm"

interface LoanTableControlsProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    itemsPerPage: number
    onItemsPerPageChange: (value: number) => void
    onPageChange: (page: number) => void
    showArchived: boolean
    onShowArchivedChange: (value: boolean) => void
    onRefresh?: () => void
}

export function LoanTableControls({
    searchTerm,
    onSearchChange,
    itemsPerPage,
    onItemsPerPageChange,
    onPageChange,
    showArchived,
    onShowArchivedChange,
    onRefresh,
}: LoanTableControlsProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-500/70" />
                    <Input
                        type="search"
                        placeholder="Buscar por cliente, identificación o modelo..."
                        className="pl-9 border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={showArchived ? "default" : "outline"}
                        size="sm"
                        onClick={() => onShowArchivedChange(!showArchived)}
                        className={
                            showArchived
                                ? "bg-orange-500 hover:bg-orange-600 text-white"
                                : "border-orange-200 text-orange-600"
                        }
                    >
                        {showArchived ? (
                            <>
                                <ArchiveRestore className="mr-2 h-4 w-4" />
                                Ver Activos
                            </>
                        ) : (
                            <>
                                <Archive className="mr-2 h-4 w-4" />
                                Ver Archivados
                            </>
                        )}
                    </Button>
                    {showArchived && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            Archivados
                        </Badge>
                    )}
                </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
                <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                        onItemsPerPageChange(Number(value))
                        onPageChange(1)
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
                <LoanForm onSaved={onRefresh}>
                    <Button className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white shadow-sm hover:shadow-md transition-all">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Préstamo
                    </Button>
                </LoanForm>
            </div>
        </div>
    )
}
