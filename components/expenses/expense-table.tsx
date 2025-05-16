"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Eye,
    FileEdit,
    MoreVertical,
    Search,
    Trash2,
    FileDown,
    ArrowUpDown,
    RefreshCw,
    MoreHorizontal,
    FileSpreadsheet,
    Receipt,
    Calendar,
    Tag,
    DollarSign,
    CreditCard,
    User,
    Hash,
    FileText,
    AlertTriangle,
    Download,
    Plus,
    Filter,
    Wallet,
    Home,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ExpenseModal } from "./expense-modal"
import { HttpService } from "@/lib/http"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export type Expense = {
    id: string
    category: string
    amount: number
    paymentMethod: "CASH" | "CARD" | "TRANSACTION" | "CHECK" | "OTHER"
    beneficiary: string
    reference: string
    description: string
    date: string
    createdBy?: {
        id: string
        name: string
        username: string
    }
}

const categoryMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    RENT: {
        label: "Alquiler",
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800/30",
        icon: <Home className="h-3 w-3" />,
    },
    SERVICES: {
        label: "Servicios",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/30",
        icon: <FileText className="h-3 w-3" />,
    },
    SALARIES: {
        label: "Salarios",
        color:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/30",
        icon: <User className="h-3 w-3" />,
    },
    TAXES: {
        label: "Impuestos",
        color:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/30",
        icon: <Receipt className="h-3 w-3" />,
    },
    MAINTENANCE: {
        label: "Mantenimiento",
        color:
            "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800/30",
        icon: <FileText className="h-3 w-3" />,
    },
    PURCHASES: {
        label: "Compras",
        color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800/30",
        icon: <Wallet className="h-3 w-3" />,
    },
    MARKETING: {
        label: "Marketing",
        color:
            "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/30",
        icon: <FileText className="h-3 w-3" />,
    },
    TRANSPORT: {
        label: "Transporte",
        color:
            "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800/30",
        icon: <FileText className="h-3 w-3" />,
    },
    OTHER: {
        label: "Otros",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800/30",
        icon: <FileText className="h-3 w-3" />,
    },
}

const paymentMethodMap: Record<string, { label: string; icon: React.ReactNode }> = {
    CASH: { label: "Efectivo", icon: <DollarSign className="h-4 w-4 text-green-500" /> },
    TRANSACTION: { label: "Transferencia", icon: <CreditCard className="h-4 w-4 text-blue-500" /> },
    CARD: { label: "Tarjeta", icon: <CreditCard className="h-4 w-4 text-purple-500" /> },
    CHECK: { label: "Cheque", icon: <FileText className="h-4 w-4 text-amber-500" /> },
    OTHER: { label: "Otro", icon: <FileText className="h-4 w-4 text-gray-500" /> },
}

// Función para formatear montos con separadores de miles
const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)
}

