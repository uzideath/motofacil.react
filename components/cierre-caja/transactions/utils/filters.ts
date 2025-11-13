import type { Transaction, TransactionFiltersState, TransactionSummary } from "../constants/types"

export function filterAndSortTransactions(
  transactions: Transaction[],
  filters: TransactionFiltersState,
): Transaction[] {
  console.log('🔍 Frontend Filter - Input transactions:', transactions.length)
  let filtered = [...transactions]

  // Note: Date filtering is now handled by the backend based on the selected date range
  // No need to filter by date here - show all transactions returned by the API

  // Apply search filter
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase()
    filtered = filtered.filter(
      (transaction) =>
        transaction.description?.toLowerCase().includes(searchLower) ||
        transaction.reference?.toLowerCase().includes(searchLower) ||
        transaction.amount.toString().includes(searchLower),
    )
    console.log('   After search filter:', filtered.length)
  }

  // Apply type filter
  if (filters.typeFilter !== "all") {
    filtered = filtered.filter((transaction) => transaction.type === filters.typeFilter)
    console.log('   After type filter:', filtered.length)
  }

  // Apply provider filter
  if (filters.providerFilter !== "all") {
    filtered = filtered.filter((transaction) => transaction.provider?.name === filters.providerFilter)
    console.log('   After provider filter:', filtered.length)
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

  console.log('✅ Frontend Filter - Output transactions:', filtered.length)
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
