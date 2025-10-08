"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  DollarSign, 
  Phone, 
  User, 
  Car,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  FileSpreadsheet,
  FileText,
  Download,
  Loader2,
} from "lucide-react"
import type { MissingInstallmentData } from "@/lib/services/reports.service"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MissingInstallmentsReportTableProps {
  data: MissingInstallmentData[]
  onExport?: (format: "excel" | "pdf" | "csv") => void
}

type SortField = "userName" | "daysSinceLastPayment" | "missedInstallments" | "totalMissedAmount"
type SortDirection = "asc" | "desc"

export function MissingInstallmentsReportTable({ data, onExport }: MissingInstallmentsReportTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [sortField, setSortField] = useState<SortField>("daysSinceLastPayment")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sin pagos"
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getDaysBadgeVariant = (days: number): "destructive" | "default" | "secondary" => {
    if (days > 60) return "destructive"
    if (days > 30) return "default"
    return "secondary"
  }

  const getDaysColor = (days: number) => {
    if (days > 60) return "text-red-600"
    if (days > 30) return "text-amber-600"
    return "text-blue-600"
  }

  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "secondary" => {
    switch (status) {
      case "ACTIVE":
        return "default"
      case "DEFAULTED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getPaymentFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      DAILY: "Diario",
      WEEKLY: "Semanal",
      BIWEEKLY: "Quincenal",
      MONTHLY: "Mensual",
    }
    return labels[frequency] || frequency
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Sort and paginate data
  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      let aValue: number | string = 0
      let bValue: number | string = 0

      switch (sortField) {
        case "userName":
          aValue = a.userName.toLowerCase()
          bValue = b.userName.toLowerCase()
          break
        case "daysSinceLastPayment":
          aValue = a.daysSinceLastPayment
          bValue = b.daysSinceLastPayment
          break
        case "missedInstallments":
          aValue = a.missedInstallments
          bValue = b.missedInstallments
          break
        case "totalMissedAmount":
          aValue = a.totalMissedAmount
          bValue = b.totalMissedAmount
          break
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return sorted
  }, [data, sortField, sortDirection])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = sortedData.slice(startIndex, endIndex)

  // Reset to page 1 if current page exceeds total pages (can happen when itemsPerPage changes)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  const goToFirstPage = () => setCurrentPage(1)
  const goToLastPage = () => setCurrentPage(totalPages)
  const goToNextPage = () => setCurrentPage(Math.min(currentPage + 1, totalPages))
  const goToPrevPage = () => setCurrentPage(Math.max(currentPage - 1, 1))

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  )

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Clientes con Cuotas Pendientes
            </CardTitle>
            <CardDescription className="mt-1">
              {sortedData.length} {sortedData.length === 1 ? "cliente" : "clientes"} con pagos atrasados
            </CardDescription>
          </div>
          
          {/* Export Buttons */}
          {onExport && data.length > 0 && (
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onExport("excel")}
                      className="h-8 px-3"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-1.5 text-green-600" />
                      Excel
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exportar a Excel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onExport("pdf")}
                      className="h-8 px-3"
                    >
                      <FileText className="h-4 w-4 mr-1.5 text-red-600" />
                      PDF
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exportar a PDF</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onExport("csv")}
                      className="h-8 px-3"
                    >
                      <Download className="h-4 w-4 mr-1.5 text-blue-600" />
                      CSV
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exportar a CSV</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent ref={tableContainerRef} className="flex-1 overflow-hidden p-0 flex flex-col">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4 mb-4">
              <AlertTriangle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">¡Excelente!</h3>
            <p className="text-sm">No hay clientes con cuotas pendientes</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur-sm z-10">
                  <TableRow>
                    <TableHead className="w-[200px]">
                      <SortButton field="userName">Cliente</SortButton>
                    </TableHead>
                    <TableHead className="w-[130px]">Contacto</TableHead>
                    <TableHead className="w-[180px]">Vehículo</TableHead>
                    <TableHead className="w-[120px]">Último Pago</TableHead>
                    <TableHead className="w-[100px]">
                      <SortButton field="daysSinceLastPayment">Días</SortButton>
                    </TableHead>
                    <TableHead className="w-[120px]">
                      <SortButton field="missedInstallments">Cuotas</SortButton>
                    </TableHead>
                    <TableHead className="w-[140px]">
                      <SortButton field="totalMissedAmount">Monto</SortButton>
                    </TableHead>
                    <TableHead className="w-[100px]">Frecuencia</TableHead>
                    <TableHead className="w-[120px]">Progreso</TableHead>
                    <TableHead className="w-[100px]">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((item, index) => {
                    const progress = item.totalInstallments > 0 
                      ? Math.round((item.paidInstallments / item.totalInstallments) * 100)
                      : 0

                    const isEven = index % 2 === 0

                    return (
                      <TableRow 
                        key={item.loanId} 
                        className={`hover:bg-muted/50 transition-colors ${isEven ? "bg-muted/20" : ""}`}
                      >
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                              <User className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm">{item.userName}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                #{item.contractNumber || "N/A"}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {item.userDocument}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{item.userPhone}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-1.5 mt-0.5">
                              <Car className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">{item.vehicle}</div>
                              <Badge variant="outline" className="text-[10px] mt-1">
                                {item.plate}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-xs">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>{formatDate(item.lastPaymentDate)}</span>
                            </div>
                            {item.lastPaymentWasLate && (
                              <Badge variant="destructive" className="text-[10px] w-fit">
                                Atrasado
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge 
                            variant={getDaysBadgeVariant(item.daysSinceLastPayment)}
                            className="font-semibold"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {item.daysSinceLastPayment}d
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                            </div>
                            <span className="text-sm font-bold text-red-600">
                              {item.missedInstallments}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="h-3.5 w-3.5 text-red-600" />
                              <span className="text-sm font-bold text-red-600">
                                {formatCurrency(item.totalMissedAmount)}
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {formatCurrency(item.installmentAmount)} + {formatCurrency(item.gpsAmount)}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {getPaymentFrequencyLabel(item.paymentFrequency)}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium">{progress}%</span>
                              <span className="text-muted-foreground">
                                {item.paidInstallments}/{item.totalInstallments}
                              </span>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(item.loanStatus)} className="text-xs">
                            {item.loanStatus === "ACTIVE" ? "Activo" : "Mora"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="border-t bg-muted/30 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> a{" "}
                  <span className="font-medium">{Math.min(endIndex, sortedData.length)}</span> de{" "}
                  <span className="font-medium">{sortedData.length}</span> registros
                  <span className="text-xs ml-2 opacity-70">
                    ({itemsPerPage} por página)
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">
                      Página {currentPage} de {totalPages}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
