"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type Installment = {
  id: string
  loanId: string
  userName: string
  motorcycleModel: string
  amount: number
  date: string
  isLate: boolean
}

export function InstallmentTable() {
  const [installments, setInstallments] = useState<Installment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // Simulación de carga de datos
    const timer = setTimeout(() => {
      setInstallments([
        {
          id: "1",
          loanId: "1",
          userName: "Carlos Rodríguez",
          motorcycleModel: "Honda CB 125F",
          amount: 354167,
          date: "2023-04-10",
          isLate: false,
        },
        {
          id: "2",
          loanId: "1",
          userName: "Carlos Rodríguez",
          motorcycleModel: "Honda CB 125F",
          amount: 354167,
          date: "2023-03-10",
          isLate: false,
        },
        {
          id: "3",
          loanId: "2",
          userName: "María López",
          motorcycleModel: "Yamaha FZ 150",
          amount: 333333,
          date: "2023-04-08",
          isLate: false,
        },
        {
          id: "4",
          loanId: "2",
          userName: "María López",
          motorcycleModel: "Yamaha FZ 150",
          amount: 333333,
          date: "2023-03-08",
          isLate: true,
        },
      ])
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredInstallments = installments.filter(
    (installment) =>
      installment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installment.motorcycleModel.toLowerCase().includes(searchTerm.toLowerCase()),
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
                <TableHead className="text-blue-200">Estado</TableHead>
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
                    <TableCell>
                      <Skeleton className="h-5 w-[100px] bg-dark-blue-800/50" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-5 w-[100px] bg-dark-blue-800/50" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[80px] bg-dark-blue-800/50" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredInstallments.length === 0 ? (
                <TableRow className="border-dark-blue-800/30">
                  <TableCell colSpan={5} className="text-center text-blue-200/70">
                    No se encontraron cuotas
                  </TableCell>
                </TableRow>
              ) : (
                filteredInstallments.map((installment) => (
                  <TableRow key={installment.id} className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
                    <TableCell className="font-medium text-white">{installment.userName}</TableCell>
                    <TableCell className="hidden md:table-cell text-blue-200">{installment.motorcycleModel}</TableCell>
                    <TableCell className="text-blue-200">{formatCurrency(installment.amount)}</TableCell>
                    <TableCell className="hidden md:table-cell text-blue-200">{formatDate(installment.date)}</TableCell>
                    <TableCell>
                      {installment.isLate ? (
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
