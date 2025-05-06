"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Edit,
  Trash2,
  Search,
  Eye,
  CreditCard,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { LoanForm } from "./loan-form"
import { LoanDetails } from "./loan-details"
import { InstallmentForm } from "../installments/installment-form"
import { Skeleton } from "@/components/ui/skeleton"
import { HttpService } from "@/lib/http"

export type Loan = {
  id: string
  userName: string
  motorcycleModel: string
  totalAmount: number
  installments: number
  paidInstallments: number
  remainingInstallments: number
  totalPaid: number
  debtRemaining: number
  status: "ACTIVE" | "COMPLETED" | "DEFAULTED"
}

export function LoanTable() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const fetchLoans = async () => {
    try {
      setLoading(true)
      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("authToken="))
        ?.split("=")[1]

      const response = await HttpService.get<Loan[]>("/api/v1/loans", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      setLoans(response.data)
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
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro que desea eliminar este préstamo?")) {
      try {
        const token = document.cookie
          .split("; ")
          .find((c) => c.startsWith("authToken="))
          ?.split("=")[1]

        await HttpService.delete(`/api/v1/loans/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        })

        setLoans((prev) => prev.filter((loan) => loan.id !== id))

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
      }
    }
  }

  const filteredLoans = loans.filter(
    (loan) =>
      loan.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.motorcycleModel.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-blue-500/80 hover:bg-blue-500/70 text-white">Activo</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-500/80 hover:bg-green-500/70 text-white">Completado</Badge>
      case "DEFAULTED":
        return <Badge className="bg-red-500/80 hover:bg-red-500/70 text-white">Incumplido</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-300/70" />
          <Input
            type="search"
            placeholder="Buscar por cliente o modelo..."
            className="pl-8 glass-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-table border border-dark-blue-800/30">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
                <TableHead className="text-blue-200">Cliente</TableHead>
                <TableHead className="hidden md:table-cell text-blue-200">Motocicleta</TableHead>
                <TableHead className="hidden md:table-cell text-blue-200">Monto Total</TableHead>
                <TableHead className="hidden lg:table-cell text-blue-200">Cuotas Pagadas</TableHead>
                <TableHead className="hidden lg:table-cell text-blue-200">Deuda Restante</TableHead>
                <TableHead className="text-blue-200">Estado</TableHead>
                <TableHead className="text-right text-blue-200">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index} className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
                    <TableCell>
                      <Skeleton className="h-5 w-[150px] bg-dark-blue-800/50" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-5 w-[120px] bg-dark-blue-800/50" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-5 w-[100px] bg-dark-blue-800/50" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-5 w-[80px] bg-dark-blue-800/50" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-5 w-[100px] bg-dark-blue-800/50" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[80px] bg-dark-blue-800/50" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-md bg-dark-blue-800/50" />
                        <Skeleton className="h-8 w-8 rounded-md bg-dark-blue-800/50" />
                        <Skeleton className="h-8 w-8 rounded-md bg-dark-blue-800/50" />
                        <Skeleton className="h-8 w-8 rounded-md bg-dark-blue-800/50" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredLoans.length === 0 ? (
                <TableRow className="border-dark-blue-800/30">
                  <TableCell colSpan={7} className="text-center text-blue-200/70">
                    No se encontraron préstamos
                  </TableCell>
                </TableRow>
              ) : (
                filteredLoans.map((loan) => (
                  <TableRow key={loan.id} className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
                    <TableCell className="font-medium text-white">{loan.userName}</TableCell>
                    <TableCell className="hidden md:table-cell text-blue-200">{loan.motorcycleModel}</TableCell>
                    <TableCell className="hidden md:table-cell text-blue-200">
                      {formatCurrency(loan.totalAmount)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-blue-200">
                      {loan.paidInstallments} / {loan.installments}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-blue-200">
                      {formatCurrency(loan.debtRemaining)}
                    </TableCell>
                    <TableCell>{getStatusBadge(loan.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <LoanDetails loanId={loan.id} loanData={loan}>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-dark-blue-700 bg-dark-blue-800/30 text-blue-300 hover:bg-dark-blue-700/50 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver</span>
                          </Button>
                        </LoanDetails>
                        <InstallmentForm loanId={loan.id}>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-dark-blue-700 bg-dark-blue-800/30 text-blue-300 hover:bg-dark-blue-700/50 hover:text-white"
                          >
                            <CreditCard className="h-4 w-4" />
                            <span className="sr-only">Pagar</span>
                          </Button>
                        </InstallmentForm>
                        <LoanForm loanId={loan.id} loanData={loan}>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-dark-blue-700 bg-dark-blue-800/30 text-blue-300 hover:bg-dark-blue-700/50 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                        </LoanForm>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(loan.id)}
                          className="border-dark-blue-700 bg-dark-blue-800/30 text-blue-300 hover:bg-dark-blue-700/50 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
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
    </div>
  )
}
