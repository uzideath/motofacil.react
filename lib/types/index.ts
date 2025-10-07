
type Owner = {
    id: string
    name: string
    username: string
    role: "ADMIN" | "USER" | "MANAGER"
    status: "ACTIVE" | "INACTIVE"
    lastLogin: string
    createdAt: string
}


type User = {
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

export enum VehicleType {
    MOTORCYCLE = "MOTORCYCLE",
    CAR = "CAR",
    TRUCK = "TRUCK",
    VAN = "VAN",
    ATV = "ATV",
    OTHER = "OTHER",
}

type Vehicle = {
    id: string
    providerId: string
    provider: Provider
    vehicleType: VehicleType
    brand: string
    model: string
    plate: string
    price?: number
    engine?: string
    chassis?: string
    color: string | null
    cc: number | null
    gps: number | null
    createdAt: string
    updatedAt: string
}

// Legacy type alias for backwards compatibility
type Motorcycle = Vehicle

export type Loan = {
    id: string
    userId: string
    contractNumber: string | null
    vehicleId: string
    totalAmount: number
    downPayment: number
    installments: number
    paidInstallments: number
    remainingInstallments: number
    totalPaid: number
    debtRemaining: number
    interestRate: number
    interestType: "FIXED" | "COMPOUND" | undefined
    paymentFrequency: "DAILY" | "MONTHLY" | "BIWEEKLY" | "WEEKLY" | undefined
    installmentPaymentAmmount: number
    gpsInstallmentPayment: number
    archived: boolean
    createdAt: string
    updatedAt: string
    startDate: string
    endDate: string | null
    status: LoanStatus
    payments: Installment[]
    user: User
    vehicle: Vehicle
    // Legacy property for backwards compatibility
    motorcycleId?: string
    motorcycle?: Vehicle
}


type Installment = {
    id: string
    loanId: string
    paymentMethod: PaymentMethod
    amount: number
    gps: number
    paymentDate: string
    isLate: boolean
    latePaymentDate: string | null
    notes: string | null
    attachmentUrl: string | null
    createdById: string
    archived: boolean
    createdAt: string
    updatedAt: string
    cashRegisterId: string | null

    loan: Loan

    createdBy?: {
        id: string
        username: string
        name: string
    }
}


type Expense = {
    id: string
    amount: number
    date: string
    providerId: string | null
    provider: Provider | null
    category: ExpenseCategory
    paymentMethod: PaymentMethod
    beneficiary: string
    reference: string | null
    description: string
    attachmentUrl: string | null
    cashRegisterId: string | null
    createdById: string | null
    createdBy?: {
        id: string
        username: string
    }
    createdAt: string
    updatedAt: string
}


type Provider = {
    id: string
    name: string
    vehicles: Vehicle[]
    motorcylces?: Motorcycle[] // Legacy property for backwards compatibility
    cashRegisters: Closing[]
    createdAt: string
    updatedAt: string
}

export interface Closing {
    id: string
    date: string
    providerId: string
    cashInRegister: number
    cashFromTransfers: number
    cashFromCards: number
    notes: string
    createdAt: string
    updatedAt: string
    createdById: string

    payments: Installment[]
    expense: Expense[]

    createdBy: Pick<Owner, 'id' | 'username'>
    provider: Provider
}


type SummaryData = {
    totalIncome: number
    totalExpenses: number
    balance: number
    previousDayComparison: number
    paymentMethods: {
        cash: number
        transfer: number
        card: number
        other: number
    }
    expenseMethods: {
        CASH?: number
        TRANSACTION?: number
        CARD?: number
    }
    categories: {
        loanPayments: number
        otherIncome: number
        expenses: Record<string, number>
    }
}

export interface LoginPayload {
    username: string
    password: string
}

export interface LoginResponse {
    access_token: string
    refresh_token: string
    user: {
        id: string
        username: string
        roles: string[]
        status: string
        createdAt: string
        updatedAt: string
        lastAccess: string
    }
}

export enum PaymentMethods {
    CASH = "CASH",
    TRANSACTION = "TRANSACTION",
    CARD = "CARD",
}

export enum PaymentMethod {
    CASH = "CASH",
    CARD = "CARD",
    TRANSACTION = "TRANSACTION",
}

export enum ExpenseCategory {
    RENT = "RENT",
    SERVICES = "SERVICES",
    SALARIES = "SALARIES",
    TAXES = "TAXES",
    MAINTENANCE = "MAINTENANCE",
    PURCHASES = "PURCHASES",
    MARKETING = "MARKETING",
    TRANSPORT = "TRANSPORT",
    OTHER = "OTHER",
}

enum LoanStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    DEFAULTED = "DEFAULTED",
    ARCHIVED = "ARCHIVED",
}

export enum Providers {
    MOTOFACIL = "Moto Facil",
    TITO = "Tito",
    OBRASOCIAL = "Obra Social",
}

export type {
    Owner,
    Installment,
    User,
    Provider,
    Vehicle,
    Motorcycle,
    Expense,
    SummaryData
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

export type CashRegisterDisplay = {
    id: string
    date: string
    time: string
    user: string
    provider?: Provider
    totalIncome: number
    totalExpense: number
    balance: number
    status: "balanced" | "minor-diff" | "major-diff"
    cashInRegister: number
    cashFromTransfers: number
    cashFromCards: number
    notes: string
    raw: Closing
}
