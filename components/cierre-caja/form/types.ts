import { PaymentMethod } from "@/lib/types"

export type SelectedTransaction = {
    id: string
    amount: number
    paymentMethod: PaymentMethod
    type: "income" | "expense"
    provider?: string
}

export type FormState = {
    cashInRegister: string
    cashFromTransfers: string
    cashFromCards: string
    notes: string
    submitting: boolean
    success: boolean
    error: boolean
    errorMessage: string
}

export type CashRegisterFormProps = {
    token: string
    selectedTransactions: SelectedTransaction[]
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
