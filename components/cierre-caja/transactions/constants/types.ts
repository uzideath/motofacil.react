// Common types used across transaction components

export enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  TRANSACTION = "TRANSACTION",
}

export enum Providers {
  MOTOFACIL = "MOTOFACIL",
  OBRASOCIAL = "OBRASOCIAL",
  PORCENTAJETITO = "PORCENTAJETITO",
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

export interface User {
  id: string
  name: string
}

export interface Motorcycle {
  id: string
  plate: string
  provider?: string
}

export interface Loan {
  id: string
  user: User
  motorcycle: Motorcycle
}

export interface Installment {
  id: string
  paymentDate: string
  paymentMethod: PaymentMethod
  amount: number
  gps: number
  loan: Loan
  createdBy?: {
    id: string
    username: string
  }
}

export interface Expense {
  id: string
  amount: number
  date: string
  category: ExpenseCategory | string
  provider: string
  paymentMethod: PaymentMethod
  beneficiary: string
  reference?: string
  description: string
  createdBy?: {
    id: string
    username: string
  }
}

export interface Transaction {
  id: string
  time: string
  description: string
  category: string
  amount: number
  baseAmount?: number
  gpsAmount?: number
  paymentMethod: string
  type: TransactionType
  reference: string
  client?: string
  provider?: string
  date: Date
  createdBy?: {
    id: string
    username: string
  }
}

export interface SelectedTransaction {
  id: string
  amount: number
  paymentMethod: PaymentMethod
  type: TransactionType
  provider?: string
}

export type TransactionType = "income" | "expense"
export type SortField = "time" | "description" | "category" | "amount" | "provider" | null
export type SortDirection = "asc" | "desc"

export interface TransactionFiltersState {
  searchTerm: string
  typeFilter: string
  providerFilter: string
  sortField: SortField
  sortDirection: SortDirection
}

export interface TransactionResponse {
  installments: Installment[]
  expenses: Expense[]
}

export interface TransactionSummary {
  totalIncome: number
  totalExpense: number
  netAmount: number
}

export interface PaginationState {
  currentPage: number
  totalPages: number
  itemsPerPage: number
}
