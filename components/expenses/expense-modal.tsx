"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle, Receipt, FileEdit } from "lucide-react"
import { ExpenseForm } from "./ExpenseForm"
import { Expense } from "@/lib/types"

interface ExpenseModalProps {
    onSuccess?: () => void
    children?: React.ReactNode
    expenseData?: Expense
    isEditing?: boolean
}

export function ExpenseModal({ onSuccess, children, expenseData, isEditing = false }: ExpenseModalProps) {
    const [open, setOpen] = useState(false)

    const handleSuccess = () => {
        setOpen(false)
        if (onSuccess) {
            onSuccess()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white shadow-sm hover:shadow-md transition-all">
                        {isEditing ? (
                            <>
                                <FileEdit className="mr-2 h-4 w-4" />
                                Editar Egreso
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Nuevo Egreso
                            </>
                        )}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-600 to-sky-500 p-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                            <Receipt className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-white">
                                {isEditing ? "Editar Egreso" : "Registrar Nuevo Egreso"}
                            </DialogTitle>
                            <DialogDescription className="text-blue-100">
                                {isEditing
                                    ? "Modifique la información del egreso seleccionado"
                                    : "Complete el formulario para registrar un nuevo egreso en el sistema"}
                            </DialogDescription>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <ExpenseForm onSuccess={handleSuccess} isModal={true} expenseData={expenseData} isEditing={isEditing} />
                </div>
            </DialogContent>
        </Dialog>
    )
}
