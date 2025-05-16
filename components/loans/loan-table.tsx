"use client"

import { TableHeader } from "@/components/ui/table"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Edit,
  Trash2,
  Search,
  Eye,
  CreditCard,
  Printer,
  Plus,
  RefreshCw,
  MoreHorizontal,
  FileSpreadsheet,
  DollarSign,
  Calendar,
  User,
  Bike,
  CalendarDays,
  Wallet,
  Activity,
  Settings,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarIcon,
  Hash,
  Tag,
  Percent,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency, cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { LoanForm } from "./loan-form"
import { LoanDetails } from "./loan-details"
import { InstallmentForm } from "../installments/installment-form"
import { Skeleton } from "@/components/ui/skeleton"
import { HttpService } from "@/lib/http"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export type Loan = {
  id: string
  userId: string
  motorcycleId: string
  totalAmount: number
  downPayment: number
  installments: number
  paidInstallments: number
  remainingInstallments: number
  totalPaid: number
  debtRemaining: number
  interestRate: number
  interestType: "FIXED" | "COMPOUND"
  paymentFrequency: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY"
  installmentPaymentAmmount: number
  gpsInstallmentPayment: number
  startDate: string
  endDate: string | null
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "DEFAULTED"

  user: {
    id: string
    name: string
    identification: string
    idIssuedAt: string
    age: number
    phone: string
    address: string
    city: string
    refName: string
    refID: string
    refPhone: string
    createdAt: string
  }

  motorcycle: {
    id: string
    brand: string
    model: string
    plate: string
    engine: string;
    chassis: string;
    color: string
    cc: number
    gps: number
  }

  payments: {
    id: string
    loanId: string
    paymentMethod: "CASH" | "CARD" | "TRANSACTION"
    amount: number
    gps: number
    paymentDate: string
    isLate: boolean
    cashRegisterId: string
  }[]
}

