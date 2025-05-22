import { SortDirection, SortField, Transaction, TransactionFiltersState } from "../constants/types"
import { formatProviderName } from "./formatters"

/**
 * Filters and sorts transactions based on filter state
 */
export const filterAndSortTransactions = (
  transactions: Transaction[],
  filters: TransactionFiltersState,
): Transaction[] => {
  const { searchTerm, typeFilter, providerFilter, sortField, sortDirection } = filters

  return transactions
    .filter((transaction) => {
      // Search filter
      const matchesSearch =
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.client && transaction.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
        transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())

      // Type filter
      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "income" && transaction.type === "income") ||
        (typeFilter === "expense" && transaction.type === "expense")

      // Provider filter
      const matchesProvider = providerFilter === "all" || transaction.provider === providerFilter

      return matchesSearch && matchesType && matchesProvider
    })
    .sort((a, b) => sortTransactions(a, b, sortField, sortDirection))
}

/**
 * Sorts transactions based on sort field and direction
 */
export const sortTransactions = (
  a: Transaction,
  b: Transaction,
  sortField: SortField,
  sortDirection: SortDirection,
): number => {
  if (!sortField) return 0

  if (sortField === "amount") {
    return sortDirection === "asc" ? a.amount - b.amount : b.amount - a.amount
  }

  if (sortField === "time") {
    return sortDirection === "asc" ? a.date.getTime() - b.date.getTime() : b.date.getTime() - a.date.getTime()
  }

  if (sortField === "provider") {
    const aProvider = formatProviderName(a.provider || "")
    const bProvider = formatProviderName(b.provider || "")
    return sortDirection === "asc" ? aProvider.localeCompare(bProvider) : bProvider.localeCompare(aProvider)
  }

  const aValue = String(a[sortField]).toLowerCase()
  const bValue = String(b[sortField]).toLowerCase()

  return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
}

/**
 * Calculates transaction summary statistics
 */
export const calculateTransactionSummary = (transactions: Transaction[]) => {
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const netAmount = totalIncome - totalExpense

  return {
    totalIncome,
    totalExpense,
    netAmount,
  }
}

/**
 * Calculates pagination data
 */
export const calculatePagination = (totalItems: number, currentPage: number, itemsPerPage: number) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage

  return {
    totalPages,
    indexOfLastItem,
    indexOfFirstItem,
  }
}
