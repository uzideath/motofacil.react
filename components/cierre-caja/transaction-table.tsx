"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Eye, ArrowUpToLine } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HttpService } from "@/lib/http"


type Installment = {
    id: string
    paymentDate: string
    paymentMethod: "CASH" | "CARD" | "TRANSACTION"
    amount: number
    loan: {
        user: { name: string }
        motorcycle: { plate: string }
    }
}

type SelectedInstallment = {
    id: string
    amount: number
    paymentMethod: "CASH" | "CARD" | "TRANSACTION"
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
}

type Props = {
    token: string
    onSelect?: (installments: SelectedInstallment[]) => void
}

export function TransactionTable({ token, onSelect }: Props) {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await HttpService.get<Installment[]>("/api/v1/closing/available-payments", {
                    headers: { Authorization: token ? `Bearer ${token}` : "" },
                })

                const formatted: Transaction[] = res.data.map((i) => ({
                    id: i.id,
                    time: new Date(i.paymentDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    description: `Pago cuota - ${i.loan.user.name}`,
                    category: "Cuota de préstamo",
                    amount: i.amount,
                    paymentMethod: mapPaymentLabel(i.paymentMethod),
                    type: "income",
                    reference: i.id,
                    client: i.loan.user.name,
                }))

                setTransactions(formatted)
            } catch (err) {
                console.error("Error cargando transacciones:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchTransactions()
    }, [token])

    const mapPaymentLabel = (key: string) => {
        switch (key) {
            case "CASH": return "Efectivo"
            case "CARD": return "Tarjeta"
            case "TRANSACTION": return "Transferencia"
            default: return "Otro"
        }
    }

    const handleSelection = (id: string, checked: boolean) => {
        const updated = checked
            ? [...selectedIds, id]
            : selectedIds.filter((x) => x !== id)

        setSelectedIds(updated)

        const selectedInstallments: SelectedInstallment[] = transactions
            .filter((t) => updated.includes(t.id))
            .map((t) => ({
                id: t.id,
                amount: t.amount,
                paymentMethod:
                    t.paymentMethod === "Efectivo"
                        ? "CASH"
                        : t.paymentMethod === "Tarjeta"
                            ? "CARD"
                            : "TRANSACTION",
            }))


        onSelect?.(selectedInstallments)
    }


    const filteredTransactions = transactions.filter((transaction) => {
        const matchesSearch =
            transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (transaction.client && transaction.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
            transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesType =
            typeFilter === "all" ||
            (typeFilter === "income" && transaction.type === "income") ||
            (typeFilter === "expense" && transaction.type === "expense")

        return matchesSearch && matchesType
    })

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 w-full sm:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por cliente, descripción o referencia..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filtrar por tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los movimientos</SelectItem>
                            <SelectItem value="income">Solo ingresos</SelectItem>
                            <SelectItem value="expense">Solo egresos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead />
                                <TableHead>Hora</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Método de Pago</TableHead>
                                <TableHead>Referencia</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={index}>
                                        {Array.from({ length: 7 }).map((__, i) => (
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
                            ) : filteredTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">
                                        No se encontraron transacciones
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTransactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(transaction.id)}
                                                onChange={(e) => handleSelection(transaction.id, e.target.checked)}
                                            />
                                        </TableCell>
                                        <TableCell>{transaction.time}</TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center">
                                                <ArrowUpToLine className="h-4 w-4 text-green-500 mr-2" />
                                                {transaction.description}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{transaction.category}</Badge>
                                        </TableCell>
                                        <TableCell className="text-green-500 font-medium">
                                            {formatCurrency(transaction.amount)}
                                        </TableCell>
                                        <TableCell>{transaction.paymentMethod}</TableCell>
                                        <TableCell>
                                            <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                                {transaction.reference}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">Ver detalles</span>
                                            </Button>
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
