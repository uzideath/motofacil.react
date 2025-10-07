import { HttpService } from "@/lib/http"
import { API_ENDPOINTS } from "../constants"
import { Transaction, TransactionResponse } from "../constants/types"
import { formatTimeFromDate } from "../utils/formatters"
import { Installment, Expense } from "@/lib/types"

/**
 * Fetches available transactions (installments and expenses)
 * @param token - Authentication token
 * @param filterByDate - Optional date to filter transactions for a specific date
 */
export const fetchAvailableTransactions = async (token: string, filterByDate?: Date): Promise<Transaction[]> => {
    try {
        // Build query parameters
        const params: any = {}
        
        if (filterByDate) {
            // Format date as YYYY-MM-DD
            const dateStr = filterByDate.toISOString().split('T')[0]
            params.specificDate = dateStr
            console.log('📅 Service - Sending specificDate to API:', dateStr);
        } else {
            console.log('📅 Service - No date filter, fetching all transactions');
        }

        console.log('🌐 Service - API request params:', params);

        const response = await HttpService.get<TransactionResponse>(API_ENDPOINTS.AVAILABLE_PAYMENTS, {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
            params,
        })

        console.log('✅ Service - API Response:', response.data);

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
        description: `${installment.loan.vehicle.plate}`,
        category: "Cuota de arredamiento",
        amount: installment.amount + installment.gps, // Add GPS to the amount
        baseAmount: installment.amount, // Keep the original amount as baseAmount
        gpsAmount: installment.gps, // Store the GPS amount separately
        paymentMethod: installment.paymentMethod, // Use enum directly
        type: "income",
        reference: installment.id,
        client: installment.loan.user.name,
        provider: installment.loan.vehicle.provider,
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
        paymentMethod: expense.paymentMethod, // Use enum directly
        type: "expense",
        reference: expense.reference ?? "",
        provider: expense.provider || undefined,
        date: new Date(expense.date),
        createdBy: expense.createdBy,
    }))
}
