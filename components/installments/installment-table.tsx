"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Calendar, PlusCircle } from "lucide-react"
import { InstallmentTableHeader } from "./components/table-header"
import { InstallmentRow } from "./components/table-row"
import { LoadingRow } from "./components/loading-row"
import { EmptyState } from "./components/empty-state"
import { SearchFilters } from "./components/search-filters"
import { Pagination } from "./components/pagination"
import { useState } from "react"
import { DateRangeSummary } from "./components/date-range"
import { AttachmentDialog } from "./components/dialogs/attachment"
import { DeleteDialog } from "./components/dialogs/delete"
import { SuccessDialog } from "./components/dialogs/success"
import { FilterSummary } from "./components/filter"
import { InstallmentForm } from "./components/forms/installment-form"
import { LoadingOverlay } from "./components/loading-overlay"
import { useInstallmentActions } from "./hooks/useInstallmentActions"
import { useInstallments } from "./hooks/useInstallments"
import { useTableState } from "./hooks/useTableState"
import { Installment } from "./utils/types"


export function InstallmentTable({ onRefresh }: { onRefresh?: (refreshFn: () => void) => void }) {
  const { installments, loading, fetchInstallments, refreshInstallments } = useInstallments(onRefresh)

  const {
    isGenerating,
    successMessage,
    isSuccessDialogOpen,
    setIsSuccessDialogOpen,
    selectedAttachmentUrl,
    isAttachmentDialogOpen,
    setIsAttachmentDialogOpen,
    deleteConfirmation,
    setDeleteConfirmation,
    isDeleting,
    editingInstallment: formEditingInstallment,
    handlePrint,
    handleSendWhatsapp,
    handleViewAttachment,
    handleEdit,
    handleDelete,
    confirmDelete,
  } = useInstallmentActions(refreshInstallments)

  const {
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    paymentFilter,
    setPaymentFilter,
    statusFilter,
    setStatusFilter,
    currentPage,
    itemsPerPage,
    dateRange,
    filteredInstallments,
    paginatedInstallments,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    hasActiveFilters,
    handleSort,
    resetFilters,
    handlePageChange,
    handleItemsPerPageChange,
    handleDateRangeChange,
  } = useTableState(installments)

  const [editingInstallment, setEditingInstallment] = useState<Installment | null>(null)

  return (
    <Card className="bg-dark-blue-900/80 border-dark-blue-800/50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-white flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-blue-300" />
            Registro de Cuotas
          </CardTitle>
          <InstallmentForm onSaved={refreshInstallments}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              Nueva Cuota
            </Button>
          </InstallmentForm>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoadingOverlay isVisible={isGenerating} message="Procesando..." />

        <SearchFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dateRange={dateRange}
          onDateRangeChange={(range) => {
            handleDateRangeChange(range)
            if (range === undefined || (range.from && range.to)) {
              fetchInstallments(range)
            }
          }}
          paymentFilter={paymentFilter}
          onPaymentFilterChange={setPaymentFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onResetFilters={resetFilters}
          onRefresh={() => fetchInstallments(dateRange)}
          hasActiveFilters={hasActiveFilters}
        />

        <DateRangeSummary dateRange={dateRange} />

        <div className="rounded-lg border border-dark-blue-800/50 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <Table>
              <InstallmentTableHeader sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => <LoadingRow key={index} />)
                ) : filteredInstallments.length === 0 ? (
                  <EmptyState />
                ) : (
                  paginatedInstallments.map((installment) => (
                    <InstallmentRow
                      key={installment.id}
                      installment={installment}
                      onViewAttachment={handleViewAttachment}
                      onSendWhatsapp={handleSendWhatsapp}
                      onPrint={handlePrint}
                      onEdit={() => {
                        handleEdit(installment)
                        setEditingInstallment(installment)
                      }}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {!loading && filteredInstallments.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredInstallments.length}
            visibleItems={paginatedInstallments.length}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
          />
        )}

        <FilterSummary
          dateRange={dateRange}
          paymentFilter={paymentFilter}
          statusFilter={statusFilter}
          totalFiltered={filteredInstallments.length}
          totalItems={installments.length}
        />
      </CardContent>

      {/* Dialogs */}
      <AttachmentDialog
        isOpen={isAttachmentDialogOpen}
        onOpenChange={setIsAttachmentDialogOpen}
        attachmentUrl={selectedAttachmentUrl}
      />

      <SuccessDialog isOpen={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen} message={successMessage} />

      <DeleteDialog
        installment={deleteConfirmation}
        isOpen={!!deleteConfirmation}
        onOpenChange={(open) => !open && setDeleteConfirmation(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />

      {/* Edit Form */}
      <InstallmentForm
        installment={editingInstallment}
        onSaved={() => {
          refreshInstallments()
          setEditingInstallment(null)
        }}
      >
        <button id="edit-form-trigger" className="hidden">
          Editar
        </button>
      </InstallmentForm>
    </Card>
  )
}
