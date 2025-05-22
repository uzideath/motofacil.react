import { SelectedTransaction, Transaction } from "../constants/types"
import { mapPaymentLabelToMethod } from "./formatters"

/**
 * Maps selected transactions to the format expected by the API
 */
export const mapSelectedTransactions = (transactions: Transaction[], selectedIds: string[]): SelectedTransaction[] => {
    return transactions
        .filter((t) => selectedIds.includes(t.id))
        .map((t) => ({
            id: t.id,
            amount: t.amount,
            paymentMethod: mapPaymentLabelToMethod(t.paymentMethod),
            type: t.type,
            provider: t.provider,
        }))
}

/**
 * Checks if transactions have the same provider
 */
export const hasSameProvider = (transactions: Transaction[]): boolean => {
    if (transactions.length <= 1) return true

    const firstProvider = transactions[0].provider
    return transactions.every((t) => t.provider === firstProvider)
}

/**
 * Gets the first provider from a list of transactions
 */
export const getFirstProvider = (transactions: Transaction[]): string | undefined => {
    return transactions.length > 0 ? transactions[0].provider : undefined
}

/**
 * Filters transactions by provider
 */
export const filterTransactionsByProvider = (
    transactions: Transaction[],
    provider: string | undefined,
): Transaction[] => {
    if (!provider) return []
    return transactions.filter((t) => t.provider === provider)
}
