"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { ExpenseForm } from "./expense-form"

interface ExpenseModalProps {
    onSuccess?: () => void
}

export function ExpenseModal({ onSuccess }: ExpenseModalProps) {
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
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Egreso
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] md:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Registrar Nuevo Egreso</DialogTitle>
                    <DialogDescription>Complete el formulario para registrar un nuevo egreso en el sistema.</DialogDescription>
                </DialogHeader>
                <ExpenseForm onSuccess={handleSuccess} isModal={true} />
            </DialogContent>
        </Dialog>
    )
}
