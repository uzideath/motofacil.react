"use client"

import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

import { User, Car, DollarSign, BadgeCent, Calendar, AlertTriangle, CheckCircle2, StickyNote } from 'lucide-react'
import { CreditCard, FileText } from 'lucide-react'
import { getPaymentMethodIcon, formatSpanishDate, getPaymentMethodLabel } from "../utils/format"
import { ActionsMenu } from "./actions"
import { NoteDisplay } from "./dialogs/note-display"
import { Installment } from "@/lib/types"

interface InstallmentRowProps {
    installment: Installment
    onViewAttachment: (installment: Installment) => void
    onSendWhatsapp: (installment: Installment) => void
    onPrint: (installment: Installment) => void
    onEdit: (installment: Installment) => void
    onDelete: (installment: Installment) => void
    onViewNotes?: (notes: string) => void
}

export function InstallmentRow({
    installment,
    onViewAttachment,
    onSendWhatsapp,
    onPrint,
    onEdit,
    onDelete,
    onViewNotes,
}: InstallmentRowProps) {
    const getIcon = (method: string) => {
        const iconName = getPaymentMethodIcon(method)
        switch (iconName) {
            case "Banknote":
                return <FileText className="mr-2 h-4 w-4 text-green-400" />
            case "CreditCard":
                return <CreditCard className="mr-2 h-4 w-4 text-blue-400" />
            case "FileText":
                return <FileText className="mr-2 h-4 w-4 text-purple-400" />
            default:
                return null
        }
    }

    return (
        <TableRow className="border-dark-blue-800/30 hover:bg-dark-blue-800/30 transition-colors duration-150">
            <TableCell className="font-medium text-white">
                <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-blue-300/70" />
                    {installment.loan.user.name}
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell text-blue-200">
                <div className="flex items-center">
                    <Car className="mr-2 h-4 w-4 text-blue-300/70" />
                    {installment.loan.vehicle?.model || installment.loan.motorcycle?.model || "—"}
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell text-blue-200">
                <div className="flex items-center">
                    <Car className="mr-2 h-4 w-4 text-blue-300/70" />
                    {installment.loan.vehicle?.plate || installment.loan.motorcycle?.plate || "—"}
                </div>
            </TableCell>
            <TableCell className="text-blue-200 font-medium">
                <div className="flex items-center">
                    <DollarSign className="mr-1 h-4 w-4 text-green-400" />
                    {formatCurrency(installment.amount)}
                </div>
            </TableCell>
            <TableCell className="text-blue-200 font-medium">
                <div className="flex items-center">
                    <BadgeCent className="mr-1 h-4 w-4 text-yellow-400" />
                    {formatCurrency(installment.gps)}
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell text-blue-200">
                <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-blue-300/70" />
                    {formatSpanishDate(installment.paymentDate)}
                </div>
            </TableCell>
            <TableCell className="text-blue-200">
                <div className="flex items-center whitespace-nowrap">
                    {getIcon(installment.paymentMethod)}
                    {getPaymentMethodLabel(installment.paymentMethod)}
                </div>
            </TableCell>
            <TableCell className="text-center">
                {installment.isLate ? (
                    <Badge
                        variant="destructive"
                        className="bg-red-500/80 hover:bg-red-500/70 inline-flex items-center justify-center gap-1 px-2.5 py-0.5 text-xs font-medium"
                    >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        <span>Atrasada</span>
                    </Badge>
                ) : (
                    <Badge
                        variant="default"
                        className="bg-green-500/80 hover:bg-green-500/70 inline-flex items-center justify-center gap-1 px-2.5 py-0.5 text-xs font-medium"
                    >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        <span>A tiempo</span>
                    </Badge>
                )}
            </TableCell>
            <TableCell className="hidden md:table-cell text-blue-200">
                <div className="flex items-center">
                    <StickyNote className="mr-2 h-4 w-4 text-blue-300/70" />
                    <NoteDisplay
                        notes={installment.notes || ""}
                        maxLength={30}
                        onViewMore={() => onViewNotes && onViewNotes(installment.notes || "")}
                    />
                </div>
            </TableCell>
            <TableCell className="text-blue-200">
                <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-blue-400" />
                    {installment.createdBy?.name ?? "—"}
                </div>
            </TableCell>
            <TableCell className="text-right">
                <ActionsMenu
                    installment={installment}
                    onViewAttachment={onViewAttachment}
                    onSendWhatsapp={onSendWhatsapp}
                    onPrint={onPrint}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </TableCell>
        </TableRow>
    )
}
