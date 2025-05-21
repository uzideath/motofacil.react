"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { HttpService } from "@/lib/http"
import type { Installment } from "../utils/types"

export function useInstallmentActions(refreshInstallments: () => void, openPdfViewer?: (url: string) => void) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
    const [selectedAttachmentUrl, setSelectedAttachmentUrl] = useState("")
    const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState<Installment | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [editingInstallment, setEditingInstallment] = useState<Installment | null>(null)
    const [isEditFormOpen, setIsEditFormOpen] = useState(false)
    const { toast } = useToast()

    const handlePrint = async (installment: Installment) => {
        setIsGenerating(true)
        try {
            const res = await HttpService.post(
                "/api/v1/receipt",
                {
                    name: installment.userName,
                    identification: installment.motorcycle.plate,
                    concept: `Monto`,
                    amount: installment.amount,
                    latePaymentDate: installment.latePaymentDate,
                    gps: installment.gps,
                    total: installment.amount + (installment.gps || 0),
                    date: installment.date,
                    receiptNumber: installment.id,
                },
                {
                    responseType: "blob",
                    headers: {
                        Accept: "application/pdf",
                    },
                },
            )

            // Create a blob from the PDF Stream with explicit PDF MIME type
            // Even if the server doesn't set the correct content type, we'll force it here
            const blob = new Blob([res.data], { type: "application/pdf" })

            // Create a URL for the blob
            const fileURL = URL.createObjectURL(blob)

            if (openPdfViewer) {
                openPdfViewer(fileURL)
            } else {
                // Fallback to opening in a new tab
                const newWindow = window.open()
                if (newWindow) {
                    newWindow.document.write(
                        `<iframe src="${fileURL}" width="100%" height="100%" style="border: none;"></iframe>`,
                    )
                } else {
                    window.open(fileURL, "_blank")
                }
            }

            toast({
                title: "Recibo generado",
                description: "El recibo se ha generado correctamente",
                variant: "default",
            })
        } catch (error) {
            console.error("Error al imprimir el recibo:", error)
            toast({
                variant: "destructive",
                title: "Error al imprimir",
                description: "No se pudo generar o imprimir el recibo. Verifique la conexión con el servidor.",
            })
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSendWhatsapp = async (installment: Installment) => {
        try {
            const phoneNumber = `+57${installment.loan?.user?.phone}`

            if (!phoneNumber) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No se encontró un número de teléfono para este cliente",
                })
                return
            }

            setIsGenerating(true)

            const receiptData = {
                phoneNumber,
                name: installment.userName,
                identification: installment.motorcycle.plate,
                concept: `Monto`,
                amount: installment.amount,
                latePaymentDate: installment.latePaymentDate,
                gps: installment.gps,
                total: installment.amount,
                date: installment.date,
                receiptNumber: installment.id,
                caption: `Recibo de pago - ${installment.userName}`,
            }

            await HttpService.post("/api/v1/receipt/whatsapp", receiptData)

            setSuccessMessage(`El recibo ha sido enviado exitosamente a ${installment.userName} por WhatsApp.`)
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

            await HttpService.delete(`/api/v1/installments/${deleteConfirmation.id}`)

            toast({
                title: "Cuota eliminada",
                description: "La cuota ha sido eliminada correctamente",
                variant: "default",
            })

            refreshInstallments()
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
        handlePrint,
        handleSendWhatsapp,
        handleViewAttachment,
        handleEdit,
        handleDelete,
        confirmDelete,
    }
}