export function ExpenseTable() {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("todos")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc")
    const [refreshKey, setRefreshKey] = useState(0)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)
    const [viewExpense, setViewExpense] = useState<Expense | null>(null)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)
    const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>(undefined)

    useEffect(() => {
        fetchExpenses()
    }, [refreshKey])

    const fetchExpenses = async () => {
        try {
            setLoading(true)
            const res = await HttpService.get<any[]>("/api/v1/expense")
            // Ordenar por fecha al recibir los datos (más reciente primero)
            const sortedExpenses = [...res.data]
                .map((item) => ({
                    ...item,
                    createdBy: item.createdBy || null,
                }))
                .sort((a, b) => {
                    return sortDirection === "desc"
                        ? new Date(b.date).getTime() - new Date(a.date).getTime()
                        : new Date(a.date).getTime() - new Date(b.date).getTime()
                })
            setExpenses(sortedExpenses)
        } catch (err) {
            console.error("Error fetching expenses:", err)
        } finally {
            setLoading(false)
        }
    }

    // Función para cambiar la dirección de ordenamiento
    const toggleSortDirection = () => {
        const newDirection = sortDirection === "desc" ? "asc" : "desc"
        setSortDirection(newDirection)

        // Reordenar los gastos con la nueva dirección
        const sortedExpenses = [...expenses].sort((a, b) => {
            const comparison = new Date(b.date).getTime() - new Date(a.date).getTime()
            return newDirection === "desc" ? comparison : -comparison
        })

        setExpenses(sortedExpenses)
        setCurrentPage(1) // Volver a la primera página al cambiar el orden
    }

    const handleDelete = (id: string) => {
        setExpenseToDelete(id)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!expenseToDelete) return

        try {
            await HttpService.delete(`/api/v1/expense/${expenseToDelete}`)
            setExpenses((prev) => prev.filter((expense) => expense.id !== expenseToDelete))
            // Mostrar toast de éxito
        } catch (error) {
            console.error("Error al eliminar egreso:", error)
            // Mostrar toast de error
        } finally {
            setDeleteDialogOpen(false)
        }
    }

    const handleViewDetails = (expense: Expense) => {
        setViewExpense(expense)
        setViewDialogOpen(true)
    }

    const handleEditExpense = (expense: Expense) => {
        setExpenseToEdit(expense)
        // Abrir el modal directamente en lugar de configurar un estado separado
        document.getElementById(`edit-expense-trigger-${expense.id}`)?.click()
    }

    const refreshData = () => {
        setRefreshKey((prev) => prev + 1)
    }

    const exportToCSV = () => {
        const headers = [
            "ID",
            "Fecha",
            "Categoría",
            "Monto",
            "Método de Pago",
            "Beneficiario",
            "Referencia",
            "Descripción",
            "Creado por",
        ]

        const csvRows = [
            headers.join(","),
            ...expenses.map((expense) =>
                [
                    expense.id,
                    format(new Date(expense.date), "dd/MM/yyyy", { locale: es }),
                    categoryMap[expense.category]?.label || expense.category,
                    formatMoney(expense.amount),
                    paymentMethodMap[expense.paymentMethod]?.label || expense.paymentMethod,
                    expense.beneficiary,
                    expense.reference,
                    expense.description,
                    expense.createdBy?.name || "—",
                ].join(","),
            ),
        ]

        const csvContent = csvRows.join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", "egresos.csv")
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const filteredExpenses = expenses.filter((expense) => {
        const matchesSearch =
            expense.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.beneficiary.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.reference.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCategory = categoryFilter === "todos" || expense.category === categoryFilter

        return matchesSearch && matchesCategory
    })

    const totalItems = filteredExpenses.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
    const currentItems = filteredExpenses.slice(startIndex, endIndex)

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

    // Calcular el total de egresos
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    return (
        <Card className="bg-white dark:bg-gray-950 border border-blue-100 dark:border-blue-900/30 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-sky-500 text-white p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                            <Receipt className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Gestión de Egresos</CardTitle>
                            <CardDescription className="text-blue-100">Administra los gastos y pagos realizados</CardDescription>
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
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filtros avanzados
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-500/70" />
                            <Input
                                type="search"
                                placeholder="Buscar por beneficiario, referencia o descripción..."
                                className="pl-9 border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setCurrentPage(1) // Resetear a primera página al buscar
                                }}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <Select
                                value={categoryFilter}
                                onValueChange={(value) => {
                                    setCategoryFilter(value)
                                    setCurrentPage(1) // Resetear a primera página al filtrar
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[180px] border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700">
                                    <SelectValue placeholder="Categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todas las categorías</SelectItem>
                                    <SelectItem value="RENT">Alquiler</SelectItem>
                                    <SelectItem value="SERVICES">Servicios</SelectItem>
                                    <SelectItem value="SALARIES">Salarios</SelectItem>
                                    <SelectItem value="TAXES">Impuestos</SelectItem>
                                    <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                                    <SelectItem value="PURCHASES">Compras</SelectItem>
                                    <SelectItem value="MARKETING">Marketing</SelectItem>
                                    <SelectItem value="TRANSPORT">Transporte</SelectItem>
                                    <SelectItem value="OTHER">Otros</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={itemsPerPage.toString()}
                                onValueChange={(value) => {
                                    setItemsPerPage(Number(value))
                                    setCurrentPage(1)
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[180px] border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700">
                                    <SelectValue placeholder="Mostrar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 por página</SelectItem>
                                    <SelectItem value="10">10 por página</SelectItem>
                                    <SelectItem value="20">20 por página</SelectItem>
                                    <SelectItem value="50">50 por página</SelectItem>
                                </SelectContent>
                            </Select>
                            <ExpenseModal
                                onSuccess={() => {
                                    refreshData()
                                }}
                            >
                                <Button className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white shadow-sm hover:shadow-md transition-all">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nuevo Egreso
                                </Button>
                            </ExpenseModal>
                        </div>
                    </div>

                    {/* Resumen de egresos */}
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500/10 p-2 rounded-full">
                                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-700 dark:text-blue-300">Total de egresos</p>
                                <p className="text-xl font-bold text-blue-800 dark:text-blue-200">${formatMoney(totalAmount)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500/10 p-2 rounded-full">
                                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-700 dark:text-blue-300">Período</p>
                                <p className="text-md font-medium text-blue-800 dark:text-blue-200">
                                    {format(new Date(), "MMMM yyyy", { locale: es }).replace(/^./, (c) => c.toUpperCase())}
                                </p>

                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500/10 p-2 rounded-full">
                                <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-700 dark:text-blue-300">Categorías</p>
                                <p className="text-md font-medium text-blue-800 dark:text-blue-200">
                                    {categoryFilter === "todos" ? "Todas" : categoryMap[categoryFilter]?.label || categoryFilter}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-blue-100 dark:border-blue-900/30 overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50">
                                        {/* ID */}
                                        <TableHead className="text-left">
                                            <div className="flex items-center gap-1.5">
                                                <Hash className="h-4 w-4" />
                                                <span>ID</span>
                                            </div>
                                        </TableHead>

                                        {/* Fecha */}
                                        <TableHead className="text-left">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4" />
                                                <span>Fecha</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="ml-1 p-0 h-6 w-6 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
                                                    onClick={toggleSortDirection}
                                                >
                                                    <ArrowUpDown className="h-4 w-4" />
                                                    <span className="sr-only">Ordenar</span>
                                                </Button>
                                            </div>
                                        </TableHead>

                                        {/* Categoría */}
                                        <TableHead className="text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Tag className="h-4 w-4" />
                                                <span>Categoría</span>
                                            </div>
                                        </TableHead>

                                        {/* Monto */}
                                        <TableHead className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <DollarSign className="h-4 w-4" />
                                                <span>Monto</span>
                                            </div>
                                        </TableHead>

                                        {/* Método */}
                                        <TableHead className="text-left">
                                            <div className="flex items-center gap-1.5">
                                                <CreditCard className="h-4 w-4" />
                                                <span>Método</span>
                                            </div>
                                        </TableHead>

                                        {/* Beneficiario */}
                                        <TableHead className="text-left">
                                            <div className="flex items-center gap-1.5">
                                                <User className="h-4 w-4" />
                                                <span>Beneficiario</span>
                                            </div>
                                        </TableHead>

                                        {/* Referencia */}
                                        <TableHead className="text-left hidden md:table-cell">
                                            <div className="flex items-center gap-1.5">
                                                <FileText className="h-4 w-4" />
                                                <span>Referencia</span>
                                            </div>
                                        </TableHead>

                                        {/* Creado por */}
                                        <TableHead className="text-left hidden md:table-cell">
                                            <div className="flex items-center gap-1.5">
                                                <User className="h-4 w-4" />
                                                <span>Creado por</span>
                                            </div>
                                        </TableHead>

                                        {/* Acciones */}
                                        <TableHead className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <FileEdit className="h-4 w-4" />
                                                <span>Acciones</span>
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, index) => (
                                            <TableRow
                                                key={`skeleton-${index}`}
                                                className="border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                            >
                                                <TableCell>
                                                    <Skeleton className="h-5 w-[60px] bg-blue-100/50 dark:bg-blue-900/20" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-5 w-[80px] bg-blue-100/50 dark:bg-blue-900/20" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-6 w-[100px] bg-blue-100/50 dark:bg-blue-900/20 rounded-full" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-5 w-[80px] bg-blue-100/50 dark:bg-blue-900/20 ml-auto" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-5 w-[100px] bg-blue-100/50 dark:bg-blue-900/20" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-5 w-[120px] bg-blue-100/50 dark:bg-blue-900/20" />
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <Skeleton className="h-5 w-[100px] bg-blue-100/50 dark:bg-blue-900/20" />
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <Skeleton className="h-5 w-[100px] bg-blue-100/50 dark:bg-blue-900/20" />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end">
                                                        <Skeleton className="h-8 w-8 bg-blue-100/50 dark:bg-blue-900/20 rounded-md" />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : currentItems.length === 0 ? (
                                        <TableRow className="border-blue-100 dark:border-blue-900/30">
                                            <TableCell colSpan={9} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Receipt className="h-10 w-10 text-blue-300/50 dark:text-blue-700/30" />
                                                    <p className="text-sm">No se encontraron egresos con los criterios de búsqueda.</p>
                                                    {(searchTerm || categoryFilter !== "todos") && (
                                                        <Button
                                                            variant="link"
                                                            onClick={() => {
                                                                setSearchTerm("")
                                                                setCategoryFilter("todos")
                                                            }}
                                                            className="text-blue-500 dark:text-blue-400"
                                                        >
                                                            Limpiar filtros
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        currentItems.map((expense) => (
                                            <TableRow
                                                key={expense.id}
                                                className="border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                            >
                                                <TableCell className="font-mono text-xs text-gray-600 dark:text-gray-300">
                                                    {expense.id}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-4 w-4 text-blue-500" />
                                                        <span className="font-medium">
                                                            {format(new Date(expense.date), "dd/MM/yyyy", { locale: es })}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={`flex items-center justify-center gap-1.5 text-sm px-3 py-1 rounded-full ${categoryMap[expense.category]?.color || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"}`}
                                                        variant="outline"
                                                    >
                                                        {categoryMap[expense.category]?.icon || <FileText className="h-3 w-3" />}
                                                        <span>{categoryMap[expense.category]?.label || expense.category}</span>
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                                                    ${formatMoney(expense.amount)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        {paymentMethodMap[expense.paymentMethod]?.icon || (
                                                            <FileText className="h-4 w-4 text-gray-500" />
                                                        )}
                                                        <span>{paymentMethodMap[expense.paymentMethod]?.label || expense.paymentMethod}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[150px] truncate" title={expense.beneficiary}>
                                                    <div className="flex items-center gap-1.5">
                                                        <User className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                                                        <span className="truncate">{expense.beneficiary}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell max-w-[150px] truncate" title={expense.reference}>
                                                    <div className="flex items-center gap-1.5">
                                                        <Hash className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                        <span className="truncate">{expense.reference}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell max-w-[150px] truncate">
                                                    <div className="flex items-center gap-1.5">
                                                        <User className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                                        <span className="truncate">{expense.createdBy?.username || "—"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                                            >
                                                                <span className="sr-only">Abrir menú</span>
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleViewDetails(expense)}>
                                                                <Eye className="mr-2 h-4 w-4 text-blue-500" />
                                                                <span>Ver detalles</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEditExpense(expense)}>
                                                                <FileEdit className="mr-2 h-4 w-4 text-amber-500" />
                                                                <span>Editar</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <FileDown className="mr-2 h-4 w-4 text-green-500" />
                                                                <span>Descargar comprobante</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-red-600 dark:text-red-400"
                                                                onClick={() => handleDelete(expense.id)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Eliminar</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
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
                            Mostrando {totalItems > 0 ? startIndex + 1 : 0}-{endIndex} de {totalItems} egresos
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

            {/* Diálogo de confirmación para eliminar */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Confirmar eliminación
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Está seguro que desea eliminar este egreso? Esta acción no se puede deshacer.
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

            {/* Diálogo para ver detalles del egreso */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <Receipt className="h-5 w-5" />
                            Detalles del Egreso
                        </DialogTitle>
                        <DialogDescription>Información completa del egreso seleccionado</DialogDescription>
                    </DialogHeader>

                    {viewExpense && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                                    <p className="font-mono text-sm">{viewExpense.id}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Fecha</p>
                                    <p className="font-medium flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        {format(new Date(viewExpense.date), "dd MMMM yyyy", { locale: es })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Categoría</p>
                                    <Badge
                                        className={`${categoryMap[viewExpense.category]?.color ||
                                            "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                                            } flex items-center gap-1.5`}
                                        variant="outline"
                                    >
                                        {categoryMap[viewExpense.category]?.icon || <FileText className="h-3 w-3" />}
                                        <span>{categoryMap[viewExpense.category]?.label || viewExpense.category}</span>
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Monto</p>
                                    <p className="font-medium text-lg text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                        <DollarSign className="h-5 w-5" />
                                        {formatMoney(viewExpense.amount)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Método de Pago</p>
                                    <p className="flex items-center gap-1.5">
                                        {paymentMethodMap[viewExpense.paymentMethod]?.icon || (
                                            <FileText className="h-4 w-4 text-gray-500" />
                                        )}
                                        <span>{paymentMethodMap[viewExpense.paymentMethod]?.label || viewExpense.paymentMethod}</span>
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Beneficiario</p>
                                    <p className="flex items-center gap-1.5">
                                        <User className="h-4 w-4 text-indigo-500" />
                                        {viewExpense.beneficiary}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Referencia</p>
                                    <p className="flex items-center gap-1.5">
                                        <Hash className="h-4 w-4 text-gray-400" />
                                        {viewExpense.reference}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Creado por</p>
                                    <p className="flex items-center gap-1.5">
                                        <User className="h-4 w-4 text-purple-500" />
                                        {viewExpense.createdBy?.username || "—"}
                                    </p>
                                </div>
                                <div className="space-y-1 col-span-1 md:col-span-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Descripción</p>
                                    <p className="text-sm border border-gray-200 dark:border-gray-800 rounded-md p-3 bg-gray-50 dark:bg-gray-900/50">
                                        {viewExpense.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/30"
                                    onClick={() => setViewDialogOpen(false)}
                                >
                                    Cerrar
                                </Button>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5">
                                    <Download className="h-4 w-4" />
                                    Descargar Comprobante
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Botones ocultos para activar los modales de edición */}
            {expenses.map((expense) => (
                <div key={`edit-trigger-${expense.id}`} className="hidden">
                    <ExpenseModal
                        expenseData={expense}
                        isEditing={true}
                        onSuccess={() => {
                            refreshData()
                        }}
                    >
                        <button id={`edit-expense-trigger-${expense.id}`}>Editar</button>
                    </ExpenseModal>
                </div>
            ))}
        </Card>
    )
}
