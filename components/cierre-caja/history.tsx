"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Search,
    FileText,
    Download,
    Eye,
    Calendar,
    ArrowUpToLine,
    ArrowDownToLine,
    Wallet,
    Filter,
    RefreshCw,
    User,
    Clock,
    AlertCircle,
    FileSpreadsheet,
    FileIcon as FilePdf,
    Bike,
    Building,
    Percent,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, cn } from "@/lib/utils"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

enum Providers {
    MOTOFACIL = "MOTOFACIL",
    OBRASOCIAL = "OBRASOCIAL",
    PORCENTAJETITO = "PORCENTAJETITO",
}

const formatProviderName = (provider: string | undefined): string => {
    if (!provider) return "Desconocido"

    switch (provider) {
        case Providers.MOTOFACIL:
            return "Moto Facil"
        case Providers.OBRASOCIAL:
            return "Obra Social"
        case Providers.PORCENTAJETITO:
            return "Porcentaje Tito"
        default:
            return provider
    }
}

const providerMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    [Providers.MOTOFACIL]: {
        label: "Moto Facil",
        color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/30",
        icon: <Bike className="h-3 w-3" />,
    },
    [Providers.OBRASOCIAL]: {
        label: "Obra Social",
        color:
            "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30",
        icon: <Building className="h-3 w-3" />,
    },
    [Providers.PORCENTAJETITO]: {
        label: "Porcentaje Tito",
        color:
            "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800/30",
        icon: <Percent className="h-3 w-3" />,
    },
}

type Payment = {
    id: string
    paymentMethod: "CASH" | "TRANSACTION" | "CARD"
    amount: number
    paymentDate: string
    isLate: boolean
}

type Expense = {
    id: string
    amount: number
    date: string
    category: string
    paymentMethod: "CASH" | "TRANSACTION" | "CARD"
    beneficiary: string
    reference?: string
    description: string
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
    provider?: string
    raw: {
        payments: Payment[]
        expense: Expense[]
        provider?: string
        [key: string]: any
    }
}

