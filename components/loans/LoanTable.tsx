"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, User, Bike, CalendarDays, Wallet, Activity, Settings } from "lucide-react"
import { LoanTableControls } from "./components/LoanTableControls"
import { LoanTableDialogs } from "./components/LoanTableDialogs"
import { LoanTableHeader } from "./components/LoanTableHeader"
import { LoanTablePagination } from "./components/LoanTablePagination"
import { LoanTableRow } from "./components/LoanTableRow"
import { useLoanTable } from "./hooks/useLoanTable"

export function LoanTable() {
  const {
    loading,
    searchTerm,
    currentPage,
    itemsPerPage,
    printingContract,
    printProgress,
    deleteDialogOpen,
    archiveDialogOpen,
    showArchived,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    currentItems,
    setSearchTerm,
    setCurrentPage,
    setItemsPerPage,
    setPrintingContract,
    setDeleteDialogOpen,
    setArchiveDialogOpen,
    setShowArchived,
    handleDelete,
    handleArchive,
    confirmDelete,
    confirmArchive,
    handlePrintContract,
    refreshData,
    exportToCSV,
  } = useLoanTable()

  return (
    <Card className="bg-white dark:bg-gray-950 border border-blue-100 dark:border-blue-900/30 shadow-md">
      <LoanTableHeader onRefresh={refreshData} onExportCSV={exportToCSV} />

      <CardContent className="p-6">
        <div className="space-y-6">
          <LoanTableControls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            onPageChange={setCurrentPage}
            showArchived={showArchived}
            onShowArchivedChange={setShowArchived}
          />

          <div className="rounded-lg border border-blue-100 dark:border-blue-900/30 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50">
                    <TableHead className="text-blue-700 dark:text-blue-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        <span>Cliente</span>
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell text-blue-700 dark:text-blue-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Bike className="h-4 w-4" />
                        <span>Vehículo</span>
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell text-blue-700 dark:text-blue-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4" />
                        <span>Monto Total</span>
                      </div>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell text-blue-700 dark:text-blue-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        <span>Cuotas</span>
                      </div>
                    </TableHead>
                    <TableHead className="hidden xl:table-cell text-blue-700 dark:text-blue-300 font-medium">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4" />
                          <span>Fechas</span>
                        </div>
                        <span className="text-xs font-normal text-gray-500 dark:text-gray-400">Inicio / Fin</span>
                      </div>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell text-blue-700 dark:text-blue-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Wallet className="h-4 w-4" />
                        <span>Deuda Restante</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-blue-700 dark:text-blue-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Activity className="h-4 w-4" />
                        <span>Estado</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right text-blue-700 dark:text-blue-300 font-medium">
                      <div className="flex items-center justify-end gap-1.5">
                        <Settings className="h-4 w-4" />
                        <span>Acciones</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <TableRow
                        key={`skeleton-${index}`}
                        className="border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      >
                        <TableCell>
                          <Skeleton className="h-5 w-[150px] bg-blue-100/50 dark:bg-blue-900/20" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-5 w-[120px] bg-blue-100/50 dark:bg-blue-900/20" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-5 w-[100px] bg-blue-100/50 dark:bg-blue-900/20" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Skeleton className="h-5 w-[80px] bg-blue-100/50 dark:bg-blue-900/20" />
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <Skeleton className="h-5 w-[100px] bg-blue-100/50 dark:bg-blue-900/20" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Skeleton className="h-5 w-[100px] bg-blue-100/50 dark:bg-blue-900/20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[80px] bg-blue-100/50 dark:bg-blue-900/20" />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <Skeleton
                                key={`action-skeleton-${index}-${i}`}
                                className="h-8 w-8 rounded-md bg-blue-100/50 dark:bg-blue-900/20"
                              />
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : currentItems.length === 0 ? (
                    <TableRow className="border-blue-100 dark:border-blue-900/30">
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <DollarSign className="h-10 w-10 text-blue-300/50 dark:text-blue-700/30" />
                          <p className="text-sm">
                            {showArchived
                              ? "No se encontraron préstamos archivados"
                              : "No se encontraron arrendamientos"}
                          </p>
                          {searchTerm && (
                            <Button
                              variant="link"
                              onClick={() => setSearchTerm("")}
                              className="text-blue-500 dark:text-blue-400"
                            >
                              Limpiar búsqueda
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map((loan, index) => (
                      <LoanTableRow
                        key={`loan-row-${loan.id}-${index}`}
                        loan={loan}
                        index={index}
                        onDelete={handleDelete}
                        onArchive={handleArchive}
                        onPrintContract={handlePrintContract}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <LoanTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setCurrentPage}
          />
        </div>
      </CardContent>

      <LoanTableDialogs
        printingContract={printingContract}
        printProgress={printProgress}
        deleteDialogOpen={deleteDialogOpen}
        archiveDialogOpen={archiveDialogOpen}
        onPrintingContractChange={setPrintingContract}
        onDeleteDialogChange={setDeleteDialogOpen}
        onArchiveDialogChange={setArchiveDialogOpen}
        onConfirmDelete={confirmDelete}
        onConfirmArchive={confirmArchive}
      />
    </Card>
  )
}
