"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, RefreshCw, Wallet, FileSpreadsheet } from "lucide-react"
import { FileIcon as FilePdf } from "lucide-react"
import { CashRegisterDetailModal } from "./CashRegisterDetailModal"
import { CashRegisterTable } from "./history/components/CashRegisterTable"
import { FiltersSection } from "./history/components/FilterSection"
import { PaginationControls } from "./history/components/PaginationControls"
import { SummaryCards } from "./history/components/SummaryCard"
import { useCashRegisterData } from "./history/hooks/useCashRegisterData"
import { useCashRegisterFilters } from "./history/hooks/useCashRegisterFilter"
import { usePrintPdf } from "./history/hooks/usePrintPDF"
import { filterRegisters, calculateSummaryStats } from "./history/utils"
import { CashRegisterDisplay } from "@/lib/types"

export function CashRegisterHistory() {
    const [selectedRegister, setSelectedRegister] = useState<CashRegisterDisplay | null>(null)
    const { registers, loading, refreshing, refetch } = useCashRegisterData()
    const { filters, pagination, updateFilter, updatePagination, resetFilters } = useCashRegisterFilters()
    const { handlePrint, isGenerating } = usePrintPdf()
    const filteredRegisters = filterRegisters(registers, filters)
    const summaryStats = calculateSummaryStats(filteredRegisters)
    const itemsPerPageNumber = Number.parseInt(pagination.itemsPerPage)
    const indexOfLastItem = pagination.currentPage * itemsPerPageNumber
    const indexOfFirstItem = indexOfLastItem - itemsPerPageNumber
    const currentItems = filteredRegisters.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredRegisters.length / itemsPerPageNumber)

    return (
        <Card className="shadow-md border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-primary" />
                            Historial de Cierres de Caja
                        </CardTitle>
                        <CardDescription>Consulta y gestiona todos los cierres de caja realizados</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={refetch} disabled={refreshing} className="h-9 gap-1.5">
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
                                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                                    Exportar a Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <FilePdf className="h-4 w-4 mr-2" />
                                    Exportar a PDF
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <FiltersSection
                    filters={filters}
                    onFilterChange={updateFilter}
                    onResetFilters={resetFilters}
                />

                <SummaryCards
                    totalIncome={summaryStats.totalIncome}
                    totalExpense={summaryStats.totalExpense}
                    totalBalance={summaryStats.totalBalance}
                    totalPayments={summaryStats.totalPayments}
                    totalExpenses={summaryStats.totalExpenses}
                />

                <CashRegisterTable
                    data={currentItems}
                    loading={loading}
                    onViewDetails={setSelectedRegister}
                    onPrint={handlePrint}
                    isGenerating={isGenerating}
                />

                <PaginationControls
                    currentPage={pagination.currentPage}
                    totalPages={totalPages}
                    itemsPerPage={pagination.itemsPerPage}
                    totalItems={filteredRegisters.length}
                    onPageChange={(page) => updatePagination("currentPage", page)}
                    onItemsPerPageChange={(value) => updatePagination("itemsPerPage", value)}
                />
            </CardContent>

            {selectedRegister && (
                <CashRegisterDetailModal
                    open={!!selectedRegister}
                    onClose={() => setSelectedRegister(null)}
                    cashRegister={selectedRegister.raw}
                />
            )}
        </Card>
    )
}