export function CashRegisterHistory() {
    const [selectedRegister, setSelectedRegister] = useState<CashRegister | null>(null)
    const [registers, setRegisters] = useState<CashRegister[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState("10")
    const [month, setMonth] = useState("all")
    const [providerFilter, setProviderFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [refreshing, setRefreshing] = useState(false)

    const fetchData = async () => {
        try {
            setLoading(true)
            setRefreshing(true)

            const res = await HttpService.get("/api/v1/closing")
            const mapped: CashRegister[] = res.data.map((item: any) => {
                const totalIncome = item.payments.reduce((acc: number, p: Payment) => acc + p.amount, 0)
                const totalExpense = item.expense.reduce((acc: number, e: Expense) => acc + e.amount, 0)
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
                    user: item.createdBy?.name || "N/A",
                    totalIncome,
                    totalExpense,
                    balance,
                    status,
                    provider: item.provider,
                    raw: {
                        payments: item.payments,
                        expense: item.expense,
                        provider: item.provider,
                        ...item,
                    },
                }
            })

            setRegisters(mapped)
        } catch (err) {
            console.error("Error al cargar los cierres de caja:", err)
        } finally {
            setLoading(false)
            setTimeout(() => setRefreshing(false), 500)
        }
    }

    useEffect(() => {
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

    const filteredRegisters = registers.filter((r) => {
        const matchesSearch =
            r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.provider && formatProviderName(r.provider).toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesMonth = month === "all" || r.date.includes(getMonthFromFilter(month))
        const matchesProvider = providerFilter === "all" || r.provider === providerFilter
        const matchesStatus = statusFilter === "all" || r.status === statusFilter

        return matchesSearch && matchesMonth && matchesProvider && matchesStatus
    })

    const itemsPerPageNumber = Number.parseInt(itemsPerPage)
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
                return (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/30 flex items-center gap-1 text-xs px-2 py-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                        Cuadrado
                    </Badge>
                )
            case "minor-diff":
                return (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30 flex items-center gap-1 text-xs px-2 py-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                        Diferencia Menor
                    </Badge>
                )
            case "major-diff":
                return (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800/30 flex items-center gap-1 text-xs px-2 py-0.5">
                        <AlertCircle className="h-3 w-3" />
                        Diferencia Mayor
                    </Badge>
                )
        }
    }

    const renderProvider = (provider?: string) => {
        if (!provider) return <span className="text-muted-foreground text-sm">—</span>

        return (
            <Badge
                className={`flex items-center justify-center gap-1.5 text-sm px-3 py-1 rounded-full ${providerMap[provider]?.color || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                    }`}
                variant="outline"
            >
                {providerMap[provider]?.icon || <FileText className="h-3 w-3" />}
                <span>{formatProviderName(provider)}</span>
            </Badge>
        )
    }

    const resetFilters = () => {
        setSearchTerm("")
        setMonth("all")
        setProviderFilter("all")
        setStatusFilter("all")
        setCurrentPage(1)
    }

    // Calculate summary statistics
    const totalIncome = filteredRegisters.reduce((sum, r) => sum + r.totalIncome, 0)
    const totalExpense = filteredRegisters.reduce((sum, r) => sum + r.totalExpense, 0)
    const totalBalance = filteredRegisters.reduce((sum, r) => sum + r.balance, 0)

    return (
        <Card className="shadow-md border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-primary" />
                            Historial de Cierres de Caja
                        </CardTitle>
                        <CardDescription>Consulta y gestiona todos los cierres de caja realizados</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={fetchData} disabled={refreshing} className="h-9 gap-1.5">
                            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                            Actualizar
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9">
                                    <Download className="h-4 w-4 mr-1.5" />
                                    Exportar
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Opciones de exportación</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                                    Exportar a Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <FilePdf className="h-4 w-4 mr-2" />
                                    Exportar a PDF
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar por ID, usuario o proveedor..."
                            className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <Select value={month} onValueChange={setMonth}>
                            <SelectTrigger className="w-full md:w-[150px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Filtrar por mes" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los meses</SelectItem>
                                {[...Array(12)].map((_, i) => {
                                    const value = `${i + 1}`.padStart(2, "0")
                                    const label = format(new Date(2025, i, 1), "MMMM", { locale: es })
                                    return (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>

                        <Select value={providerFilter} onValueChange={setProviderFilter}>
                            <SelectTrigger className="w-full md:w-[180px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Bike className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Filtrar por proveedor" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los proveedores</SelectItem>
                                <SelectItem value={Providers.MOTOFACIL}>Moto Facil</SelectItem>
                                <SelectItem value={Providers.OBRASOCIAL}>Obra Social</SelectItem>
                                <SelectItem value={Providers.PORCENTAJETITO}>Porcentaje Tito</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[150px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Filtrar por estado" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="balanced">Cuadrado</SelectItem>
                                <SelectItem value="minor-diff">Diferencia Menor</SelectItem>
                                <SelectItem value="major-diff">Diferencia Mayor</SelectItem>
                            </SelectContent>
                        </Select>

                        {(searchTerm || month !== "all" || providerFilter !== "all" || statusFilter !== "all") && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                                className="h-10 px-3 text-muted-foreground hover:text-foreground"
                            >
                                Limpiar filtros
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                <TableRow className="hover:bg-slate-100 dark:hover:bg-slate-800/50">
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead className="w-[100px]">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Fecha
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[80px]">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-2" />
                                            Hora
                                        </div>
                                    </TableHead>
                                    <TableHead>
                                        <div className="flex items-center">
                                            <User className="h-4 w-4 mr-2" />
                                            Usuario
                                        </div>
                                    </TableHead>
                                    <TableHead>
                                        <div className="flex items-center">
                                            <Bike className="h-4 w-4 mr-2" />
                                            Proveedor
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">
                                        <div className="flex items-center justify-end">
                                            <ArrowUpToLine className="h-4 w-4 mr-2 text-green-500" />
                                            Ingresos
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">
                                        <div className="flex items-center justify-end">
                                            <ArrowDownToLine className="h-4 w-4 mr-2 text-red-500" />
                                            Egresos
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">
                                        <div className="flex items-center justify-end">
                                            <Wallet className="h-4 w-4 mr-2 text-blue-500" />
                                            Balance
                                        </div>
                                    </TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <TableRow key={index} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                            {Array.from({ length: 10 }).map((__, i) => (
                                                <TableCell key={i}>
                                                    <Skeleton className="h-5 w-full" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : currentItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-10">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <Search className="h-10 w-10 mb-2 opacity-20" />
                                                <p className="text-lg font-medium">No se encontraron registros de cierre de caja</p>
                                                <p className="text-sm">Intenta con otros criterios de búsqueda o limpia los filtros</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentItems.map((r) => (
                                        <TableRow key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                            <TableCell className="font-medium font-mono text-xs">
                                                <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit">
                                                    {r.id.substring(0, 8)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
                                                        <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                                                    </div>
                                                    <span>{r.date}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{r.time}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
                                                        <User className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                                                    </div>
                                                    <span>{r.user}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{renderProvider(r.provider)}</TableCell>
                                            <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                                                {formatCurrency(r.totalIncome)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-red-600 dark:text-red-400">
                                                {formatCurrency(r.totalExpense)}
                                            </TableCell>
                                            <TableCell
                                                className={cn(
                                                    "text-right font-medium",
                                                    r.balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400",
                                                )}
                                            >
                                                {formatCurrency(r.balance)}
                                            </TableCell>
                                            <TableCell>{renderStatus(r.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => setSelectedRegister(r)}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Ver detalles</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="outline" size="icon" className="h-8 w-8">
                                                                    <FilePdf className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Descargar PDF</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="outline" size="icon" className="h-8 w-8">
                                                                    <FileSpreadsheet className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Exportar Excel</p>
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

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {filteredRegisters.length > 0 ? indexOfFirstItem + 1 : 0}-
                            {Math.min(indexOfLastItem, filteredRegisters.length)} de {filteredRegisters.length} registros
                        </p>
                        <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
                            <SelectTrigger className="w-[70px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
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
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                            {getPageNumbers().map((n, idx) =>
                                typeof n === "string" ? (
                                    <PaginationItem key={idx}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                ) : (
                                    <PaginationItem key={n}>
                                        <PaginationLink isActive={currentPage === n} onClick={() => setCurrentPage(n)}>
                                            {n}
                                        </PaginationLink>
                                    </PaginationItem>
                                ),
                            )}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                    className={currentPage === totalPages || totalPages === 0 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </CardContent>

            {selectedRegister && (
                <CashRegisterDetailModal
                    open={!!selectedRegister}
                    onClose={() => setSelectedRegister(null)}
                    payments={selectedRegister.raw.payments}
                    expenses={selectedRegister.raw.expense}
                    provider={selectedRegister.provider}
                />
            )}
        </Card>
    )
}
