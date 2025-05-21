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
import { LoadingOverlay } from "./components/loading-overlay"
import { useState } from "react"
import { useInstallments } from "./hooks/useInstallments"
import { useInstallmentActions } from "./hooks/useInstallmentActions"
import { InstallmentForm } from "./components/forms/installment-form"
import { useTableState } from "./hooks/useTableState"
import { DateRangeSummary } from "./components/date-range"
import { FilterSummary } from "./components/filter"
import { AttachmentDialog } from "./components/dialogs/attachment"
import { SuccessDialog } from "./components/dialogs/success"
import { DeleteDialog } from "./components/dialogs/delete"
import type { Installment } from "./utils/types"
import { PdfViewerDialog } from "./components/dialogs/pdf"
import { HttpService } from "@/lib/http"
import { useToast } from "../ui/use-toast"
import { usePdfViewer } from "./hooks/usePDFViewer"

export function InstallmentTable({ onRefresh }: { onRefresh?: (refreshFn: () => void) => void }) {
  const { installments, loading, fetchInstallments, refreshInstallments } = useInstallments(onRefresh)
  const { toast } = useToast()
  const { pdfUrl, isPdfViewerOpen, openPdfViewer, setPdfViewerOpen } = usePdfViewer()

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

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

  // Enhanced print handler that uses the PDF viewer
  const handlePrint = async (installment: Installment) => {
    setIsGeneratingPdf(true)
    try {
      const res = await HttpService.post(
        "/api/v1/receipt",
        {
          name: installment.userName,
          identification: installment.motorcycle.plate,
          concept: `Monto`,
          amount: installment.amount,
          latePaymentDate: installment.latePaymentDate,
          gps: installment.gps,
          total: installment.amount + (installment.gps || 0),
          date: installment.date,
          receiptNumber: installment.id,
        },
        {
          responseType: "blob",
          headers: {
            Accept: "application/pdf",
          },
        },
      )

      // Create a blob from the PDF Stream with explicit PDF MIME type
      // Even if the server doesn't set the correct content type, we'll force it here
      const blob = new Blob([res.data], { type: "application/pdf" })

      // Create a URL for the blob
      const fileURL = URL.createObjectURL(blob)

      // Open the PDF in our viewer
      openPdfViewer(fileURL)

      toast({
        title: "Recibo generado",
        description: "El recibo se ha generado correctamente",
        variant: "default",
      })
    } catch (error) {
      console.error("Error al imprimir el recibo:", error)
      toast({
        variant: "destructive",
        title: "Error al imprimir",
        description: "No se pudo generar o imprimir el recibo. Verifique la conexión con el servidor.",
      })
    } finally {
      setIsGeneratingPdf(false)
    }
  }

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
        <LoadingOverlay
          isVisible={isGenerating || isGeneratingPdf}
          message={isGeneratingPdf ? "Generando recibo..." : "Procesando..."}
        />

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

      {/* PDF Viewer Dialog */}
      <PdfViewerDialog isOpen={isPdfViewerOpen} onOpenChange={setPdfViewerOpen} pdfUrl={pdfUrl} />

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
