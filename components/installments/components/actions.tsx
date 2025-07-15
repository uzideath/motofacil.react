"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Eye, Edit, Trash2, Printer } from "lucide-react"
import { WhatsAppIcon } from "../icons/whatsapp"
import { Installment } from "@/lib/types"

interface ActionsMenuProps {
    installment: Installment
    onViewAttachment?: (installment: Installment) => void
    onSendWhatsapp: (installment: Installment) => void
    onPrint: (installment: Installment) => void
    onEdit: (installment: Installment) => void
    onDelete: (installment: Installment) => void
}

export function ActionsMenu({
    installment,
    onViewAttachment,
    onSendWhatsapp,
    onPrint,
    onEdit,
    onDelete,
}: ActionsMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-blue-300 hover:text-white hover:bg-dark-blue-800/70"
                >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Opciones</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="bg-dark-blue-800/80 backdrop-blur-md border-dark-blue-700 text-white z-50"
                sideOffset={5}
            >
                {installment.attachmentUrl && onViewAttachment && (
                    <DropdownMenuItem
                        onClick={() => onViewAttachment(installment)}
                        className="flex items-center gap-2 focus:bg-dark-blue-700/90 cursor-pointer"
                    >
                        <Eye className="h-4 w-4 text-purple-400" />
                        Ver comprobante
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem
                    onClick={() => onSendWhatsapp(installment)}
                    className="flex items-center gap-2 focus:bg-dark-blue-700/90 cursor-pointer"
                >
                    <WhatsAppIcon className="h-4 w-4 text-green-400" />
                    Enviar por WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onPrint(installment)}
                    className="flex items-center gap-2 focus:bg-dark-blue-700/90 cursor-pointer"
                >
                    <Printer className="h-4 w-4 text-blue-400" />
                    Imprimir recibo
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onEdit(installment)}
                    className="flex items-center gap-2 focus:bg-dark-blue-700/90 cursor-pointer"
                >
                    <Edit className="h-4 w-4 text-amber-400" />
                    Editar cuota
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onDelete(installment)}
                    className="flex items-center gap-2 focus:bg-dark-blue-700/90 cursor-pointer text-red-400"
                >
                    <Trash2 className="h-4 w-4" />
                    Eliminar cuota
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
