import { HttpService } from "@/lib/http"
import { API_ENDPOINTS } from "../constants"
import { Expense, Installment, Transaction, TransactionResponse } from "../constants/types"
import { formatTimeFromDate, mapPaymentMethodToLabel } from "../utils/formatters"


/**
 * Fetches available transactions (installments and expenses)
 */
export const fetchAvailableTransactions = async (token: string): Promise<Transaction[]> => {
    try {
        const response = await HttpService.get<TransactionResponse>(API_ENDPOINTS.AVAILABLE_PAYMENTS, {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
        })

        const incomes = mapInstallmentsToTransactions(response.data.installments)
        const expenses = mapExpensesToTransactions(response.data.expenses)

        return [...incomes, ...expenses]
    } catch (error) {
        console.error("Error fetching transactions:", error)
        throw error
    }
}

/**
 * Maps installments from API to Transaction objects
 */
const mapInstallmentsToTransactions = (installments: Installment[]): Transaction[] => {
    return installments.map((installment) => ({
        id: installment.id,
        time: formatTimeFromDate(installment.paymentDate),
        description: `${installment.loan.motorcycle.plate}`,
        category: "Cuota de préstamo",
        amount: installment.amount + installment.gps, // Add GPS to the amount
        baseAmount: installment.amount, // Keep the original amount as baseAmount
        gpsAmount: installment.gps, // Store the GPS amount separately
        paymentMethod: mapPaymentMethodToLabel(installment.paymentMethod),
        type: "income",
        reference: installment.id,
        client: installment.loan.user.name,
        provider: installment.loan.motorcycle.provider,
        date: new Date(installment.paymentDate),
        createdBy: installment.createdBy,
    }))
}

/**
 * Maps expenses from API to Transaction objects
 */
const mapExpensesToTransactions = (expenses: Expense[]): Transaction[] => {
    return expenses.map((expense) => ({
        id: expense.id,
        time: formatTimeFromDate(expense.date),
        description: expense.description,
        category: expense.category,
        amount: expense.amount,
        paymentMethod: mapPaymentMethodToLabel(expense.paymentMethod),
        type: "expense",
        reference: expense.reference ?? "",
        provider: expense.provider,
        date: new Date(expense.date),
        createdBy: expense.createdBy,
    }))
}
