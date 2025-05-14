"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { es } from "date-fns/locale/es"

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

type Props = {
    open: boolean
    onClose: () => void
    payments: Payment[]
    expenses: Expense[]
}

export function CashRegisterDetailModal({ open, onClose, payments, expenses }: Props) {
    const formatMethod = (method: string) => {
        switch (method) {
            case "CASH":
                return "Efectivo"
            case "TRANSACTION":
                return "Transferencia"
            case "CARD":
                return "Tarjeta"
            default:
                return method
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Detalle del Cierre de Caja</DialogTitle>
                </DialogHeader>

                {/* Pagos (Ingresos) */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Pagos Registrados</h3>
                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Método</TableHead>
                                    <TableHead>Monto</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Tardío</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell>{formatMethod(p.paymentMethod)}</TableCell>
                                        <TableCell>{formatCurrency(p.amount)}</TableCell>
                                        <TableCell>{format(new Date(p.paymentDate), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                                        <TableCell>
                                            {p.isLate ? (
                                                <Badge variant="destructive">Sí</Badge>
                                            ) : (
                                                <Badge className="bg-green-100 text-green-800">No</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Egresos */}
                <div className="space-y-2 mt-6">
                    <h3 className="text-lg font-semibold">Egresos Asociados</h3>
                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Método</TableHead>
                                    <TableHead>Monto</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Beneficiario</TableHead>
                                    <TableHead>Referencia</TableHead>
                                    <TableHead>Descripción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map((e) => (
                                    <TableRow key={e.id}>
                                        <TableCell>{formatMethod(e.paymentMethod)}</TableCell>
                                        <TableCell>{formatCurrency(e.amount)}</TableCell>
                                        <TableCell>{format(new Date(e.date), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{e.category}</Badge>
                                        </TableCell>
                                        <TableCell>{e.beneficiary}</TableCell>
                                        <TableCell>
                                            <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                                {e.reference || "-"}
                                            </span>
                                        </TableCell>
                                        <TableCell>{e.description}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
