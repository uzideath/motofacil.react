"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { HttpService } from "@/lib/http"
import { utcToZonedTime, format } from "date-fns-tz"
import { Installment } from "@/lib/types"

export function useInstallmentActions(refreshInstallments: () => void) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
    const [selectedAttachmentUrl, setSelectedAttachmentUrl] = useState("")
    const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState<Installment | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [editingInstallment, setEditingInstallment] = useState<Installment | null>(null)
    const [isEditFormOpen, setIsEditFormOpen] = useState(false)
    const [selectedNotes, setSelectedNotes] = useState<string>("")
    const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false)
    const { toast } = useToast()

    const handlePrint = async (installment: Installment) => {
        setIsGenerating(true)

        console.table({
            paymentDate: installment.paymentDate,
            asString: String(installment.paymentDate),
            iso: new Date(installment.paymentDate).toISOString(),
        })

        const payload = {
            name: installment.loan.user.name.trim(),
            identification: installment.loan.motorcycle.plate,
            concept: "Monto",
            amount: installment.amount,
            latePaymentDate: installment.latePaymentDate,
            gps: installment.gps,
            total: installment.amount + (installment.gps || 0),
            date: installment.paymentDate,
            paymentDate: installment.latePaymentDate || installment.paymentDate,
            notes: installment.notes,
            receiptNumber: installment.id,
        }


        console.table(payload)

        try {
            const res = await HttpService.post("/api/v1/receipt", payload, {
                responseType: "blob",
                headers: {
                    Accept: "application/pdf",
                },
            })

            const blob = new Blob([res.data], { type: "application/pdf" })
            const fileURL = URL.createObjectURL(blob)

            const printWindow = window.open(fileURL, "_blank")

            if (!printWindow) {
                toast({
                    variant: "destructive",
                    title: "Ventana bloqueada",
                    description: "Por favor, permita ventanas emergentes para imprimir el recibo",
                })
                throw new Error("No se pudo abrir la ventana de impresión")
            }

            printWindow.addEventListener("load", () => {
                setTimeout(() => {
                    printWindow.print()
                }, 1000) // pequeña pausa para asegurar carga completa
            })

            toast({
                title: "Recibo generado",
                description: "El recibo se ha enviado a la impresora",
                variant: "default",
            })
        } catch (error) {
            console.error("Error al imprimir el recibo:", error)
            toast({
                variant: "destructive",
                title: "Error al imprimir",
                description: "No se pudo generar o imprimir el recibo",
            })
        } finally {
            setIsGenerating(false)
        }
    }


    const handleSendWhatsapp = async (installment: Installment) => {
        try {
            // Get the phone number from the installment data
            const phoneNumber = `+57${installment.loan.user.phone}`

            if (!phoneNumber) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No se encontró un número de teléfono para este cliente",
                })
                return
            }

            setIsGenerating(true)

            // Prepare the receipt data
            const receiptData = {
                phoneNumber,
                name: installment.loan.user.name,
                identification: installment.loan.motorcycle.plate,
                concept: `Monto`,
                amount: installment.amount,
                latePaymentDate: installment.latePaymentDate,
                gps: installment.gps,
                total: installment.amount,
                date: installment.createdAt,
                receiptNumber: installment.id,
                caption: `Recibo de pago - ${installment.loan.user.name}`,
            }

            // Send the request to the whatsapp endpoint
            await HttpService.post("/api/v1/receipt/whatsapp", receiptData)

            // Show success dialog
            setSuccessMessage(`El recibo ha sido enviado exitosamente a ${installment.loan.user.name} por WhatsApp.`)
            setIsSuccessDialogOpen(true)
        } catch (error) {
            console.error("Error al enviar el recibo por WhatsApp:", error)
            toast({
                variant: "destructive",
                title: "Error al enviar",
                description: "No se pudo enviar el recibo por WhatsApp",
            })
        } finally {
            setIsGenerating(false)
        }
    }

    const handleViewAttachment = (installment: Installment) => {
        const attachmentUrl = installment.attachmentUrl || ""
        if (attachmentUrl) {
            setSelectedAttachmentUrl(attachmentUrl)
            setIsAttachmentDialogOpen(true)
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No hay comprobante adjunto para esta cuota",
            })
        }
    }

    const handleViewNotes = (notes: string) => {
        setSelectedNotes(notes)
        setIsNotesDialogOpen(true)
    }

    const handleEdit = (installment: Installment) => {
        setEditingInstallment(installment)
        setIsEditFormOpen(true)
        document.getElementById("edit-form-trigger")?.click()
    }

    const handleDelete = (installment: Installment) => {
        setDeleteConfirmation(installment)
    }

    const confirmDelete = async () => {
        if (!deleteConfirmation) return

        try {
            setIsDeleting(true)

            // Llamada a la API para eliminar la cuota
            await HttpService.delete(`/api/v1/installments/${deleteConfirmation.id}`)

            toast({
                title: "Cuota eliminada",
                description: "La cuota ha sido eliminada correctamente",
                variant: "default",
            })

            // Refresh the installments list
            refreshInstallments()

            // Cerrar el diálogo de confirmación
            setDeleteConfirmation(null)
        } catch (error) {
            console.error("Error al eliminar la cuota:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo eliminar la cuota",
            })
        } finally {
            setIsDeleting(false)
        }
    }

    return {
        isGenerating,
        successMessage,
        isSuccessDialogOpen,
        setIsSuccessDialogOpen,
        selectedAttachmentUrl,
        isAttachmentDialogOpen,
        setIsAttachmentDialogOpen,
        deleteConfirmation,
        setDeleteConfirmation,
        isDeleting,
        editingInstallment,
        setEditingInstallment,
        isEditFormOpen,
        setIsEditFormOpen,
        selectedNotes,
        isNotesDialogOpen,
        setIsNotesDialogOpen,
        handlePrint,
        handleSendWhatsapp,
        handleViewAttachment,
        handleViewNotes,
        handleEdit,
        handleDelete,
        confirmDelete,
    }
}

export function formatToColombiaTime(date: string | Date) {
    const timeZone = "America/Bogota"
    const zonedDate = utcToZonedTime(date, timeZone)
    return format(zonedDate, "yyyy-MM-dd HH:mm:ss", { timeZone })
}
