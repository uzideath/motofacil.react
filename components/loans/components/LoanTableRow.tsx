"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatCurrency, cn } from "@/lib/utils"
import {
    User,
    Bike,
    DollarSign,
    CalendarDays,
    Wallet,
    Hash,
    Tag,
    CalendarIcon,
    Percent,
    Eye,
    CreditCard,
    Printer,
    Edit,
    Trash2,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Archive,
    ArchiveRestore,
} from "lucide-react"

import { LoanDetails } from "../loan-details"
import { InstallmentForm } from "../../installments/components/forms/installment-form"
import { LoanForm } from "../LoanForm"
import { Loan } from "@/lib/types"


interface LoanTableRowProps {
    loan: Loan
    index: number
    onDelete: (id: string) => void
    onArchive: (id: string, archived: boolean) => void
    onPrintContract: (loan: Loan) => void
}

export function LoanTableRow({ loan, index, onDelete, onArchive, onPrintContract }: LoanTableRowProps) {
    const getStatusBadge = (status: string, archived: boolean) => {
        if (archived) {
            return (
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1">
                    <Archive className="h-3 w-3" />
                    <span>Archivado</span>
                </Badge>
            )
        }

        switch (status) {
            case "ACTIVE":
                return (
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Activo</span>
                    </Badge>
                )
            case "COMPLETED":
                return (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Completado</span>
                    </Badge>
                )
            case "DEFAULTED":
                return (
                    <Badge className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        <span>Incumplido</span>
                    </Badge>
                )
            case "PENDING":
                return (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>Pendiente</span>
                    </Badge>
                )
            default:
                return <Badge>{status}</Badge>
        }
    }

    const getPaymentFrequencyText = (frequency: string) => {
        switch (frequency) {
            case "DAILY":
                return "Diario"
            case "WEEKLY":
                return "Semanal"
            case "BIWEEKLY":
                return "Quincenal"
            case "MONTHLY":
                return "Mensual"
            default:
                return frequency
        }
    }

    return (
        <TableRow
            key={`loan-row-${loan.id}-${index}`}
            className={cn(
                "border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-950/20",
                loan.archived && "bg-orange-50/30 dark:bg-orange-950/10",
            )}
        >
            <TableCell>
                <div className="font-medium flex items-center gap-1.5">
                    <User className="h-4 w-4 text-blue-500" />
                    {loan.user.name}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Hash className="h-3 w-3 text-gray-400" />
                    {loan.user.identification}
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-1.5">
                    <Bike className="h-4 w-4 text-indigo-500" />
                    {loan.motorcycle.model}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Tag className="h-3 w-3 text-gray-400" />
                    {loan.motorcycle.plate}
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell font-medium">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(loan.totalAmount)}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <CalendarIcon className="h-3 w-3 text-gray-400" />
                    {getPaymentFrequencyText(loan.paymentFrequency || "DAILY")}
                </div>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-2">
                    <div className="text-sm flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">
                            {loan.paidInstallments} / {loan.installments}
                        </span>
                    </div>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1.5">
                    <div
                        className={cn(
                            "h-full rounded-full",
                            loan.status === "COMPLETED" ? "bg-green-500" : loan.status === "DEFAULTED" ? "bg-red-500" : "bg-blue-500",
                        )}
                        style={{
                            width: `${(loan.paidInstallments / loan.installments) * 100}%`,
                        }}
                    />
                </div>
            </TableCell>
            <TableCell className="hidden lg:table-cell font-medium">
                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                    <Wallet className="h-4 w-4" />
                    {formatCurrency(loan.debtRemaining)}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Percent className="h-3 w-3 text-gray-400" />
                    Interés: {loan.interestRate}%
                </div>
            </TableCell>
            <TableCell>{getStatusBadge(loan.status, loan.archived)}</TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div key={`view-wrapper-${loan.id}-${index}`}>
                                    <LoanDetails loanId={loan.id} loanData={loan}>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 dark:hover:text-blue-300"
                                        >
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">Ver</span>
                                        </Button>
                                    </LoanDetails>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Ver detalles</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {!loan.archived && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div key={`pay-wrapper-${loan.id}-${index}`}>
                                        <InstallmentForm loanId={loan.id}>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="border-green-200 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 dark:hover:text-green-300"
                                            >
                                                <CreditCard className="h-4 w-4" />
                                                <span className="sr-only">Pagar</span>
                                            </Button>
                                        </InstallmentForm>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Registrar pago</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onPrintContract(loan)}
                                    className="border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40 dark:hover:text-purple-300"
                                >
                                    <Printer className="h-4 w-4" />
                                    <span className="sr-only">Generar contrato</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Generar contrato</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {!loan.archived && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div key={`edit-wrapper-${loan.id}-${index}`}>
                                        <LoanForm loanId={loan.id} loanData={loan}>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 dark:hover:text-blue-300"
                                            >
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">Editar</span>
                                            </Button>
                                        </LoanForm>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Editar préstamo</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onArchive(loan.id, loan.archived)}
                                    className={
                                        loan.archived
                                            ? "border-green-200 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 dark:hover:text-green-300"
                                            : "border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40 dark:hover:text-orange-300"
                                    }
                                >
                                    {loan.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                                    <span className="sr-only">{loan.archived ? "Desarchivar" : "Archivar"}</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{loan.archived ? "Desarchivar préstamo" : "Archivar préstamo"}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onDelete(loan.id)}
                                    className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-300"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Eliminar</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Eliminar préstamo</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </TableCell>
        </TableRow>
    )
}
