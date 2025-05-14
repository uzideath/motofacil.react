"use client"

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
import { Card, CardContent } from "@/components/ui/card"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Eye, FileEdit, MoreVertical, Search, Trash2, FileDown, ArrowUpDown } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
// At the top of the file, add the import for ExpenseModal
import { ExpenseModal } from "./expense-modal"
import { HttpService } from "@/lib/http"


type Expense = {
    id: string
    category: string
    amount: number
    paymentMethod: "CASH" | "CARD" | "TRANSACTION" | "CHECK" | "OTHER"
    beneficiary: string
    reference: string
    description: string
    date: string
}

const categoryMap: Record<string, { label: string; color: string }> = {
    alquiler: { label: "Alquiler", color: "bg-red-100 text-red-800" },
    servicios: { label: "Servicios", color: "bg-blue-100 text-blue-800" },
    salarios: { label: "Salarios", color: "bg-green-100 text-green-800" },
    impuestos: { label: "Impuestos", color: "bg-yellow-100 text-yellow-800" },
    mantenimiento: { label: "Mantenimiento", color: "bg-purple-100 text-purple-800" },
    compras: { label: "Compras", color: "bg-pink-100 text-pink-800" },
    marketing: { label: "Marketing", color: "bg-indigo-100 text-indigo-800" },
    transporte: { label: "Transporte", color: "bg-orange-100 text-orange-800" },
    otros: { label: "Otros", color: "bg-gray-100 text-gray-800" },
}

const paymentMethodMap: Record<string, string> = {
    CASH: "Efectivo",
    TRANSACTION: "Transferencia",
    CARD: "Tarjeta",
    CHECK: "Cheque",
    OTHER: "Otro",
}

export function ExpenseTable() {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("todos")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc') // Por defecto ordenamos por más reciente

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const res = await HttpService.get<Expense[]>("/api/v1/expense")
                // Ordenar por fecha al recibir los datos (más reciente primero)
                const sortedExpenses = [...res.data].sort((a, b) => {
                    return new Date(b.date).getTime() - new Date(a.date).getTime()
                })
                setExpenses(sortedExpenses)
            } catch (err) {
                console.error("Error fetching expenses:", err)
            }
        }

        fetchExpenses()
    }, [])

    // Función para cambiar la dirección de ordenamiento
    const toggleSortDirection = () => {
        const newDirection = sortDirection === 'desc' ? 'asc' : 'desc'
        setSortDirection(newDirection)

        // Reordenar los gastos con la nueva dirección
        const sortedExpenses = [...expenses].sort((a, b) => {
            const comparison = new Date(b.date).getTime() - new Date(a.date).getTime()
            return newDirection === 'desc' ? comparison : -comparison
        })

        setExpenses(sortedExpenses)
        setCurrentPage(1) // Volver a la primera página al cambiar el orden
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

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar egresos..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1) // Resetear a primera página al buscar
                            }}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <ExpenseModal
                            onSuccess={() => {
                                // Aquí podríamos recargar los datos si fuera necesario
                                console.log("Egreso creado desde la tabla")
                            }}
                        />
                        <Select
                            value={categoryFilter}
                            onValueChange={(value) => {
                                setCategoryFilter(value)
                                setCurrentPage(1) // Resetear a primera página al filtrar
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todas las categorías</SelectItem>
                                <SelectItem value="alquiler">Alquiler</SelectItem>
                                <SelectItem value="servicios">Servicios</SelectItem>
                                <SelectItem value="salarios">Salarios</SelectItem>
                                <SelectItem value="impuestos">Impuestos</SelectItem>
                                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                                <SelectItem value="compras">Compras</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="transporte">Transporte</SelectItem>
                                <SelectItem value="otros">Otros</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={itemsPerPage.toString()}
                            onValueChange={(value) => {
                                setItemsPerPage(Number(value))
                                setCurrentPage(1)
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Mostrar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5 por página</SelectItem>
                                <SelectItem value="10">10 por página</SelectItem>
                                <SelectItem value="20">20 por página</SelectItem>
                                <SelectItem value="50">50 por página</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead className="w-[120px]">
                                    <div className="flex items-center">
                                        Fecha
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="ml-1 p-0 h-6 w-6"
                                            onClick={toggleSortDirection}
                                            title={sortDirection === 'desc' ? "Ordenar del más antiguo al más reciente" : "Ordenar del más reciente al más antiguo"}
                                        >
                                            <ArrowUpDown className="h-4 w-4" />
                                            <span className="sr-only">
                                                {sortDirection === 'desc' ? "Ordenar ascendente" : "Ordenar descendente"}
                                            </span>
                                        </Button>
                                    </div>
                                </TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead>Beneficiario</TableHead>
                                <TableHead className="hidden md:table-cell">Referencia</TableHead>
                                <TableHead className="w-[100px] text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        No se encontraron egresos con los criterios de búsqueda.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentItems.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell className="font-medium">{expense.id}</TableCell>
                                        <TableCell>{format(new Date(expense.date), "dd/MM/yyyy", { locale: es })}</TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`${categoryMap[expense.category]?.color || "bg-gray-100 text-gray-800"}`}
                                                variant="outline"
                                            >
                                                {categoryMap[expense.category]?.label || expense.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">${expense.amount.toFixed(2)}</TableCell>
                                        <TableCell>{paymentMethodMap[expense.paymentMethod] || expense.paymentMethod}</TableCell>
                                        <TableCell className="max-w-[150px] truncate" title={expense.beneficiary}>
                                            {expense.beneficiary}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell max-w-[150px] truncate" title={expense.reference}>
                                            {expense.reference}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Abrir menú</span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        <span>Ver detalles</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <FileEdit className="mr-2 h-4 w-4" />
                                                        <span>Editar</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <FileDown className="mr-2 h-4 w-4" />
                                                        <span>Descargar comprobante</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600">
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

                <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 mt-4">
                    <div className="text-sm text-muted-foreground">
                        Mostrando {startIndex + 1}-{endIndex} de {totalItems} egresos
                    </div>

                    <Pagination>
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
                                    <PaginationItem key={`page-${page}`}>
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
            </CardContent>
        </Card>
    )
}