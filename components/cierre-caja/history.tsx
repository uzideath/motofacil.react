"use client"

import { useEffect, useMemo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, FileText, Download, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { HttpService } from "@/lib/http"
import { format } from "date-fns"
import { es } from "date-fns/locale/es"
import { CashRegisterDetailModal } from "./history-modal"

type Payment = {
    id: string
    paymentMethod: "CASH" | "TRANSACTION" | "CARD"
    amount: number
    paymentDate: string
    isLate: boolean
}

type CashRegister = {
    id: string
    date: string
    user: string
    totalIncome: number
    totalExpense: number
    balance: number
    status: "balanced" | "minor-diff" | "major-diff"
    time: string
}

export function CashRegisterHistory() {
    const [selectedPayments, setSelectedPayments] = useState<Payment[] | null>(null)
    const [registers, setRegisters] = useState<CashRegister[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState("10")
    const [month, setMonth] = useState("all")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await HttpService.get("/api/v1/closing")
                const mapped: CashRegister[] = res.data.map((item: any) => {
                    const totalIncome = item.payments.reduce((acc: number, p: Payment) => acc + p.amount, 0)
                    const totalExpense = 0 // Ajustar si tienes egresos separados
                    const balance = totalIncome - totalExpense
                    const createdAt = new Date(item.createdAt)

                    const status: CashRegister["status"] =
                        Math.abs(balance - (item.cashInRegister + item.cashFromTransfers + item.cashFromCards)) <= 1000
                            ? "balanced"
                            : Math.abs(balance - (item.cashInRegister + item.cashFromTransfers + item.cashFromCards)) <= 5000
                                ? "minor-diff"
                                : "major-diff"

                    return {
                        id: item.id,
                        date: format(createdAt, "dd/MM/yyyy", { locale: es }),
                        time: format(createdAt, "HH:mm", { locale: es }),
                        user: "N/A", // Puedes ajustar si tienes usuario asociado
                        totalIncome,
                        totalExpense,
                        balance,
                        status,
                    }
                })
                setRegisters(mapped)
            } catch (err) {
                console.error("Error al cargar los cierres de caja:", err)
            }
        }

        fetchData()
    }, [])

    const getMonthFromFilter = (monthFilter: string) => {
        const months: Record<string, string> = {
            "01": "/01/",
            "02": "/02/",
            "03": "/03/",
            "04": "/04/",
            "05": "/05/",
            "06": "/06/",
            "07": "/07/",
            "08": "/08/",
            "09": "/09/",
            "10": "/10/",
            "11": "/11/",
            "12": "/12/",
        }
        return months[monthFilter] || ""
    }

    const filteredRegisters = registers.filter(
        (r) =>
            (r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.user.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (month === "all" || r.date.includes(getMonthFromFilter(month)))
    )

    const itemsPerPageNumber = parseInt(itemsPerPage)
    const indexOfLastItem = currentPage * itemsPerPageNumber
    const indexOfFirstItem = indexOfLastItem - itemsPerPageNumber
    const currentItems = filteredRegisters.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredRegisters.length / itemsPerPageNumber)

    const getPageNumbers = () => {
        const pageNumbers: (number | string)[] = []
        const maxPagesToShow = 5

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i)
        } else {
            pageNumbers.push(1)
            let startPage = Math.max(2, currentPage - 1)
            let endPage = Math.min(totalPages - 1, currentPage + 1)

            if (currentPage <= 2) endPage = 4
            else if (currentPage >= totalPages - 1) startPage = totalPages - 3

            if (startPage > 2) pageNumbers.push("ellipsis1")
            for (let i = startPage; i <= endPage; i++) pageNumbers.push(i)
            if (endPage < totalPages - 1) pageNumbers.push("ellipsis2")
            pageNumbers.push(totalPages)
        }

        return pageNumbers
    }

    const renderStatus = (status: CashRegister["status"]) => {
        switch (status) {
            case "balanced":
                return <Badge className="bg-green-100 text-green-800">Cuadrado</Badge>
            case "minor-diff":
                return <Badge className="bg-yellow-100 text-yellow-800">Diferencia Menor</Badge>
            case "major-diff":
                return <Badge className="bg-red-100 text-red-800">Diferencia Mayor</Badge>
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por ID o usuario..."
                        className="pl-8 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <Select value={month} onValueChange={setMonth}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filtrar por mes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los meses</SelectItem>
                            {[...Array(12)].map((_, i) => {
                                const value = `${i + 1}`.padStart(2, "0")
                                const label = format(new Date(2025, i, 1), "MMMM", { locale: es })
                                return <SelectItem key={value} value={value}>{label}</SelectItem>
                            })}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Hora</TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Ingresos</TableHead>
                                <TableHead>Egresos</TableHead>
                                <TableHead>Balance</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-6">
                                        No se encontraron registros de cierre de caja
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentItems.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-medium">{r.id}</TableCell>
                                        <TableCell>{r.date}</TableCell>
                                        <TableCell>{r.time}</TableCell>
                                        <TableCell>{r.user}</TableCell>
                                        <TableCell className="text-green-600">{formatCurrency(r.totalIncome)}</TableCell>
                                        <TableCell className="text-red-600">{formatCurrency(r.totalExpense)}</TableCell>
                                        <TableCell className="font-medium">{formatCurrency(r.balance)}</TableCell>
                                        <TableCell>{renderStatus(r.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    title="Ver detalles"
                                                    onClick={async () => {
                                                        try {
                                                            const res = await HttpService.get(`/api/v1/closing/search/${r.id}`)
                                                            setSelectedPayments(res.data.payments)
                                                        } catch (err) {
                                                            console.error("Error al cargar los pagos del cierre:", err)
                                                        }
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">Ver detalles</span>
                                                </Button>
                                                <Button variant="outline" size="icon" title="Descargar PDF">
                                                    <FileText className="h-4 w-4" />
                                                    <span className="sr-only">Descargar PDF</span>
                                                </Button>
                                                <Button variant="outline" size="icon" title="Exportar Excel">
                                                    <Download className="h-4 w-4" />
                                                    <span className="sr-only">Exportar Excel</span>
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

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRegisters.length)} de{" "}
                        {filteredRegisters.length} registros
                    </p>
                    <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
                        <SelectTrigger className="w-[70px]">
                            <SelectValue placeholder="10" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">por página</p>
                </div>

                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>

                        {getPageNumbers().map((pageNumber, index) =>
                            typeof pageNumber === "string" ? (
                                <PaginationItem key={index}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            ) : (
                                <PaginationItem key={pageNumber}>
                                    <PaginationLink
                                        isActive={currentPage === pageNumber}
                                        onClick={() => setCurrentPage(pageNumber)}
                                    >
                                        {pageNumber}
                                    </PaginationLink>
                                </PaginationItem>
                            )
                        )}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
            {selectedPayments && (
                <CashRegisterDetailModal
                    open={!!selectedPayments}
                    onClose={() => setSelectedPayments(null)}
                    payments={selectedPayments}
                />
            )}

        </div>
    )
}
