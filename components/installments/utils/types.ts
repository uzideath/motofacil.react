export type Installment = {
    id: string
    loanId: string
    paymentMethod: "CASH" | "CARD" | "TRANSACTION"
    amount: number
    gps: number
    paymentDate: string
    isLate: boolean
    latePaymentDate: string | null
    notes: string
    attachmentUrl: string | null
    createdById: string
    createdAt: string
    updatedAt: string
    cashRegisterId: string | null
    loan: {
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
        endDate: string
        status: string
        user: {
            id: string
            name: string
            identification: string
            idIssuedAt: string
            age: number
            phone: string
            address: string
            city: string
            refName: string
            refID: string
            refPhone: string
            createdAt: string
            updatedAt: string
        }
        motorcycle: {
            id: string
            provider: string
            brand: string
            model: string
            plate: string
            engine: string
            chassis: string
            color: string
            cc: number
            gps: number
            createdAt: string
            updatedAt: string
        }
    }
    createdBy: {
        id: string
        name: string
        username: string
        passwordHash: string
        roles: string[]
        status: string
        createdAt: string
        updatedAt: string
        lastAccess: string
        refreshToken: string
    }
}

export type SortField = "userName" | "motorcycleModel" | "amount" | "date" | null
export type SortDirection = "asc" | "desc"