export function LoanTable() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [refreshKey, setRefreshKey] = useState(0)
  const [printingContract, setPrintingContract] = useState(false)
  const [printProgress, setPrintProgress] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [loanToDelete, setLoanToDelete] = useState<string | null>(null)

  const fetchLoans = async () => {
    try {
      setLoading(true)

      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("authToken="))
        ?.split("=")[1]

      const response = await HttpService.get<any[]>("/api/v1/loans", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      const mappedLoans: Loan[] = response.data.map((loan) => ({
        ...loan,
        userName: loan.user?.name ?? "Sin nombre",
        motorcycleModel: loan.motorcycle?.model ?? "Sin modelo",
      }))

      setLoans(mappedLoans)
    } catch (error) {
      console.error("Error al obtener préstamos:", error)
      toast({
        variant: "destructive",
        title: "Error al cargar datos",
        description: "No se pudieron obtener los préstamos del servidor",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLoans()
  }, [refreshKey])

  const handleDelete = async (id: string) => {
    setLoanToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!loanToDelete) return

    try {
      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("authToken="))
        ?.split("=")[1]

      await HttpService.delete(`/api/v1/loans/${loanToDelete}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      setLoans((prev) => prev.filter((loan) => loan.id !== loanToDelete))

      toast({
        title: "Préstamo eliminado",
        description: "El préstamo ha sido eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar préstamo:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el préstamo",
      })
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const handlePrintContract = async (loan: Loan) => {
    try {
      setPrintingContract(true)
      setPrintProgress(10)

      // Simular progreso
      const progressInterval = setInterval(() => {
        setPrintProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      const res = await HttpService.post(
        "/api/v1/contract",
        {
          contractNumber: loan.id.slice(0, 6).toUpperCase(),
          legalRepresentative: "Andrés Felipe Correa Perdomo",
          representativeId: "10497576",
          customerName: loan.user.name,
          customerId: loan.user.identification,
          customerAddress: loan.user.address || "Dirección no disponible",
          customerCity: loan.user.city || "Ciudad no disponible",
          customerPhone: loan.user.phone || "Teléfono no disponible",
          plate: loan.motorcycle.plate || "Placa no disponible",
          brand: loan.motorcycle.brand || "Marca no disponible",
          engine: loan.motorcycle.engine, // Idealmente obtener del modelo de motocicleta
          model: loan.motorcycle.model || "Modelo no disponible",
          chassis: loan.motorcycle.chassis, // Idealmente obtener del modelo de motocicleta
          date: new Date().toISOString(),
        },
        {
          responseType: "blob",
        },
      )

      clearInterval(progressInterval)
      setPrintProgress(100)

      const blob = new Blob([res.data], { type: "application/pdf" })
      const fileURL = URL.createObjectURL(blob)
      const printWindow = window.open(fileURL)

      if (!printWindow) throw new Error("No se pudo abrir la ventana")

      printWindow.addEventListener("load", () => {
        printWindow.focus()
        printWindow.print()
      })

      toast({
        title: "Contrato generado",
        description: "El contrato se ha generado correctamente",
      })

      // Cerrar el diálogo después de un breve retraso
      setTimeout(() => {
        setPrintingContract(false)
        setPrintProgress(0)
      }, 1000)
    } catch (error) {
      console.error("Error al generar contrato:", error)
      toast({
        variant: "destructive",
        title: "Error al imprimir contrato",
        description: "No se pudo generar el contrato PDF",
      })
      setPrintingContract(false)
      setPrintProgress(0)
    }
  }

  const filteredLoans = loans.filter((loan) => {
    const userMatch = loan.user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const motoMatch = loan.motorcycle.model?.toLowerCase().includes(searchTerm.toLowerCase())
    const idMatch = loan.user.identification?.toLowerCase().includes(searchTerm.toLowerCase())
    return userMatch || motoMatch || idMatch
  })

  const totalItems = filteredLoans.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const currentItems = filteredLoans.slice(startIndex, endIndex)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 3) endPage = Math.min(totalPages - 1, 4)
      else if (currentPage >= totalPages - 2) startPage = Math.max(2, totalPages - 3)

      if (startPage > 2) pages.push("ellipsis-start")
      for (let i = startPage; i <= endPage; i++) pages.push(i)
      if (endPage < totalPages - 1) pages.push("ellipsis-end")
      pages.push(totalPages)
    }

    return pages
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Activo</span>
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Completado</span>
          </Badge>
        )
      case "DEFAULTED":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            <span>Incumplido</span>
          </Badge>
        )
      case "PENDING":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>Pendiente</span>
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentFrequencyText = (frequency: string) => {
    switch (frequency) {
      case "DAILY":
        return "Diario"
      case "WEEKLY":
        return "Semanal"
      case "BIWEEKLY":
        return "Quincenal"
      case "MONTHLY":
        return "Mensual"
      default:
        return frequency
    }
  }

  const refreshData = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const exportToCSV = () => {
    const headers = [
      "Cliente",
      "Identificación",
      "Motocicleta",
      "Monto Total",
      "Cuota Inicial",
      "Cuotas",
      "Cuotas Pagadas",
      "Deuda Restante",
      "Frecuencia",
      "Estado",
    ]

    const csvRows = [
      headers.join(","),
      ...filteredLoans.map((loan) =>
        [
          loan.user.name,
          loan.user.identification,
          loan.motorcycle.model,
          loan.totalAmount,
          loan.downPayment,
          loan.installments,
          loan.paidInstallments,
          loan.debtRemaining,
          getPaymentFrequencyText(loan.paymentFrequency),
          loan.status,
        ].join(","),
      ),
    ]

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "prestamos.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="bg-white dark:bg-gray-950 border border-blue-100 dark:border-blue-900/30 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-sky-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Gestión de Préstamos</CardTitle>
              <CardDescription className="text-blue-100">Administra los préstamos y financiamientos</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={refreshData}
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Actualizar datos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportToCSV}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar a CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  Ver calendario de pagos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-500/70" />
              <Input
                type="search"
                placeholder="Buscar por cliente, identificación o modelo..."
                className="pl-9 border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
              <LoanForm>
                <Button className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white shadow-sm hover:shadow-md transition-all">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Préstamo
                </Button>
              </LoanForm>
            </div>
          </div>

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
                        <span>Motocicleta</span>
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
                          <p className="text-sm">No se encontraron préstamos</p>
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
                      <TableRow
                        key={`loan-row-${loan.id}-${index}`}
                        className="border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      >
                        <TableCell>
                          <div className="font-medium flex items-center gap-1.5">
                            <User className="h-4 w-4 text-blue-500" />
                            {loan.user.name}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Hash className="h-3 w-3 text-gray-400" />
                            {loan.user.identification}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <Bike className="h-4 w-4 text-indigo-500" />
                            {loan.motorcycle.model}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Tag className="h-3 w-3 text-gray-400" />
                            {loan.motorcycle.plate}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-medium">
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <DollarSign className="h-4 w-4" />
                            {formatCurrency(loan.totalAmount)}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <CalendarIcon className="h-3 w-3 text-gray-400" />
                            {getPaymentFrequencyText(loan.paymentFrequency)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="text-sm flex items-center gap-1.5">
                              <CalendarDays className="h-4 w-4 text-purple-500" />
                              <span className="font-medium">
                                {loan.paidInstallments} / {loan.installments}
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1.5">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                loan.status === "COMPLETED"
                                  ? "bg-green-500"
                                  : loan.status === "DEFAULTED"
                                    ? "bg-red-500"
                                    : "bg-blue-500",
                              )}
                              style={{
                                width: `${(loan.paidInstallments / loan.installments) * 100}%`,
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell font-medium">
                          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                            <Wallet className="h-4 w-4" />
                            {formatCurrency(loan.debtRemaining)}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Percent className="h-3 w-3 text-gray-400" />
                            Interés: {loan.interestRate}%
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(loan.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div key={`view-wrapper-${loan.id}-${index}`}>
                                    <LoanDetails loanId={loan.id} loanData={loan}>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 dark:hover:text-blue-300"
                                      >
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">Ver</span>
                                      </Button>
                                    </LoanDetails>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Ver detalles</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div key={`pay-wrapper-${loan.id}-${index}`}>
                                    <InstallmentForm loanId={loan.id}>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="border-green-200 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 dark:hover:text-green-300"
                                      >
                                        <CreditCard className="h-4 w-4" />
                                        <span className="sr-only">Pagar</span>
                                      </Button>
                                    </InstallmentForm>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Registrar pago</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePrintContract(loan)}
                                    className="border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40 dark:hover:text-purple-300"
                                  >
                                    <Printer className="h-4 w-4" />
                                    <span className="sr-only">Generar contrato</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Generar contrato</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div key={`edit-wrapper-${loan.id}-${index}`}>
                                    <LoanForm loanId={loan.id} loanData={loan}>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 dark:hover:text-blue-300"
                                      >
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">Editar</span>
                                      </Button>
                                    </LoanForm>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Editar préstamo</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDelete(loan.id)}
                                    className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Eliminar</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Eliminar préstamo</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
              Mostrando {totalItems > 0 ? startIndex + 1 : 0}-{endIndex} de {totalItems} préstamos
            </div>

            <Pagination className="order-1 sm:order-2">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {getPageNumbers().map((page, i) =>
                  page === "ellipsis-start" || page === "ellipsis-end" ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={`page-${page}-${i}`}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(page as number)
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </CardContent>

      {/* Diálogo de carga para la generación del contrato */}
      <Dialog open={printingContract} onOpenChange={setPrintingContract}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5 text-blue-500" />
              Generando contrato
            </DialogTitle>
            <DialogDescription>Por favor espere mientras se genera el contrato PDF...</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Progress value={printProgress} className="w-full" />
            <p className="text-center mt-2 text-sm text-gray-500 flex items-center justify-center gap-1.5">
              {printProgress < 100 ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ¡Completado!
                </>
              )}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar eliminación
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea eliminar este préstamo? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
