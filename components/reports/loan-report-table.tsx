"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DownloadIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon, ArrowUpDownIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface LoanReportTableProps {
  data: any[]
}

export function LoanReportTable({ data }: LoanReportTableProps) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("id")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const itemsPerPage = 10
  const totalPages = Math.ceil(data.length / itemsPerPage)

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Formatear fecha
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  // Filtrar y ordenar datos
  const filteredData = data
    .filter(
      (loan) =>
        loan.id.toLowerCase().includes(search.toLowerCase()) ||
        loan.clientName.toLowerCase().includes(search.toLowerCase()) ||
        loan.motorcycle.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortBy] > b[sortBy] ? 1 : -1
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1
      }
    })

  // Paginar datos
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  // Manejar cambio de ordenamiento
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Reporte de arrendamientos</CardTitle>
            <CardDescription>Listado detallado de arrendamientos y su estado</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <DownloadIcon className="h-4 w-4" />
            Exportar
          </Button>
        </div>
        <div className="flex items-center mt-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar arrendamientos..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 p-0 font-medium"
                    onClick={() => handleSort("id")}
                  >
                    ID
                    <ArrowUpDownIcon className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 p-0 font-medium"
                    onClick={() => handleSort("clientName")}
                  >
                    Cliente
                    <ArrowUpDownIcon className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Motocicleta</TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 p-0 font-medium ml-auto"
                    onClick={() => handleSort("amount")}
                  >
                    Monto
                    <ArrowUpDownIcon className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">Cuotas</TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 p-0 font-medium mx-auto"
                    onClick={() => handleSort("startDate")}
                  >
                    Fecha Inicio
                    <ArrowUpDownIcon className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 p-0 font-medium mx-auto"
                    onClick={() => handleSort("status")}
                  >
                    Estado
                    <ArrowUpDownIcon className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">Progreso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.id}</TableCell>
                    <TableCell>{loan.clientName}</TableCell>
                    <TableCell>{loan.motorcycle}</TableCell>
                    <TableCell className="text-right">{formatCurrency(loan.amount)}</TableCell>
                    <TableCell className="text-center">
                      {loan.paidInstallments}/{loan.installments}
                    </TableCell>
                    <TableCell className="text-center">{formatDate(loan.startDate)}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          loan.status === "ACTIVE"
                            ? "default"
                            : loan.status === "COMPLETED"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {loan.status === "ACTIVE"
                          ? "Activo"
                          : loan.status === "COMPLETED"
                            ? "Completado"
                            : "En Mora"}
                      </Badge>

                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={loan.progress} className="h-2" />
                        <span className="text-xs">{loan.progress}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No se encontraron arrendamientos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {filteredData.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {(page - 1) * itemsPerPage + 1} a {Math.min(page * itemsPerPage, filteredData.length)} de{" "}
              {filteredData.length} arrendamientos
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
