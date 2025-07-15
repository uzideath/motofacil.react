"use client"

import { Table, TableBody } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { DeleteConfirmationDialog } from "./delete-dialog"
import { useMotorcycleTable } from "./hooks/useMotorcycleTable"
import { MotorcycleTableHeader } from "./table/MotorcycleTableHeader"
import { MotorcycleTableControls } from "./table/MotorcycleTableControls"
import { MotorcycleTableHeaders } from "./table/MotorcycleTableHeaders"
import { MotorcycleTablePagination } from "./table/MotorcycleTablePagination"
import { MotorcycleTableRow } from "./table/MotorcycleTableRow"
import { MotorcycleTableSkeleton } from "./table/MotorcycleTableSkeleton"
import { MotorcycleTableEmptyState } from "./table/MotorcycleTableState"

export function MotorcycleTable() {
  const {
    motorcycles,
    loading,
    searchTerm,
    setSearchTerm,
    providerFilter,
    setProviderFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleMotorcycleCreated,
    handleDelete,
    confirmDelete,
    refreshData,
    exportToCSV,
    clearFilters,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    getPageNumbers,
    uniqueProviders,
    getProviderLabel,
    hasActiveFilters,
  } = useMotorcycleTable()

  return (
    <Card className="bg-white dark:bg-gray-950 border border-blue-100 dark:border-blue-900/30 shadow-md">
      <MotorcycleTableHeader onRefresh={refreshData} onExport={exportToCSV} />

      <CardContent className="p-6">
        <div className="space-y-6">
          <MotorcycleTableControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            providerFilter={providerFilter}
            setProviderFilter={setProviderFilter}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            setCurrentPage={setCurrentPage}
            uniqueProviders={uniqueProviders}
            getProviderLabel={getProviderLabel}
            onMotorcycleCreated={handleMotorcycleCreated}
          />

          <div className="rounded-lg border border-blue-100 dark:border-blue-900/30 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <MotorcycleTableHeaders />
                <TableBody>
                  {loading ? (
                    <MotorcycleTableSkeleton />
                  ) : motorcycles.length === 0 ? (
                    <MotorcycleTableEmptyState hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters} />
                  ) : (
                    motorcycles.map((motorcycle, index) => (
                      <MotorcycleTableRow
                        key={`moto-row-${motorcycle.id}-${index}`}
                        motorcycle={motorcycle}
                        index={index}
                        getProviderLabel={getProviderLabel}
                        onEdit={handleMotorcycleCreated}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <MotorcycleTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setCurrentPage}
            getPageNumbers={getPageNumbers}
          />
        </div>
      </CardContent>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar eliminación"
        description="¿Está seguro que desea eliminar esta motocicleta? Esta acción no se puede deshacer."
      />
    </Card>
  )
}
