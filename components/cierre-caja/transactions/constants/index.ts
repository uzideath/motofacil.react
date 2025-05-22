import { Bike, Building, CreditCard, FileText, Home, Percent, Receipt, User, Wallet } from "lucide-react"
import { ExpenseCategory, Providers } from "./types"

// Payment method mapping
export const PAYMENT_METHOD_LABELS = {
    CASH: "Efectivo",
    CARD: "Tarjeta",
    TRANSACTION: "Transferencia",
    DEFAULT: "Otro",
}

// Provider mapping
export const PROVIDER_DETAILS = {
    [Providers.MOTOFACIL]: {
        label: "Moto Facil",
        color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/30",
        icon: Bike,
    },
    [Providers.OBRASOCIAL]: {
        label: "Obra Social",
        color:
            "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30",
        icon: Building,
    },
    [Providers.PORCENTAJETITO]: {
        label: "Porcentaje Tito",
        color:
            "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800/30",
        icon: Percent,
    },
}

// Category mapping
export const CATEGORY_DETAILS = {
    [ExpenseCategory.RENT]: {
        label: "Alquiler",
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800/30",
        icon: Home,
    },
    [ExpenseCategory.SERVICES]: {
        label: "Servicios",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/30",
        icon: FileText,
    },
    [ExpenseCategory.SALARIES]: {
        label: "Salarios",
        color:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/30",
        icon: User,
    },
    [ExpenseCategory.TAXES]: {
        label: "Impuestos",
        color:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/30",
        icon: Receipt,
    },
    [ExpenseCategory.MAINTENANCE]: {
        label: "Mantenimiento",
        color:
            "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800/30",
        icon: FileText,
    },
    [ExpenseCategory.PURCHASES]: {
        label: "Compras",
        color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800/30",
        icon: Wallet,
    },
    [ExpenseCategory.MARKETING]: {
        label: "Marketing",
        color:
            "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/30",
        icon: FileText,
    },
    [ExpenseCategory.TRANSPORT]: {
        label: "Transporte",
        color:
            "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800/30",
        icon: FileText,
    },
    [ExpenseCategory.OTHER]: {
        label: "Otros",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800/30",
        icon: FileText,
    },
    "Cuota de préstamo": {
        label: "Cuota de préstamo",
        color:
            "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/30",
        icon: CreditCard,
    },
}

// Payment method icons
export const PAYMENT_METHOD_ICONS = {
    Efectivo: { icon: Wallet, color: "text-green-500" },
    Tarjeta: { icon: CreditCard, color: "text-blue-500" },
    Transferencia: { icon: Receipt, color: "text-purple-500" },
    DEFAULT: { icon: FileText, color: "text-gray-500" },
}

// Transaction type icons
export const TRANSACTION_TYPE_STYLES = {
    income: {
        iconBg: "bg-green-100 dark:bg-green-900/30",
        iconColor: "text-green-600 dark:text-green-400",
        textColor: "text-green-600 dark:text-green-400",
    },
    expense: {
        iconBg: "bg-red-100 dark:bg-red-900/30",
        iconColor: "text-red-600 dark:text-red-400",
        textColor: "text-red-600 dark:text-red-400",
    },
}

// API endpoints
export const API_ENDPOINTS = {
    AVAILABLE_PAYMENTS: "/api/v1/closing/available-payments",
}

// Pagination
export const DEFAULT_ITEMS_PER_PAGE = 10

// Filter options
export const FILTER_OPTIONS = {
    TYPE: [
        { value: "all", label: "Todos los movimientos" },
        { value: "income", label: "Solo ingresos" },
        { value: "expense", label: "Solo egresos" },
    ],
    PROVIDER: [
        { value: "all", label: "Todos los proveedores" },
        { value: Providers.MOTOFACIL, label: "Moto Facil" },
        { value: Providers.OBRASOCIAL, label: "Obra Social" },
        { value: Providers.PORCENTAJETITO, label: "Porcentaje Tito" },
    ],
}
