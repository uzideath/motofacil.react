"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TableCell, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatCurrency } from "@/lib/utils"
import {
    ArrowDownToLine,
    ArrowUpToLine,
    Calendar,
    Download,
    Eye,
    FileText,
    MoreHorizontal,
    Printer,
} from "lucide-react"
import { Transaction } from "../constants/types"
import { CATEGORY_DETAILS, PAYMENT_METHOD_ICONS, PROVIDER_DETAILS, TRANSACTION_TYPE_STYLES } from "../constants"
import { formatProviderName } from "../utils/formatters"


interface TransactionItemProps {
    transaction: Transaction
    isSelected: boolean
    onSelect: (id: string, checked: boolean) => void
}

export function TransactionItem({ transaction, isSelected, onSelect }: TransactionItemProps) {
    // Get category details
    const categoryDetails = CATEGORY_DETAILS[transaction.category as keyof typeof CATEGORY_DETAILS] || {
        label: transaction.category,
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
        icon: FileText,
    }

    // Get provider details if available
    const providerDetails = transaction.provider
        ? PROVIDER_DETAILS[transaction.provider.name as unknown as keyof typeof PROVIDER_DETAILS] || {
            label: formatProviderName(transaction.provider.name),
            color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
            icon: FileText,
        }
        : null

    // Get payment method icon
    const paymentMethodIcon =
        PAYMENT_METHOD_ICONS[transaction.paymentMethod as keyof typeof PAYMENT_METHOD_ICONS] || PAYMENT_METHOD_ICONS.DEFAULT

    // Get transaction type styles
    const typeStyles = TRANSACTION_TYPE_STYLES[transaction.type]

    const CategoryIcon = categoryDetails.icon
    const ProviderIcon = providerDetails?.icon || FileText
    const PaymentIcon = paymentMethodIcon.icon

    return (
        <TableRow
            className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${isSelected ? "bg-primary/5 hover:bg-primary/10" : ""
                }`}
        >
            <TableCell>
                <div className="flex items-center justify-center">
                    <input
                        type="checkbox"
                        className="rounded border-slate-300 dark:border-slate-700"
                        checked={isSelected}
                        onChange={(e) => onSelect(transaction.id, e.target.checked)}
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
                    <div className={`p-1.5 rounded-full mr-2 ${typeStyles.iconBg}`}>
                        {transaction.type === "income" ? (
                            <ArrowUpToLine className={`h-3.5 w-3.5 ${typeStyles.iconColor}`} />
                        ) : (
                            <ArrowDownToLine className={`h-3.5 w-3.5 ${typeStyles.iconColor}`} />
                        )}
                    </div>
                    <span className="line-clamp-1">{transaction.description}</span>
                </div>
            </TableCell>
            <TableCell>
                <Badge
                    className={`flex items-center justify-center gap-1.5 text-sm px-3 py-1 rounded-full ${categoryDetails.color}`}
                    variant="outline"
                >
                    <CategoryIcon className="h-3 w-3" />
                    <span>{categoryDetails.label}</span>
                </Badge>
            </TableCell>
            <TableCell>
                {providerDetails ? (
                    <Badge
                        className={`flex items-center justify-center gap-1.5 text-sm px-3 py-1 rounded-full ${providerDetails.color}`}
                        variant="outline"
                    >
                        <ProviderIcon className="h-3 w-3" />
                        <span>{providerDetails.label}</span>
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">—</span>
                )}
            </TableCell>
            <TableCell>
                <div className={`inline-flex items-center gap-1.5 font-medium ${typeStyles.textColor}`}>
                    {transaction.type === "income" ? "+" : "-"}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>{formatCurrency(transaction.amount)}</span>
                            </TooltipTrigger>
                            {transaction.type === "income" &&
                                transaction.baseAmount !== undefined &&
                                transaction.gpsAmount !== undefined && (
                                    <TooltipContent>
                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between gap-4">
                                                <span>Cuota base:</span>
                                                <span className="font-medium">{formatCurrency(transaction.baseAmount)}</span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span>GPS:</span>
                                                <span className="font-medium">{formatCurrency(transaction.gpsAmount)}</span>
                                            </div>
                                            <div className="flex justify-between gap-4 border-t pt-1 font-medium">
                                                <span>Total:</span>
                                                <span>{formatCurrency(transaction.amount)}</span>
                                            </div>
                                        </div>
                                    </TooltipContent>
                                )}
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <PaymentIcon className={`h-4 w-4 ${paymentMethodIcon.color}`} />
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
    )
}
