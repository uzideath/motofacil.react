"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { HttpService } from "@/lib/http"
import { Loan } from "@/lib/types"

export function useLoanTable() {
    const [loans, setLoans] = useState<Loan[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [refreshKey, setRefreshKey] = useState(0)
    const [printingContract, setPrintingContract] = useState(false)
    const [printProgress, setPrintProgress] = useState(0)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
    const [loanToDelete, setLoanToDelete] = useState<string | null>(null)
    const [loanToArchive, setLoanToArchive] = useState<{ id: string; archived: boolean } | null>(null)
    const [showArchived, setShowArchived] = useState(false)

    const { toast } = useToast()

    const fetchLoans = async () => {
        try {
            setLoading(true)
            const token = document.cookie
                .split("; ")
                .find((c) => c.startsWith("authToken="))
                ?.split("=")[1]
            const response = await HttpService.get<any[]>("/api/v1/loans", {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
            })
            const mappedLoans: Loan[] = response.data.map((loan) => ({
                ...loan,
                userName: loan.user?.name ?? "Sin nombre",
                motorcycleModel: loan.motorcycle?.model ?? "Sin modelo",
                archived: loan.archived ?? false, // Default to false if not provided
            }))
            setLoans(mappedLoans)
        } catch (error) {
            console.error("Error al obtener arrendamientos:", error)
            toast({
                variant: "destructive",
                title: "Error al cargar datos",
                description: "No se pudieron obtener los arrendamientos del servidor",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLoans()
    }, [refreshKey])

    const handleDelete = async (id: string) => {
        setLoanToDelete(id)
        setDeleteDialogOpen(true)
    }

    const handleArchive = async (id: string, archived: boolean) => {
        setLoanToArchive({ id, archived })
        setArchiveDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!loanToDelete) return
        try {
            const token = document.cookie
                .split("; ")
                .find((c) => c.startsWith("authToken="))
                ?.split("=")[1]
            await HttpService.delete(`/api/v1/loans/${loanToDelete}`, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
            })
            setLoans((prev) => prev.filter((loan) => loan.id !== loanToDelete))
            toast({
                title: "Préstamo eliminado",
                description: "El préstamo ha sido eliminado correctamente",
            })
        } catch (error) {
            console.error("Error al eliminar préstamo:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo eliminar el préstamo",
            })
        } finally {
            setDeleteDialogOpen(false)
            setLoanToDelete(null)
        }
    }

    const confirmArchive = async () => {
        if (!loanToArchive) return
        try {
            const token = document.cookie
                .split("; ")
                .find((c) => c.startsWith("authToken="))
                ?.split("=")[1]

            const endpoint = loanToArchive.archived
                ? `/api/v1/loans/${loanToArchive.id}/unarchive`
                : `/api/v1/loans/${loanToArchive.id}/archive`

            await HttpService.post(
                endpoint,
                {},
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                },
            )

            // Update the loan in the local state
            setLoans((prev) =>
                prev.map((loan) => (loan.id === loanToArchive.id ? { ...loan, archived: !loanToArchive.archived } : loan)),
            )

            toast({
                title: loanToArchive.archived ? "Préstamo desarchivado" : "Préstamo archivado",
                description: loanToArchive.archived
                    ? "El préstamo ha sido desarchivado correctamente"
                    : "El préstamo ha sido archivado correctamente",
            })
        } catch (error) {
            console.error("Error al archivar/desarchivar préstamo:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo procesar la solicitud",
            })
        } finally {
            setArchiveDialogOpen(false)
            setLoanToArchive(null)
        }
    }

    const handlePrintContract = async (loan: Loan) => {
        try {
            setPrintingContract(true)
            setPrintProgress(10)
            // Simular progreso
            const progressInterval = setInterval(() => {
                setPrintProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return 90
                    }
                    return prev + 10
                })
            }, 300)
            const res = await HttpService.post(
                "/api/v1/contract",
                {
                    contractNumber: loan.contractNumber,
                    legalRepresentative: "Andrés Felipe Correa Perdomo",
                    representativeId: "10497576",
                    customerName: loan.user.name,
                    customerId: loan.user.identification,
                    customerAddress: loan.user.address || "Dirección no disponible",
                    customerCity: loan.user.city || "Ciudad no disponible",
                    customerPhone: loan.user.phone || "Teléfono no disponible",
                    plate: loan.motorcycle.plate || "Placa no disponible",
                    brand: loan.motorcycle.brand || "Marca no disponible",
                    engine: loan.motorcycle.engine,
                    model: loan.motorcycle.model || "Modelo no disponible",
                    chassis: loan.motorcycle.chassis,
                    date: new Date().toISOString(),
                },
                {
                    responseType: "blob",
                },
            )
            clearInterval(progressInterval)
            setPrintProgress(100)
            const blob = new Blob([res.data], { type: "application/pdf" })
            const fileURL = URL.createObjectURL(blob)
            const printWindow = window.open(fileURL)
            if (!printWindow) throw new Error("No se pudo abrir la ventana")
            printWindow.addEventListener("load", () => {
                printWindow.focus()
                printWindow.print()
            })
            toast({
                title: "Contrato generado",
                description: "El contrato se ha generado correctamente",
            })
            // Cerrar el diálogo después de un breve retraso
            setTimeout(() => {
                setPrintingContract(false)
                setPrintProgress(0)
            }, 1000)
        } catch (error) {
            console.error("Error al generar contrato:", error)
            toast({
                variant: "destructive",
                title: "Error al imprimir contrato",
                description: "No se pudo generar el contrato PDF",
            })
            setPrintingContract(false)
            setPrintProgress(0)
        }
    }

    const filteredLoans = loans.filter((loan) => {
        // Filter by archived status
        if (loan.archived !== showArchived) return false

        // Filter by search term
        const userMatch = loan.user.name?.toLowerCase().includes(searchTerm.toLowerCase())
        const motoMatch = loan.motorcycle.model?.toLowerCase().includes(searchTerm.toLowerCase())
        const idMatch = loan.user.identification?.toLowerCase().includes(searchTerm.toLowerCase())
        const plateMatch = loan.motorcycle.plate?.toLowerCase().includes(searchTerm.toLowerCase())
        return userMatch || motoMatch || idMatch || plateMatch
    })

    const totalItems = filteredLoans.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
    const currentItems = filteredLoans.slice(startIndex, endIndex)

    const refreshData = () => {
        setRefreshKey((prev) => prev + 1)
    }

    const exportToCSV = () => {
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

        const headers = [
            "Cliente",
            "Identificación",
            "Motocicleta",
            "Monto Total",
            "Cuota Inicial",
            "Cuotas",
            "Cuotas Pagadas",
            "Deuda Restante",
            "Frecuencia",
            "Estado",
            "Archivado",
        ]
        const csvRows = [
            headers.join(","),
            ...filteredLoans.map((loan) =>
                [
                    loan.user.name,
                    loan.user.identification,
                    loan.motorcycle.model,
                    loan.totalAmount,
                    loan.downPayment,
                    loan.installments,
                    loan.paidInstallments,
                    loan.debtRemaining,
                    getPaymentFrequencyText(loan.paymentFrequency || "DAILY"),
                    loan.status,
                    loan.archived ? "Sí" : "No",
                ].join(","),
            ),
        ]
        const csvContent = csvRows.join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", showArchived ? "prestamos-archivados.csv" : "prestamos.csv")
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return {
        // State
        loans,
        loading,
        searchTerm,
        currentPage,
        itemsPerPage,
        printingContract,
        printProgress,
        deleteDialogOpen,
        archiveDialogOpen,
        loanToDelete,
        loanToArchive,
        showArchived,
        filteredLoans,
        totalItems,
        totalPages,
        startIndex,
        endIndex,
        currentItems,

        // Actions
        setSearchTerm,
        setCurrentPage,
        setItemsPerPage,
        setPrintingContract,
        setDeleteDialogOpen,
        setArchiveDialogOpen,
        setShowArchived,
        handleDelete,
        handleArchive,
        confirmDelete,
        confirmArchive,
        handlePrintContract,
        refreshData,
        exportToCSV,
    }
}
