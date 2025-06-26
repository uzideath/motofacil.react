export enum Providers {
    MOTOFACIL = "MOTOFACIL",
    OBRASOCIAL = "OBRASOCIAL",
    PORCENTAJETITO = "PORCENTAJETITO",
}

export enum PaymentMethods {
    CASH = "CASH",
    TRANSACTION = "TRANSACTION",
    CARD = "CARD",
}

export type Loan = {
    id: string
    userId: string
    contractNumber: string
    motorcycleId: string
    totalAmount: number
    downPayment: number
    installments: number
    paidInstallments: number
    remainingInstallments: number
    totalPaid: number
    debtRemaining: number
    interestRate: number
    interestType: string
    paymentFrequency: string
    installmentPaymentAmmount: number
    gpsInstallmentPayment: number
    createdAt: string
    updatedAt: string
    startDate: string
    endDate: string | null
    status: string
    user: {
        id: string
        name: string
    }
    motorcycle: {
        id: string
        plate: string
    }
}

export type Payment = {
    id: string
    loanId: string
    paymentMethod: PaymentMethods
    amount: number
    gps: number
    paymentDate: string
    isLate: boolean
    latePaymentDate: string | null
    notes: string | null
    attachmentUrl: string | null
    createdById: string
    createdAt: string
    updatedAt: string
    cashRegisterId: string
    loan: Loan
    createdBy: {
        id: string
        username: string
    }
}

export type Expense = {
    id: string
    amount: number
    date: string
    provider: string
    category: string
    paymentMethod: PaymentMethods
    beneficiary: string
    reference: string
    description: string
    attachmentUrl: string | null
    cashRegisterId: string
    createdById: string
    createdAt: string
    updatedAt: string
}

export type CashRegister = {
    id: string
    date: string
    provider: string
    cashInRegister: number
    cashFromTransfers: number
    cashFromCards: number
    notes: string
    createdAt: string
    updatedAt: string
    createdById: string
    payments: Payment[]
    expense: Expense[]
    createdBy: {
        id: string
        username: string
    }
}

export type CashRegisterDisplay = {
    id: string
    date: string
    time: string
    user: string
    provider?: string
    totalIncome: number
    totalExpense: number
    balance: number
    status: "balanced" | "minor-diff" | "major-diff"
    cashInRegister: number
    cashFromTransfers: number
    cashFromCards: number
    notes: string
    raw: CashRegister
}

export type FilterState = {
    searchTerm: string
    month: string
    providerFilter: string
    statusFilter: string
}

export type PaginationState = {
    currentPage: number
    itemsPerPage: string
}
