"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TransactionList } from "./components/transaction-list"
import { useTransactions } from "./hooks/useTransactions"
import { ProviderMismatchDialog } from "./components/helpers/provider-mismatch"
import { TransactionFilters } from "./components/helpers/transaction-filters"
import { TransactionHeader } from "./components/helpers/transaction-header"
import { TransactionPagination } from "./components/helpers/transaction-pagination"
import { TransactionSummary } from "./components/helpers/transaction-summary"
import { SelectedTransaction } from "./constants/types"


interface TransactionTableProps {
  token: string
  onSelect?: (transactions: SelectedTransaction[]) => void
}

export function TransactionTable({ token, onSelect }: TransactionTableProps) {
  const {
    // Data
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
  } = useTransactions({
    token,
    onSelect,
  })

  return (
    <Card className="shadow-md border-slate-200 dark:border-slate-800">
      <TransactionHeader refreshing={refreshing} onRefresh={fetchTransactions} />

      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <TransactionSummary totalIncome={totalIncome} totalExpense={totalExpense} netAmount={netAmount} />

        {/* Filters */}
        <TransactionFilters
          searchTerm={filters.searchTerm}
          typeFilter={filters.typeFilter}
          providerFilter={filters.providerFilter}
          onSearchChange={handleSearchChange}
          onTypeFilterChange={handleTypeFilterChange}
          onProviderFilterChange={handleProviderFilterChange}
          onResetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Table */}
        <TransactionList
          loading={loading}
          transactions={currentItems}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectItem={handleSelection}
          sortField={filters.sortField}
          sortDirection={filters.sortDirection}
          onSort={handleSort}
        />

        {/* Pagination */}
        {!loading && currentItems.length > 0 && (
          <TransactionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={currentItems.length}
            itemsPerPage={10}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
            onPageChange={handlePageChange}
          />
        )}
      </CardContent>

      {/* Provider Mismatch Dialog */}
      <ProviderMismatchDialog
        open={showProviderMismatchDialog}
        onOpenChange={setShowProviderMismatchDialog}
        currentProviderName={currentProviderName}
        attemptedProviderName={attemptedProviderName}
      />
    </Card>
  )
}
