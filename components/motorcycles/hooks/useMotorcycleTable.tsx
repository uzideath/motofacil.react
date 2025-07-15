"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { HttpService } from "@/lib/http"
import type { Motorcycle } from "@/lib/types"
import { useProviders } from "@/components/providers/hooks/useProviders"

export function useMotorcycleTable() {
    const { providers, getProviderName } = useProviders()
    const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [providerFilter, setProviderFilter] = useState<string>("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [refreshKey, setRefreshKey] = useState(0)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [motorcycleToDelete, setMotorcycleToDelete] = useState<string | null>(null)
    const { toast } = useToast()

    const getAuthToken = () => {
        return document.cookie
            .split("; ")
            .find((c) => c.startsWith("authToken="))
            ?.split("=")[1]
    }

    const fetchMotorcycles = async () => {
        try {
            setLoading(true)
            const token = getAuthToken()
            const response = await HttpService.get<Motorcycle[]>("/api/v1/motorcycles", {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
            })

            // Sort motorcycles by creation date (most recent first)
            const sortedMotorcycles = response.data.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime()
                const dateB = new Date(b.createdAt).getTime()
                return dateB - dateA // Descending order (newest first)
            })

            setMotorcycles(sortedMotorcycles)
        } catch (error) {
            console.error("Error al obtener motocicletas:", error)
            toast({
                variant: "destructive",
                title: "Error al cargar datos",
                description: "No se pudieron obtener las motocicletas del servidor",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMotorcycles()
    }, [refreshKey])

    const handleMotorcycleCreated = (updatedMotorcycle?: Motorcycle) => {
        if (!updatedMotorcycle) {
            fetchMotorcycles()
            return
        }

        setMotorcycles((prev) => {
            const existingIndex = prev.findIndex((moto) => moto.id === updatedMotorcycle.id)
            if (existingIndex >= 0) {
                // This is an update - replace the existing motorcycle
                const updatedList = [...prev]
                updatedList[existingIndex] = updatedMotorcycle
                return updatedList
            } else {
                // This is a new motorcycle - add it to the beginning (most recent)
                const newList = [updatedMotorcycle, ...prev]
                // Re-sort to maintain proper order
                return newList.sort((a, b) => {
                    const dateA = new Date(a.createdAt).getTime()
                    const dateB = new Date(b.createdAt).getTime()
                    return dateB - dateA
                })
            }
        })
    }

    const handleDelete = async (id: string) => {
        setMotorcycleToDelete(id)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!motorcycleToDelete) return

        try {
            const token = getAuthToken()
            await HttpService.delete(`/api/v1/motorcycles/${motorcycleToDelete}`, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
            })
            setMotorcycles((prev) => prev.filter((moto) => moto.id !== motorcycleToDelete))
            toast({
                title: "Motocicleta eliminada",
                description: "La motocicleta ha sido eliminada correctamente",
            })
        } catch (error) {
            console.error("Error al eliminar motocicleta:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo eliminar la motocicleta",
            })
        } finally {
            setDeleteDialogOpen(false)
            setMotorcycleToDelete(null)
        }
    }

    const refreshData = () => {
        setRefreshKey((prev) => prev + 1)
    }

    const exportToCSV = () => {
        const headers = ["Marca", "Modelo", "Placa", "Color", "Cilindraje", "GPS", "Motor", "Chasis", "Proveedor"]
        const csvRows = [
            headers.join(","),
            ...filteredMotorcycles.map((moto) =>
                [
                    moto.brand,
                    moto.model,
                    moto.plate,
                    moto.color || "",
                    moto.cc || "",
                    moto.gps || "",
                    moto.engine || "",
                    moto.chassis || "",
                    getProviderLabel(moto.provider.name),
                ].join(","),
            ),
        ]
        const csvContent = csvRows.join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", "motocicletas.csv")
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const clearFilters = () => {
        setSearchTerm("")
        setProviderFilter("all")
    }

    // Computed values
    const filteredMotorcycles = motorcycles.filter((moto) => {
        const matchesSearch =
            moto.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            moto.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            moto.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (moto.chassis && moto.chassis.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (moto.engine && moto.engine.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesProvider = providerFilter === "all" || moto.provider.name === providerFilter

        return matchesSearch && matchesProvider
    })

    const uniqueProviders = Array.from(
        new Set(motorcycles.map((moto) => moto.provider?.name).filter(Boolean)),
    ) as string[]

    const totalItems = filteredMotorcycles.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
    const currentItems = filteredMotorcycles.slice(startIndex, endIndex)

    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxVisiblePages = 5
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1)
            let startPage = Math.max(2, currentPage - 1)
            let endPage = Math.min(totalPages - 1, currentPage + 1)
            if (currentPage <= 3) endPage = Math.min(totalPages - 1, 4)
            else if (currentPage >= totalPages - 2) startPage = Math.max(2, totalPages - 3)
            if (startPage > 2) pages.push("ellipsis-start")
            for (let i = startPage; i <= endPage; i++) pages.push(i)
            if (endPage < totalPages - 1) pages.push("ellipsis-end")
            pages.push(totalPages)
        }
        return pages
    }

    const getProviderLabel = (providerName: string) => {
        // Simple mapping for display labels
        const providerLabels: Record<string, string> = {
            MOTOFACIL: "Moto Facil",
            OBRASOCIAL: "Obra Social",
            PORCENTAJETITO: "Tito",
        }

        return providerLabels[providerName] || providerName
    }

    return {
        // State
        motorcycles: currentItems,
        loading,
        searchTerm,
        setSearchTerm,
        providerFilter,
        setProviderFilter,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        deleteDialogOpen,
        setDeleteDialogOpen,

        // Actions
        handleMotorcycleCreated,
        handleDelete,
        confirmDelete,
        refreshData,
        exportToCSV,
        clearFilters,

        // Computed values
        totalItems,
        totalPages,
        startIndex,
        endIndex,
        getPageNumbers,
        uniqueProviders,
        getProviderLabel,
        hasActiveFilters: searchTerm !== "" || providerFilter !== "all",
    }
}
