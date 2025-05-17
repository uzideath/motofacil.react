"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Search,
    Eye,
    ArrowUpToLine,
    ArrowDownToLine,
    Home,
    FileText,
    User,
    Receipt,
    Wallet,
    CreditCard,
    Bike,
    Building,
    Percent,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Filter,
    RefreshCw,
    ArrowDownUp,
    MoreHorizontal,
    Download,
    Printer,
    Calendar,
    AlertCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HttpService } from "@/lib/http"
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
import type React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

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

type Installment = {
    id: string
    paymentDate: string
    paymentMethod: "CASH" | "CARD" | "TRANSACTION"
    amount: number
    loan: {
        user: { name: string }
        motorcycle: { plate: string; provider?: string }
    }
}

type Expense = {
    id: string
    amount: number
    date: string
    category: string
    provider: string
    paymentMethod: "CASH" | "CARD" | "TRANSACTION"
    beneficiary: string
    reference?: string
    description: string
}

type SelectedTransaction = {
    id: string
    amount: number
    paymentMethod: "CASH" | "CARD" | "TRANSACTION"
    type: "income" | "expense"
    provider?: string
}

type Transaction = {
    id: string
    time: string
    description: string
    category: string
    amount: number
    paymentMethod: string
    type: "income" | "expense"
    reference: string
    client?: string
    provider?: string
    date: Date
}

type SortField = "time" | "description" | "category" | "amount" | "provider" | null
type SortDirection = "asc" | "desc"

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
    "Cuota de préstamo": {
        label: "Cuota de préstamo",
        color:
            "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/30",
        icon: <CreditCard className="h-3 w-3" />,
    },
}

type Props = {
    token: string
    onSelect?: (transactions: SelectedTransaction[]) => void
}

