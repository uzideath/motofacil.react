import { PaymentMethod, Provider } from "@/lib/types"
import type { SelectedTransaction as TransactionSelectedTransaction } from "../transactions/constants/types"

// Re-export the SelectedTransaction from transactions to ensure consistency
export type SelectedTransaction = TransactionSelectedTransaction

export type DenominationCount = {
    bills_100000: number
    bills_50000: number
    bills_20000: number
    bills_10000: number
    bills_5000: number
    bills_2000: number
    bills_1000: number
    coins_500: number
    coins_200: number
    coins_100: number
}

export type FormState = {
    cashInRegister: string
    cashFromTransfers: string
    cashFromCards: string
    notes: string
    closingDate: Date
    submitting: boolean
    success: boolean
    error: boolean
    errorMessage: string
    // Cash calculator fields
    cashCounted: number
    cashCountValid: boolean
    denominationCounts: DenominationCount | null
}

export type CashRegisterFormProps = {
    token: string
    selectedTransactions: SelectedTransaction[]
    closingDate?: Date
}

export type ChartData = {
    name: string
    value: number
}

export type FormCalculations = {
    cashInRegister: number
    cashFromTransfers: number
    cashFromCards: number
    totalRegistered: number
    totalExpected: number
    totalExpenses: number
    totalDifference: number
    hasAnyValue: boolean
}
