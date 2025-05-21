"use client"

import { useState, useMemo } from "react"
import type { DateRange } from "react-day-picker"
import { Installment, SortDirection, SortField } from "../utils/types"

export function useTableState(installments: Installment[]) {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortField, setSortField] = useState<SortField>("date")
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
    const [paymentFilter, setPaymentFilter] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<boolean | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    const resetFilters = () => {
        setSearchTerm("")
        setSortField(null)
        setSortDirection("asc")
        setPaymentFilter(null)
        setStatusFilter(null)
        setDateRange(undefined)
        setCurrentPage(1)
    }

    const hasActiveFilters = !!(searchTerm || paymentFilter !== null || statusFilter !== null || sortField || dateRange)

    const filteredInstallments = useMemo(() => {
        return installments
            .filter(
                (i) =>
                    (i.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        i.motorcycleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (i.motorcycle?.plate && i.motorcycle.plate.toLowerCase().includes(searchTerm.toLowerCase()))) &&
                    (paymentFilter === null || i.paymentMethod === paymentFilter) &&
                    (statusFilter === null || i.isLate === statusFilter),
            )
            .sort((a, b) => {
                if (!sortField) return 0

                if (sortField === "amount") {
                    return sortDirection === "asc" ? a.amount - b.amount : b.amount - a.amount
                }

                if (sortField === "date") {
                    return sortDirection === "asc"
                        ? new Date(a.date).getTime() - new Date(b.date).getTime()
                        : new Date(b.date).getTime() - new Date(a.date).getTime()
                }

                const aValue = a[sortField].toLowerCase()
                const bValue = b[sortField].toLowerCase()

                if (sortDirection === "asc") {
                    return aValue.localeCompare(bValue)
                } else {
                    return bValue.localeCompare(aValue)
                }
            })
    }, [installments, searchTerm, paymentFilter, statusFilter, sortField, sortDirection])

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const totalPages = Math.ceil(filteredInstallments.length / itemsPerPage)
    const paginatedInstallments = filteredInstallments.slice(indexOfFirstItem, indexOfLastItem)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleItemsPerPageChange = (value: number) => {
        setItemsPerPage(value)
        setCurrentPage(1)
    }

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range)
        setCurrentPage(1)
    }

    return {
        searchTerm,
        setSearchTerm,
        sortField,
        sortDirection,
        paymentFilter,
        setPaymentFilter,
        statusFilter,
        setStatusFilter,
        currentPage,
        itemsPerPage,
        dateRange,
        filteredInstallments,
        paginatedInstallments,
        totalPages,
        indexOfFirstItem,
        indexOfLastItem,
        hasActiveFilters,
        handleSort,
        resetFilters,
        handlePageChange,
        handleItemsPerPageChange,
        handleDateRangeChange,
    }
}
