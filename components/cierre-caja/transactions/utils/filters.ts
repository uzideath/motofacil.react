import type { Transaction, TransactionFiltersState, TransactionSummary } from "../constants/types"

export function filterAndSortTransactions(
  transactions: Transaction[],
  filters: TransactionFiltersState,
): Transaction[] {
  let filtered = [...transactions]

  // Apply search filter
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase()
    filtered = filtered.filter(
      (transaction) =>
        transaction.description?.toLowerCase().includes(searchLower) ||
        transaction.reference?.toLowerCase().includes(searchLower) ||
        transaction.amount.toString().includes(searchLower),
    )
  }

  // Apply type filter
  if (filters.typeFilter !== "all") {
    filtered = filtered.filter((transaction) => transaction.type === filters.typeFilter)
  }

  // Apply provider filter
  if (filters.providerFilter !== "all") {
    filtered = filtered.filter((transaction) => transaction.provider?.name === filters.providerFilter)
  }

  // Apply sorting
  if (filters.sortField) {
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (filters.sortField) {
        case "date":
          aValue = new Date(a.date)
          bValue = new Date(b.date)
          break
        case "amount":
          aValue = a.amount
          bValue = b.amount
          break
        case "type":
          aValue = a.type
          bValue = b.type
          break
        case "provider":
          aValue = a.provider
          bValue = b.provider
          break
        default:
          aValue = a.date
          bValue = b.date
      }

      if (filters.sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }

  return filtered
}

export function calculateTransactionSummary(transactions: Transaction[]): TransactionSummary {
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  return {
    totalIncome,
    totalExpense,
    netAmount: totalIncome - totalExpense,
  }
}

export function calculatePagination(totalItems: number, currentPage: number, itemsPerPage: number) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage

  return {
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
  }
}
