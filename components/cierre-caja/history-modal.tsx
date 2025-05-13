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

type Props = {
    open: boolean
    onClose: () => void
    payments: Payment[]
}

export function CashRegisterDetailModal({ open, onClose, payments }: Props) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalle de Pagos del Cierre</DialogTitle>
                </DialogHeader>

                <div className="overflow-x-auto">
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
                                    <TableCell>
                                        {p.paymentMethod === "CASH" && "Efectivo"}
                                        {p.paymentMethod === "TRANSACTION" && "Transferencia"}
                                        {p.paymentMethod === "CARD" && "Tarjeta"}
                                    </TableCell>
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
            </DialogContent>
        </Dialog>
    )
}
