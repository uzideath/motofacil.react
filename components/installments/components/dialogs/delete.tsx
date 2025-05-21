"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Trash2 } from "lucide-react"
import { Installment } from "../../utils/types"

interface DeleteDialogProps {
    installment: Installment | null
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    isDeleting: boolean
}

export function DeleteDialog({ installment, isOpen, onOpenChange, onConfirm, isDeleting }: DeleteDialogProps) {
    if (!installment) return null

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-dark-blue-900 border-red-600/30 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-red-400 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Confirmar eliminación
                    </DialogTitle>
                    <DialogDescription className="text-blue-100">
                        ¿Estás seguro de que deseas eliminar la cuota de {installment.userName}?
                        <p className="mt-2 font-semibold">Esta acción no se puede deshacer.</p>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-blue-500/30 text-blue-300 hover:bg-dark-blue-800"
                        disabled={isDeleting}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white" disabled={isDeleting}>
                        {isDeleting ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Eliminando...
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
