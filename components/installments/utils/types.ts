export type Installment = {
    id: string
    loanId: string
    userName: string
    motorcycleModel: string
    amount: number
    gps: number
    paymentDate?: string
    date: string
    isLate: boolean
    latePaymentDate?: string
    paymentMethod: "CASH" | "CARD" | "TRANSACTION"
    loan: {
        contractNumber: string
        user: {
            phone: string
        }
    }
    motorcycle: {
        plate: string
    }
    createdBy?: {
        id: string
        name: string
        username: string
    }
    attachmentUrl?: string
}

export type SortField = "userName" | "motorcycleModel" | "amount" | "date" | null
export type SortDirection = "asc" | "desc"
