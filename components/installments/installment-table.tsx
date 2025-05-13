"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { HttpService } from "@/lib/http"

type Installment = {
  id: string
  loanId: string
  userName: string
  motorcycleModel: string
  amount: number
  date: string
  isLate: boolean
  paymentMethod: "CASH" | "CARD" | "TRANSACTION"
}

export function InstallmentTable() {
  const [installments, setInstallments] = useState<Installment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const fetchInstallments = async () => {
    try {
      const res = await HttpService.get("/api/v1/installments")
      const rawData = res.data

      const mapped: Installment[] = rawData.map((item: any) => ({
        id: item.id,
        loanId: item.loanId,
        userName: item.loan?.user?.name ?? "Desconocido",
        motorcycleModel: item.loan?.motorcycle?.model ?? "Desconocido",
        amount: item.amount,
        date: item.paymentDate,
        isLate: item.isLate,
        paymentMethod: item.paymentMethod ?? "CASH",
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

  useEffect(() => {
    fetchInstallments()
  }, [])

  const filteredInstallments = installments.filter(
    (i) =>
      i.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.motorcycleModel.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                <TableHead className="text-blue-200">Monto</TableHead>
                <TableHead className="hidden md:table-cell text-blue-200">Fecha</TableHead>
                <TableHead className="text-blue-200">Método</TableHead>
                <TableHead className="text-blue-200">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index} className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
                    <TableCell><Skeleton className="h-5 w-[150px] bg-dark-blue-800/50" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-[120px] bg-dark-blue-800/50" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[100px] bg-dark-blue-800/50" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-[100px] bg-dark-blue-800/50" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[80px] bg-dark-blue-800/50" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[80px] bg-dark-blue-800/50" /></TableCell>
                  </TableRow>
                ))
              ) : filteredInstallments.length === 0 ? (
                <TableRow className="border-dark-blue-800/30">
                  <TableCell colSpan={6} className="text-center text-blue-200/70">
                    No se encontraron cuotas
                  </TableCell>
                </TableRow>
              ) : (
                filteredInstallments.map((i) => (
                  <TableRow key={i.id} className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
                    <TableCell className="font-medium text-white">{i.userName}</TableCell>
                    <TableCell className="hidden md:table-cell text-blue-200">{i.motorcycleModel}</TableCell>
                    <TableCell className="text-blue-200">{formatCurrency(i.amount)}</TableCell>
                    <TableCell className="hidden md:table-cell text-blue-200">{formatDate(i.date)}</TableCell>
                    <TableCell className="text-blue-200">
                      {{
                        CASH: "Efectivo",
                        CARD: "Tarjeta",
                        TRANSACTION: "Transferencia",
                      }[i.paymentMethod] ?? "Desconocido"}
                    </TableCell>

                    <TableCell>
                      {i.isLate ? (
                        <Badge variant="destructive" className="bg-red-500/80 hover:bg-red-500/70">
                          Atrasada
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-500/80 hover:bg-green-500/70">
                          A tiempo
                        </Badge>
                      )}
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
