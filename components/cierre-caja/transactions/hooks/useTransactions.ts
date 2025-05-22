"use client"

import { useCallback, useEffect, useState } from "react"
import { DEFAULT_ITEMS_PER_PAGE } from "../constants"
import { SelectedTransaction, SortField, Transaction, TransactionFiltersState } from "../constants/types"
import { calculatePagination, calculateTransactionSummary, filterAndSortTransactions } from "../utils/filters"
import { fetchAvailableTransactions } from "../services"
import { formatProviderName } from "../utils/formatters"
import { filterTransactionsByProvider, getFirstProvider, hasSameProvider, mapSelectedTransactions } from "../utils/selection"

interface UseTransactionsProps {
    token: string
    onSelect?: (transactions: SelectedTransaction[]) => void
    itemsPerPage?: number
}

export const useTransactions = ({ token, onSelect, itemsPerPage = DEFAULT_ITEMS_PER_PAGE }: UseTransactionsProps) => {
    // State
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [currentPage, setCurrentPage] = useState(1)

    // Provider mismatch dialog state
    const [showProviderMismatchDialog, setShowProviderMismatchDialog] = useState(false)
    const [currentProviderName, setCurrentProviderName] = useState<string | undefined>(undefined)
    const [attemptedProviderName, setAttemptedProviderName] = useState<string | undefined>(undefined)

    // Filters state
    const [filters, setFilters] = useState<TransactionFiltersState>({
        searchTerm: "",
        typeFilter: "all",
        providerFilter: "all",
        sortField: null,
        sortDirection: "asc",
    })

    // Derived state
    const filteredTransactions = filterAndSortTransactions(transactions, filters)
    const { totalIncome, totalExpense, netAmount } = calculateTransactionSummary(filteredTransactions)
    const { totalPages, indexOfFirstItem, indexOfLastItem } = calculatePagination(
        filteredTransactions.length,
        currentPage,
        itemsPerPage,
    )
    const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem)
    const hasActiveFilters =
        filters.searchTerm !== "" ||
        filters.typeFilter !== "all" ||
        filters.providerFilter !== "all" ||
        filters.sortField !== null

    // Fetch transactions
    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true)
            setRefreshing(true)
            const data = await fetchAvailableTransactions(token)
            setTransactions(data)
        } catch (error) {
            console.error("Error loading transactions:", error)
        } finally {
            setLoading(false)
            setTimeout(() => setRefreshing(false), 500)
        }
    }, [token])

    // Initial fetch
    useEffect(() => {
        fetchTransactions()
    }, [fetchTransactions])

    // Filter handlers
    const handleSearchChange = (value: string) => {
        setFilters((prev) => ({ ...prev, searchTerm: value }))
        setCurrentPage(1)
    }

    const handleTypeFilterChange = (value: string) => {
        setFilters((prev) => ({ ...prev, typeFilter: value }))
        setCurrentPage(1)
    }

    const handleProviderFilterChange = (value: string) => {
        setFilters((prev) => ({ ...prev, providerFilter: value }))
        setCurrentPage(1)
    }

    const handleSort = (field: SortField) => {
        setFilters((prev) => ({
            ...prev,
            sortField: field,
            sortDirection: prev.sortField === field && prev.sortDirection === "asc" ? "desc" : "asc",
        }))
    }

    const resetFilters = () => {
        setFilters({
            searchTerm: "",
            typeFilter: "all",
            providerFilter: "all",
            sortField: null,
            sortDirection: "asc",
        })
        setCurrentPage(1)
    }

    // Selection handlers
    const handleSelection = (id: string, checked: boolean) => {
        if (checked) {
            // Get current transaction
            const currentTransaction = transactions.find((t) => t.id === id)

            // Check if already selected transactions have a different provider
            if (selectedIds.length > 0 && currentTransaction) {
                const firstSelectedTransaction = transactions.find((t) => t.id === selectedIds[0])

                if (firstSelectedTransaction && currentTransaction.provider !== firstSelectedTransaction.provider) {
                    setCurrentProviderName(formatProviderName(firstSelectedTransaction.provider))
                    setAttemptedProviderName(formatProviderName(currentTransaction.provider))
                    setShowProviderMismatchDialog(true)
                    return
                }
            }

            // Add to selection
            const updated = [...selectedIds, id]
            setSelectedIds(updated)
            onSelect?.(mapSelectedTransactions(transactions, updated))
        } else {
            // Remove from selection
            const updated = selectedIds.filter((x) => x !== id)
            setSelectedIds(updated)
            onSelect?.(mapSelectedTransactions(transactions, updated))
        }
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            if (selectedIds.length === 0) {
                // Check if current items have multiple providers
                if (!hasSameProvider(currentItems) && filters.providerFilter === "all") {
                    const firstProvider = getFirstProvider(currentItems)
                    const sameProviderItems = filterTransactionsByProvider(currentItems, firstProvider)

                    // Show dialog
                    setCurrentProviderName(formatProviderName(firstProvider))
                    setAttemptedProviderName("Múltiples proveedores")
                    setShowProviderMismatchDialog(true)

                    // Select only items with same provider
                    setSelectedIds(sameProviderItems.map((t) => t.id))
                    onSelect?.(
                        mapSelectedTransactions(
                            transactions,
                            sameProviderItems.map((t) => t.id),
                        ),
                    )
                } else {
                    // Select all current items
                    setSelectedIds(currentItems.map((t) => t.id))
                    onSelect?.(
                        mapSelectedTransactions(
                            transactions,
                            currentItems.map((t) => t.id),
                        ),
                    )
                }
            } else {
                // If already have selected items, only select those with same provider
                const firstSelectedTransaction = transactions.find((t) => t.id === selectedIds[0])
                const sameProviderItems = filterTransactionsByProvider(currentItems, firstSelectedTransaction?.provider)

                setSelectedIds(sameProviderItems.map((t) => t.id))
                onSelect?.(
                    mapSelectedTransactions(
                        transactions,
                        sameProviderItems.map((t) => t.id),
                    ),
                )
            }
        } else {
            // Deselect all
            setSelectedIds([])
            onSelect?.([])
        }
    }

    // Pagination handler
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    return {
        // Data
        transactions,
        filteredTransactions,
        currentItems,
        loading,
        refreshing,
        selectedIds,

        // Summary
        totalIncome,
        totalExpense,
        netAmount,

        // Filters
        filters,
        hasActiveFilters,

        // Pagination
        currentPage,
        totalPages,
        indexOfFirstItem,
        indexOfLastItem,

        // Dialog
        showProviderMismatchDialog,
        currentProviderName,
        attemptedProviderName,

        // Actions
        fetchTransactions,
        handleSearchChange,
        handleTypeFilterChange,
        handleProviderFilterChange,
        handleSort,
        resetFilters,
        handleSelection,
        handleSelectAll,
        handlePageChange,
        setShowProviderMismatchDialog,
    }
}
