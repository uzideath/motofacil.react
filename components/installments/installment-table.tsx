"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import { HttpService } from "@/lib/http"
import {
  Search,
  Printer,
  Calendar,
  CreditCard,
  Banknote,
  RefreshCw,
  User,
  BikeIcon as Motorcycle,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowDownUp,
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  BikeIcon,
  BadgeCent,
  Eye,
  PlusCircle,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import { formatDate as formatDateCustom } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InstallmentForm } from "./installment-form"

type Installment = {
  id: string
  loanId: string
  userName: string
  motorcycleModel: string
  amount: number
  gps: number
  paymentDate?: string
  date: string
  isLate: boolean
  latePaymentDate?: string
  paymentMethod: "CASH" | "CARD" | "TRANSACTION"
  loan: {
    contractNumber: string
    user: {
      phone: string
    }
  }
  motorcycle: {
    plate: string
  }
  createdBy?: {
    id: string
    name: string
    username: string
  }
  attachmentUrl?: string
}

type SortField = "userName" | "motorcycleModel" | "amount" | "date" | null
type SortDirection = "asc" | "desc"

export function InstallmentTable({ onRefresh }: { onRefresh?: (refreshFn: () => void) => void }) {
  const [installments, setInstallments] = useState<Installment[]>([])
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [paymentFilter, setPaymentFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAttachmentUrl, setSelectedAttachmentUrl] = useState("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchInstallments = async () => {
    try {
      setLoading(true)

      // Construir la URL con los parámetros de fecha si existen
      let url = "/api/v1/installments"
      const params = new URLSearchParams()

      if (dateRange?.from) {
        params.append("startDate", dateRange.from.toISOString().split("T")[0])
      }
      if (dateRange?.to) {
        params.append("endDate", dateRange.to.toISOString().split("T")[0])
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const res = await HttpService.get(url)
      const rawData = res.data

      const mapped: Installment[] = rawData.map((item: any) => ({
        id: item.id,
        loanId: item.loanId,
        userName: item.loan?.user?.name ?? "Desconocido",
        motorcycleModel: item.loan?.motorcycle?.model ?? "Desconocido",
        amount: item.amount,
        gps: item.gps,
        date: item.paymentDate,
        isLate: item.isLate,
        latePaymentDate: item.latePaymentDate,
        paymentMethod: item.paymentMethod ?? "CASH",
        createdBy: item.createdBy ?? null,
        attachmentUrl: item.attachmentUrl ?? null,
        loan: item.loan,
        motorcycle: item.loan?.motorcycle,
      }))

      setInstallments(mapped)
    } catch (error) {
      console.error("Error al obtener cuotas:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron obtener las cuotas del servidor",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    // Refrescar los datos cuando cambia el rango de fechas
    if (range === undefined || (range.from && range.to)) {
      setCurrentPage(1) // Resetear a la primera página
      fetchInstallments()
    }
  }

  const handlePrint = async (installment: Installment) => {
    setIsGenerating(true)
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
          total: installment.amount,
          date: installment.date,
          receiptNumber: installment.id,
        },
        {
          responseType: "blob",
        },
      )

      const blob = new Blob([res.data], { type: "application/pdf" })
      const fileURL = URL.createObjectURL(blob)
      const printWindow = window.open(fileURL)

      if (!printWindow) throw new Error("No se pudo abrir la ventana.")

      printWindow.addEventListener("load", () => {
        printWindow.focus()
        printWindow.print()
      })

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
        description: "No se pudo generar o imprimir el recibo",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendWhatsapp = async (installment: Installment) => {
    try {
      // Get the phone number from the installment data
      const phoneNumber = `+57${installment.loan?.user?.phone}`

      if (!phoneNumber) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se encontró un número de teléfono para este cliente",
        })
        return
      }

      setIsGenerating(true)

      // Prepare the receipt data
      const receiptData = {
        phoneNumber,
        name: installment.userName,
        identification: installment.motorcycle.plate,
        concept: `Monto`,
        amount: installment.amount,
        latePaymentDate: installment.latePaymentDate,
        gps: installment.gps,
        total: installment.amount,
        date: installment.date,
        receiptNumber: installment.id,
        caption: `Recibo de pago - ${installment.userName}`,
      }

      // Send the request to the whatsapp endpoint
      const res = await HttpService.post("/api/v1/receipt/whatsapp", receiptData)

      toast({
        title: "Recibo enviado",
        description: "El recibo se ha enviado por WhatsApp correctamente",
        variant: "default",
      })
    } catch (error) {
      console.error("Error al enviar el recibo por WhatsApp:", error)
      toast({
        variant: "destructive",
        title: "Error al enviar",
        description: "No se pudo enviar el recibo por WhatsApp",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    fetchInstallments()
  }, [refreshTrigger])

  useEffect(() => {
    if (onRefresh) {
      onRefresh(refreshTable)
    }
  }, [onRefresh])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowDownUp className="ml-1 h-4 w-4 text-blue-300/50" />
    return sortDirection === "asc" ? (
      <ArrowDownUp className="ml-1 h-4 w-4 text-blue-300" />
    ) : (
      <ArrowDownUp className="ml-1 h-4 w-4 text-blue-300 rotate-180" />
    )
  }

  const resetFilters = () => {
    setSearchTerm("")
    setSortField(null)
    setSortDirection("asc")
    setPaymentFilter(null)
    setStatusFilter(null)
    setDateRange(undefined)
    setCurrentPage(1)
    fetchInstallments()
  }

  const filteredInstallments = installments
    .filter(
      (i) =>
        (i.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.motorcycleModel.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (paymentFilter === null || i.paymentMethod === paymentFilter) &&
        (statusFilter === null || i.isLate === statusFilter),
    )
    .sort((a, b) => {
      if (!sortField) return 0

      if (sortField === "amount") {
        return sortDirection === "asc" ? a.amount - b.amount : b.amount - a.amount
      }

      if (sortField === "date") {
        return sortDirection === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      }

      const aValue = a[sortField].toLowerCase()
      const bValue = b[sortField].toLowerCase()

      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "CASH":
        return <Banknote className="mr-2 h-4 w-4 text-green-400" />
      case "CARD":
        return <CreditCard className="mr-2 h-4 w-4 text-blue-400" />
      case "TRANSACTION":
        return <FileText className="mr-2 h-4 w-4 text-purple-400" />
      default:
        return null
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "CASH":
        return "Efectivo"
      case "CARD":
        return "Tarjeta"
      case "TRANSACTION":
        return "Transferencia"
      default:
        return "Desconocido"
    }
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const totalPages = Math.ceil(filteredInstallments.length / itemsPerPage)
  const paginatedInstallments = filteredInstallments.slice(indexOfFirstItem, indexOfLastItem)

  const handleViewAttachment = (installment: Installment) => {
    // Extract the attachment URL from the request
    // This is a placeholder - you'll need to adjust this based on your actual data structure
    const attachmentUrl = installment.attachmentUrl || ""
    if (attachmentUrl) {
      setSelectedAttachmentUrl(attachmentUrl)
      setIsDialogOpen(true)
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No hay comprobante adjunto para esta cuota",
      })
    }
  }

  const refreshTable = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <Card className="bg-dark-blue-900/80 border-dark-blue-800/50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-white flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-blue-300" />
            Registro de Cuotas
          </CardTitle>
          <InstallmentForm onSaved={refreshTable}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              Nueva Cuota
            </Button>
          </InstallmentForm>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isGenerating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-dark-blue-900 p-8 rounded-lg shadow-xl text-center text-white border border-blue-500/30">
              <div className="mb-4">
                <RefreshCw className="animate-spin h-8 w-8 mx-auto text-blue-400" />
              </div>
              <p className="text-blue-100 text-lg font-medium">Generando recibo...</p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300" />
            <Input
              type="search"
              placeholder="Buscar por cliente o modelo..."
              className="pl-10 pr-4 py-2 bg-dark-blue-800/50 border-dark-blue-700/50 text-white placeholder:text-blue-300/70 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <DateRangePicker onRangeChange={handleDateRangeChange} className="w-full sm:w-[280px]" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-dark-blue-800/50 border-dark-blue-700/50 text-blue-300 hover:bg-dark-blue-700/70"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Método de Pago
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-dark-blue-800 border-dark-blue-700 text-white">
                <DropdownMenuItem onClick={() => setPaymentFilter(null)} className="focus:bg-dark-blue-700">
                  Todos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPaymentFilter("CASH")} className="focus:bg-dark-blue-700">
                  <Banknote className="mr-2 h-4 w-4 text-green-400" />
                  Efectivo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPaymentFilter("CARD")} className="focus:bg-dark-blue-700">
                  <CreditCard className="mr-2 h-4 w-4 text-blue-400" />
                  Tarjeta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPaymentFilter("TRANSACTION")} className="focus:bg-dark-blue-700">
                  <FileText className="mr-2 h-4 w-4 text-purple-400" />
                  Transferencia
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-dark-blue-800/50 border-dark-blue-700/50 text-blue-300 hover:bg-dark-blue-700/70"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Estado
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-dark-blue-800 border-dark-blue-700 text-white">
                <DropdownMenuItem onClick={() => setStatusFilter(null)} className="focus:bg-dark-blue-700">
                  Todos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(false)} className="focus:bg-dark-blue-700">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-400" />A tiempo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(true)} className="focus:bg-dark-blue-700">
                  <AlertTriangle className="mr-2 h-4 w-4 text-red-400" />
                  Atrasada
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {(searchTerm || paymentFilter !== null || statusFilter !== null || sortField || dateRange) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-blue-300 hover:text-white hover:bg-dark-blue-700/50"
              >
                Limpiar filtros
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={fetchInstallments}
              className="bg-dark-blue-800/50 border-dark-blue-700/50 text-blue-300 hover:bg-dark-blue-700/70"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Resumen de período seleccionado */}
        {dateRange?.from && dateRange?.to && (
          <div className="bg-dark-blue-800/50 border border-dark-blue-700/50 rounded-lg p-3 flex items-center gap-3">
            <div className="bg-dark-blue-700/50 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-blue-300/70">Período seleccionado</p>
              <p className="text-blue-100">
                {formatDateCustom(dateRange.from, "dd MMM")} - {formatDateCustom(dateRange.to, "dd MMM yyyy")}
              </p>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-dark-blue-800/50 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-dark-blue-800/70 sticky top-0">
                <TableRow className="border-dark-blue-700 hover:bg-dark-blue-700/50">
                  <TableHead
                    className="text-blue-200 font-medium cursor-pointer"
                    onClick={() => handleSort("userName")}
                  >
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-blue-300/70" />
                      Cliente
                      {getSortIcon("userName")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="hidden md:table-cell text-blue-200 font-medium cursor-pointer"
                    onClick={() => handleSort("motorcycleModel")}
                  >
                    <div className="flex items-center">
                      <Motorcycle className="mr-2 h-4 w-4 text-blue-300/70" />
                      Motocicleta
                      {getSortIcon("motorcycleModel")}
                    </div>
                  </TableHead>
                  <TableHead className="text-blue-200 font-medium cursor-pointer" onClick={() => handleSort("amount")}>
                    <div className="flex items-center">
                      <DollarSign className="mr-2 h-4 w-4 text-blue-300/70" />
                      Monto
                      {getSortIcon("amount")}
                    </div>
                  </TableHead>
                  <TableHead className="text-blue-200 font-medium">
                    <div className="flex items-center">
                      <BikeIcon className="mr-2 h-4 w-4 text-blue-300/70" />
                      GPS
                    </div>
                  </TableHead>
                  <TableHead
                    className="hidden md:table-cell text-blue-200 font-medium cursor-pointer"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-blue-300/70" />
                      Fecha
                      {getSortIcon("date")}
                    </div>
                  </TableHead>
                  <TableHead className="text-blue-200 font-medium">
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4 text-blue-300/70" />
                      Método
                    </div>
                  </TableHead>
                  <TableHead className="text-blue-200 font-medium text-center">
                    <div className="flex items-center justify-center">
                      <Clock className="mr-2 h-4 w-4 text-blue-300/70" />
                      Estado
                    </div>
                  </TableHead>
                  <TableHead className="text-blue-200 font-medium">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-blue-300/70" />
                      Registrado por
                    </div>
                  </TableHead>
                  <TableHead className="text-blue-200 font-medium text-right">
                    <div className="flex items-center justify-end">
                      <FileText className="mr-2 h-4 w-4 text-blue-300/70" />
                      Acciones
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={index} className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
                      <TableCell>
                        <Skeleton className="h-6 w-[150px] bg-dark-blue-800/50" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-6 w-[120px] bg-dark-blue-800/50" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[100px] bg-dark-blue-800/50" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[100px] bg-dark-blue-800/50" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-6 w-[100px] bg-dark-blue-800/50" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[100px] bg-dark-blue-800/50" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[80px] bg-dark-blue-800/50" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[80px] bg-dark-blue-800/50" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[50px] bg-dark-blue-800/50" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredInstallments.length === 0 ? (
                  <TableRow className="border-dark-blue-800/30">
                    <TableCell colSpan={9} className="text-center py-8 text-blue-200/70">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="h-8 w-8 mb-2 text-blue-300/50" />
                        <p className="text-lg">No se encontraron cuotas</p>
                        <p className="text-sm text-blue-300/50">Intenta con otros criterios de búsqueda</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedInstallments.map((i) => (
                    <TableRow
                      key={i.id}
                      className="border-dark-blue-800/30 hover:bg-dark-blue-800/30 transition-colors duration-150"
                    >
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4 text-blue-300/70" />
                          {i.userName}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-blue-200">
                        <div className="flex items-center">
                          <Motorcycle className="mr-2 h-4 w-4 text-blue-300/70" />
                          {i.motorcycleModel}
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-200 font-medium">
                        <div className="flex items-center">
                          <DollarSign className="mr-1 h-4 w-4 text-green-400" />
                          {formatCurrency(i.amount)}
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-200 font-medium">
                        <div className="flex items-center">
                          <BadgeCent className="mr-1 h-4 w-4 text-yellow-400" />
                          {formatCurrency(i.gps)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-blue-200">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-blue-300/70" />
                          {formatDate(i.date)}
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-200">
                        <div className="flex items-center whitespace-nowrap">
                          {getPaymentMethodIcon(i.paymentMethod)}
                          {getPaymentMethodLabel(i.paymentMethod)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {i.isLate ? (
                          <Badge
                            variant="destructive"
                            className="bg-red-500/80 hover:bg-red-500/70 inline-flex items-center justify-center gap-1 px-2.5 py-0.5 text-xs font-medium"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            <span>Atrasada</span>
                          </Badge>
                        ) : (
                          <Badge
                            variant="default"
                            className="bg-green-500/80 hover:bg-green-500/70 inline-flex items-center justify-center gap-1 px-2.5 py-0.5 text-xs font-medium"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            <span>A tiempo</span>
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-blue-200">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4 text-blue-400" />
                          {i.createdBy?.name ?? "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {i.attachmentUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewAttachment(i)}
                              title="Ver comprobante"
                              className="text-blue-300 hover:text-white hover:bg-dark-blue-700/50"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver comprobante</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendWhatsapp(i)}
                            title="Enviar por WhatsApp"
                            className="text-blue-300 hover:text-white hover:bg-dark-blue-700/50"
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span className="sr-only">Enviar por WhatsApp</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrint(i)}
                            title="Imprimir recibo"
                            className="text-blue-300 hover:text-white hover:bg-dark-blue-700/50"
                          >
                            <Printer className="h-4 w-4" />
                            <span className="sr-only">Imprimir recibo</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {!loading && filteredInstallments.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 text-blue-300/70">
            <div className="flex items-center gap-2">
              <span className="text-sm">Filas por página:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[80px] h-8 bg-dark-blue-800/50 border-dark-blue-700/50 text-blue-300">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent className="bg-dark-blue-800 border-dark-blue-700 text-white">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-center text-sm">
              <p>
                Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredInstallments.length)} de{" "}
                {filteredInstallments.length} cuotas
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-dark-blue-800/50 border-dark-blue-700/50 text-blue-300 hover:bg-dark-blue-700/70 disabled:opacity-50"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                title="Primera página"
              >
                <ChevronsLeft className="h-4 w-4" />
                <span className="sr-only">Primera página</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-dark-blue-800/50 border-dark-blue-700/50 text-blue-300 hover:bg-dark-blue-700/70 disabled:opacity-50"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                title="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Página anterior</span>
              </Button>

              <div className="flex items-center mx-2">
                <span className="text-sm font-medium">
                  Página {currentPage} de {totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-dark-blue-800/50 border-dark-blue-700/50 text-blue-300 hover:bg-dark-blue-700/70 disabled:opacity-50"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                title="Página siguiente"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Página siguiente</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-dark-blue-800/50 border-dark-blue-700/50 text-blue-300 hover:bg-dark-blue-700/70 disabled:opacity-50"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                title="Última página"
              >
                <ChevronsRight className="h-4 w-4" />
                <span className="sr-only">Última página</span>
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center text-sm text-blue-300/70 pt-2">
          <div>
            {!loading && filteredInstallments.length > 0 && (
              <p>
                Mostrando {filteredInstallments.length} de {installments.length} cuotas
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {dateRange?.from && dateRange?.to && (
              <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                <Calendar className="mr-1 h-3 w-3 text-blue-400" />
                {formatDateCustom(dateRange.from, "dd/MM/yyyy")} - {formatDateCustom(dateRange.to, "dd/MM/yyyy")}
              </Badge>
            )}
            {paymentFilter && (
              <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                {getPaymentMethodIcon(paymentFilter)}
                {getPaymentMethodLabel(paymentFilter)}
              </Badge>
            )}
            {statusFilter !== null && (
              <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                {statusFilter ? (
                  <>
                    <AlertTriangle className="mr-1 h-3 w-3 text-red-400" /> Atrasadas
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-1 h-3 w-3 text-green-400" /> A tiempo
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      {/* Attachment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-dark-blue-900 border-dark-blue-800 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-blue-100">Comprobante de pago</DialogTitle>
          </DialogHeader>
          {selectedAttachmentUrl && (
            <div className="flex justify-center p-2">
              <img
                src={selectedAttachmentUrl || "/placeholder.svg"}
                alt="Comprobante de pago"
                className="max-h-[70vh] object-contain rounded-md border border-dark-blue-700"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