export function TransactionTable({ token, onSelect }: Props) {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [providerFilter, setProviderFilter] = useState<string>("all")
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [sortField, setSortField] = useState<SortField>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
    const [currentPage, setCurrentPage] = useState(1)
    const [refreshing, setRefreshing] = useState(false)
    const itemsPerPage = 10

    // Add state for the dialog at the top of the component, after other state declarations
    const [showProviderMismatchDialog, setShowProviderMismatchDialog] = useState(false)
    const [currentProviderName, setCurrentProviderName] = useState<string | undefined>(undefined)
    const [attemptedProviderName, setAttemptedProviderName] = useState<string | undefined>(undefined)

    useEffect(() => {
        fetchTransactions()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])

    const fetchTransactions = async () => {
        try {
            setLoading(true)
            setRefreshing(true)

            const res = await HttpService.get<{
                installments: Installment[]
                expenses: Expense[]
            }>("/api/v1/closing/available-payments", {
                headers: { Authorization: token ? `Bearer ${token}` : "" },
            })

            const incomes: Transaction[] = res.data.installments.map((i) => ({
                id: i.id,
                time: new Date(i.paymentDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                description: `Pago cuota - ${i.loan.user.name}`,
                category: "Cuota de préstamo",
                amount: i.amount,
                paymentMethod: mapPaymentLabel(i.paymentMethod),
                type: "income",
                reference: i.id,
                client: i.loan.user.name,
                provider: i.loan.motorcycle.provider,
                date: new Date(i.paymentDate),
            }))

            const expenses: Transaction[] = res.data.expenses.map((e) => ({
                id: e.id,
                time: new Date(e.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                description: e.description,
                category: e.category,
                amount: e.amount,
                paymentMethod: mapPaymentLabel(e.paymentMethod),
                type: "expense",
                reference: e.reference ?? "",
                provider: e.provider,
                date: new Date(e.date),
            }))

            setTransactions([...incomes, ...expenses])
        } catch (err) {
            console.error("Error cargando transacciones:", err)
        } finally {
            setLoading(false)
            setTimeout(() => setRefreshing(false), 500)
        }
    }

    const mapPaymentLabel = (key: string) => {
        switch (key) {
            case "CASH":
                return "Efectivo"
            case "CARD":
                return "Tarjeta"
            case "TRANSACTION":
                return "Transferencia"
            default:
                return "Otro"
        }
    }

    const handleSelection = (id: string, checked: boolean) => {
        // Si está marcando un nuevo elemento
        if (checked) {
            // Obtener la transacción actual
            const currentTransaction = transactions.find((t) => t.id === id)

            // Si ya hay elementos seleccionados, verificar que sean del mismo proveedor
            if (selectedIds.length > 0 && currentTransaction) {
                const firstSelectedTransaction = transactions.find((t) => t.id === selectedIds[0])

                // Si el proveedor es diferente, mostrar una alerta y no permitir la selección
                if (firstSelectedTransaction && currentTransaction.provider !== firstSelectedTransaction.provider) {
                    // Instead of this:
                    // alert("Solo puedes seleccionar transacciones del mismo proveedor")

                    // Use this:
                    setCurrentProviderName(formatProviderName(firstSelectedTransaction.provider))
                    setAttemptedProviderName(formatProviderName(currentTransaction.provider))
                    setShowProviderMismatchDialog(true)
                    return
                }
            }

            // Si pasa la validación, agregar a seleccionados
            const updated = [...selectedIds, id]
            setSelectedIds(updated)

            const selectedTransactions: SelectedTransaction[] = transactions
                .filter((t) => updated.includes(t.id))
                .map((t) => ({
                    id: t.id,
                    amount: t.amount,
                    paymentMethod:
                        t.paymentMethod === "Efectivo" ? "CASH" : t.paymentMethod === "Tarjeta" ? "CARD" : "TRANSACTION",
                    type: t.type,
                    provider: t.provider, // Add this line to include the provider
                }))

            onSelect?.(selectedTransactions)
        } else {
            // Si está desmarcando, simplemente quitar de la selección
            const updated = selectedIds.filter((x) => x !== id)
            setSelectedIds(updated)

            const selectedTransactions: SelectedTransaction[] = transactions
                .filter((t) => updated.includes(t.id))
                .map((t) => ({
                    id: t.id,
                    amount: t.amount,
                    paymentMethod:
                        t.paymentMethod === "Efectivo" ? "CASH" : t.paymentMethod === "Tarjeta" ? "CARD" : "TRANSACTION",
                    type: t.type,
                    provider: t.provider, // Add this line to include the provider
                }))

            onSelect?.(selectedTransactions)
        }
    }

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <ArrowDownUp className="ml-1 h-4 w-4 opacity-50" />
        return sortDirection === "asc" ? (
            <ArrowDownUp className="ml-1 h-4 w-4" />
        ) : (
            <ArrowDownUp className="ml-1 h-4 w-4 rotate-180" />
        )
    }

    const resetFilters = () => {
        setSearchTerm("")
        setTypeFilter("all")
        setProviderFilter("all")
        setSortField(null)
        setSortDirection("asc")
        setCurrentPage(1)
    }

    const filteredTransactions = transactions
        .filter((transaction) => {
            const matchesSearch =
                transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (transaction.client && transaction.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
                transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesType =
                typeFilter === "all" ||
                (typeFilter === "income" && transaction.type === "income") ||
                (typeFilter === "expense" && transaction.type === "expense")

            const matchesProvider = providerFilter === "all" || transaction.provider === providerFilter

            return matchesSearch && matchesType && matchesProvider
        })
        .sort((a, b) => {
            if (!sortField) return 0

            if (sortField === "amount") {
                return sortDirection === "asc" ? a.amount - b.amount : b.amount - a.amount
            }

            if (sortField === "time") {
                return sortDirection === "asc" ? a.date.getTime() - b.date.getTime() : b.date.getTime() - a.date.getTime()
            }

            if (sortField === "provider") {
                const aProvider = formatProviderName(a.provider || "")
                const bProvider = formatProviderName(b.provider || "")
                return sortDirection === "asc" ? aProvider.localeCompare(bProvider) : bProvider.localeCompare(aProvider)
            }

            const aValue = String(a[sortField]).toLowerCase()
            const bValue = String(b[sortField]).toLowerCase()

            return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        })

    // Calculate summary statistics
    const totalIncome = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    const netAmount = totalIncome - totalExpense

    // Pagination logic
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case "Efectivo":
                return <Wallet className="h-4 w-4 text-green-500" />
            case "Tarjeta":
                return <CreditCard className="h-4 w-4 text-blue-500" />
            case "Transferencia":
                return <Receipt className="h-4 w-4 text-purple-500" />
            default:
                return <FileText className="h-4 w-4 text-gray-500" />
        }
    }

    return (
        <Card className="shadow-md border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Registro de Transacciones
                        </CardTitle>
                        <CardDescription>Gestiona y visualiza todas las transacciones del sistema</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchTransactions}
                            disabled={refreshing}
                            className="h-9 gap-1.5"
                        >
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
                                    <FileText className="h-4 w-4 mr-2" />
                                    Exportar a CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Exportar a Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Printer className="h-4 w-4 mr-2" />
                                    Imprimir
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Ingresos</p>
                                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCurrency(totalIncome)}</p>
                                </div>
                                <div className="bg-green-100 dark:bg-green-800/30 p-3 rounded-full">
                                    <ArrowUpToLine className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Egresos</p>
                                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">{formatCurrency(totalExpense)}</p>
                                </div>
                                <div className="bg-red-100 dark:bg-red-800/30 p-3 rounded-full">
                                    <ArrowDownToLine className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`${netAmount >= 0
                                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30"
                                : "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30"
                            }`}
                    >
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p
                                        className={`text-sm font-medium ${netAmount >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"
                                            }`}
                                    >
                                        Balance Neto
                                    </p>
                                    <p
                                        className={`text-2xl font-bold ${netAmount >= 0 ? "text-blue-700 dark:text-blue-300" : "text-amber-700 dark:text-amber-300"
                                            }`}
                                    >
                                        {formatCurrency(netAmount)}
                                    </p>
                                </div>
                                <div
                                    className={`p-3 rounded-full ${netAmount >= 0 ? "bg-blue-100 dark:bg-blue-800/30" : "bg-amber-100 dark:bg-amber-800/30"
                                        }`}
                                >
                                    <Wallet
                                        className={`h-6 w-6 ${netAmount >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"
                                            }`}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar por cliente, descripción o referencia..."
                            className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-[180px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Filtrar por tipo" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los movimientos</SelectItem>
                                <SelectItem value="income">Solo ingresos</SelectItem>
                                <SelectItem value="expense">Solo egresos</SelectItem>
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

                        {(searchTerm || typeFilter !== "all" || providerFilter !== "all" || sortField) && (
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
                                    <TableHead className="w-[40px]">
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 dark:border-slate-700"
                                                checked={selectedIds.length > 0 && selectedIds.length === currentItems.length}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        // Si no hay elementos seleccionados
                                                        if (selectedIds.length === 0) {
                                                            // Verificar si hay múltiples proveedores en los elementos actuales
                                                            const uniqueProviders = new Set(currentItems.map((item) => item.provider))

                                                            // Si hay más de un proveedor y no hay filtro de proveedor aplicado
                                                            if (uniqueProviders.size > 1 && providerFilter === "all") {
                                                                // Tomar el primer proveedor disponible
                                                                const firstProvider = currentItems[0].provider

                                                                // Filtrar solo los elementos del mismo proveedor
                                                                const sameProviderItems = currentItems.filter((item) => item.provider === firstProvider)

                                                                // Mostrar el diálogo informativo
                                                                setCurrentProviderName(formatProviderName(firstProvider))
                                                                setAttemptedProviderName("Múltiples proveedores")
                                                                setShowProviderMismatchDialog(true)

                                                                // Seleccionar solo los elementos del primer proveedor
                                                                setSelectedIds(sameProviderItems.map((t) => t.id))
                                                                onSelect?.(
                                                                    sameProviderItems.map((t) => ({
                                                                        id: t.id,
                                                                        amount: t.amount,
                                                                        paymentMethod:
                                                                            t.paymentMethod === "Efectivo"
                                                                                ? "CASH"
                                                                                : t.paymentMethod === "Tarjeta"
                                                                                    ? "CARD"
                                                                                    : "TRANSACTION",
                                                                        type: t.type,
                                                                        provider: t.provider,
                                                                    })),
                                                                )
                                                            } else {
                                                                // Si solo hay un proveedor o hay un filtro aplicado, seleccionar todos
                                                                setSelectedIds(currentItems.map((t) => t.id))
                                                                onSelect?.(
                                                                    currentItems.map((t) => ({
                                                                        id: t.id,
                                                                        amount: t.amount,
                                                                        paymentMethod:
                                                                            t.paymentMethod === "Efectivo"
                                                                                ? "CASH"
                                                                                : t.paymentMethod === "Tarjeta"
                                                                                    ? "CARD"
                                                                                    : "TRANSACTION",
                                                                        type: t.type,
                                                                        provider: t.provider,
                                                                    })),
                                                                )
                                                            }
                                                        } else {
                                                            // Si ya hay elementos seleccionados, verificar que sean del mismo proveedor
                                                            const firstSelectedTransaction = transactions.find((t) => t.id === selectedIds[0])

                                                            // Filtrar solo los elementos del mismo proveedor
                                                            const sameProviderItems = currentItems.filter(
                                                                (item) => item.provider === firstSelectedTransaction?.provider,
                                                            )

                                                            setSelectedIds(sameProviderItems.map((t) => t.id))
                                                            onSelect?.(
                                                                sameProviderItems.map((t) => ({
                                                                    id: t.id,
                                                                    amount: t.amount,
                                                                    paymentMethod:
                                                                        t.paymentMethod === "Efectivo"
                                                                            ? "CASH"
                                                                            : t.paymentMethod === "Tarjeta"
                                                                                ? "CARD"
                                                                                : "TRANSACTION",
                                                                    type: t.type,
                                                                    provider: t.provider,
                                                                })),
                                                            )
                                                        }
                                                    } else {
                                                        setSelectedIds([])
                                                        onSelect?.([])
                                                    }
                                                }}
                                            />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                        onClick={() => handleSort("time")}
                                    >
                                        <div className="flex items-center">
                                            Hora
                                            {getSortIcon("time")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                        onClick={() => handleSort("description")}
                                    >
                                        <div className="flex items-center">
                                            Descripción
                                            {getSortIcon("description")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                        onClick={() => handleSort("category")}
                                    >
                                        <div className="flex items-center">
                                            Categoría
                                            {getSortIcon("category")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                        onClick={() => handleSort("provider")}
                                    >
                                        <div className="flex items-center">
                                            Proveedor
                                            {getSortIcon("provider")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                        onClick={() => handleSort("amount")}
                                    >
                                        <div className="flex items-center">
                                            Monto
                                            {getSortIcon("amount")}
                                        </div>
                                    </TableHead>
                                    <TableHead>Método de Pago</TableHead>
                                    <TableHead>Referencia</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <TableRow key={index} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                            {Array.from({ length: 8 }).map((__, i) => (
                                                <TableCell key={i}>
                                                    <Skeleton className="h-5 w-full" />
                                                </TableCell>
                                            ))}
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Skeleton className="h-8 w-8 rounded-md" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : currentItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-10">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <Search className="h-10 w-10 mb-2 opacity-20" />
                                                <p className="text-lg font-medium">No se encontraron transacciones</p>
                                                <p className="text-sm">Intenta con otros criterios de búsqueda o limpia los filtros</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentItems.map((transaction) => (
                                        <TableRow
                                            key={transaction.id}
                                            className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${selectedIds.includes(transaction.id) ? "bg-primary/5 hover:bg-primary/10" : ""
                                                }`}
                                        >
                                            <TableCell>
                                                <div className="flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-slate-300 dark:border-slate-700"
                                                        checked={selectedIds.includes(transaction.id)}
                                                        onChange={(e) => handleSelection(transaction.id, e.target.checked)}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
                                                        <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                                                    </div>
                                                    <span>{transaction.time}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center">
                                                    <div
                                                        className={`p-1.5 rounded-full mr-2 ${transaction.type === "income"
                                                                ? "bg-green-100 dark:bg-green-900/30"
                                                                : "bg-red-100 dark:bg-red-900/30"
                                                            }`}
                                                    >
                                                        {transaction.type === "income" ? (
                                                            <ArrowUpToLine className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                                        ) : (
                                                            <ArrowDownToLine className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                                        )}
                                                    </div>
                                                    <span className="line-clamp-1">{transaction.description}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`flex items-center justify-center gap-1.5 text-sm px-3 py-1 rounded-full ${categoryMap[transaction.category]?.color ||
                                                        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                                                        }`}
                                                    variant="outline"
                                                >
                                                    {categoryMap[transaction.category]?.icon || <FileText className="h-3 w-3" />}
                                                    <span>{categoryMap[transaction.category]?.label || transaction.category}</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {transaction.provider ? (
                                                    <Badge
                                                        className={`flex items-center justify-center gap-1.5 text-sm px-3 py-1 rounded-full ${providerMap[transaction.provider]?.color ||
                                                            "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                                                            }`}
                                                        variant="outline"
                                                    >
                                                        {providerMap[transaction.provider]?.icon || <FileText className="h-3 w-3" />}
                                                        <span>{formatProviderName(transaction.provider)}</span>
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div
                                                    className={`inline-flex items-center gap-1.5 font-medium ${transaction.type === "income"
                                                            ? "text-green-600 dark:text-green-400"
                                                            : "text-red-600 dark:text-red-400"
                                                        }`}
                                                >
                                                    {transaction.type === "income" ? "+" : "-"}
                                                    {formatCurrency(transaction.amount)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getPaymentMethodIcon(transaction.paymentMethod)}
                                                    <span>{transaction.paymentMethod}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                    {transaction.reference.substring(0, 8)}...
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <Eye className="h-4 w-4" />
                                                                <span className="sr-only">Ver detalles</span>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Ver detalles</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Más opciones</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Ver detalles
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Printer className="h-4 w-4 mr-2" />
                                                            Imprimir recibo
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Descargar comprobante
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

                {/* Pagination */}
                {!loading && filteredTransactions.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 text-sm">
                        <div className="text-muted-foreground">
                            Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransactions.length)} de{" "}
                            {filteredTransactions.length} transacciones
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-white dark:bg-slate-950"
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                                title="Primera página"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                                <span className="sr-only">Primera página</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-white dark:bg-slate-950"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                title="Página anterior"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Página anterior</span>
                            </Button>

                            <div className="flex items-center gap-1 mx-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNumber: number
                                    if (totalPages <= 5) {
                                        pageNumber = i + 1
                                    } else if (currentPage <= 3) {
                                        pageNumber = i + 1
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNumber = totalPages - 4 + i
                                    } else {
                                        pageNumber = currentPage - 2 + i
                                    }

                                    return (
                                        <Button
                                            key={i}
                                            variant={currentPage === pageNumber ? "default" : "outline"}
                                            size="icon"
                                            className={`h-8 w-8 ${currentPage !== pageNumber ? "bg-white dark:bg-slate-950" : ""}`}
                                            onClick={() => handlePageChange(pageNumber)}
                                        >
                                            {pageNumber}
                                        </Button>
                                    )
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-white dark:bg-slate-950"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                title="Página siguiente"
                            >
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">Página siguiente</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-white dark:bg-slate-950"
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                title="Última página"
                            >
                                <ChevronsRight className="h-4 w-4" />
                                <span className="sr-only">Última página</span>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Provider Mismatch Dialog */}
            <Dialog open={showProviderMismatchDialog} onOpenChange={setShowProviderMismatchDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-700">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            Proveedores diferentes
                        </DialogTitle>
                        <DialogDescription className="text-amber-600">
                            No es posible seleccionar transacciones de diferentes proveedores en un mismo cierre.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/30 dark:bg-amber-900/20 my-2">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Proveedor actual:</span>
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" variant="outline">
                                    {currentProviderName || "Ninguno"}
                                </Badge>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm">Proveedor intentado:</span>
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" variant="outline">
                                    {attemptedProviderName || "Ninguno"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-center">
                        <Button type="button" onClick={() => setShowProviderMismatchDialog(false)} className="w-full sm:w-auto">
                            Entendido
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
