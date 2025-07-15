"use client"

import { useState, useEffect, useRef } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/components/ui/use-toast"
import { HttpService } from "@/lib/http"
import { Loan, Motorcycle, User } from "@/lib/types"

const loanSchema = z.object({
    userId: z.string().min(1, { message: "Por favor, selecciona un cliente." }),
    motorcycleId: z.string().min(1, { message: "Por favor, selecciona una motocicleta." }),
    totalAmount: z.coerce.number().min(1, { message: "El precio total debe ser mayor a cero." }),
    downPayment: z.coerce.number().min(0, { message: "El pago inicial no puede ser negativo." }),
    loanTermMonths: z.coerce.number().min(1, { message: "El plazo del préstamo debe ser al menos 1 mes." }),
    interestRate: z.coerce.number().min(0, { message: "La tasa de interés no puede ser negativa." }),
    interestType: z.enum(["FIXED", "COMPOUND"]),
    paymentFrequency: z.enum(["DAILY", "MONTHLY", "BIWEEKLY", "WEEKLY"]),
    installmentPaymentAmmount: z.coerce.number().optional(),
    gpsAmount: z.coerce.number().min(0, { message: "El monto de GPS no puede ser negativo." }).optional(),
})

type LoanFormValues = z.infer<typeof loanSchema>

interface UseLoanFormProps {
    loanId?: string
    loanData?: Loan
    onSaved?: (updatedLoan?: Loan) => void
}

// Helper functions
const getInstallmentsFromMonths = (months: number, frequency: string): number => {
    switch (frequency) {
        case "DAILY":
            return months * 30
        case "WEEKLY":
            return months * 4
        case "BIWEEKLY":
            return months * 2
        case "MONTHLY":
        default:
            return months
    }
}

const getFrequencyText = (frequency: string): string => {
    switch (frequency) {
        case "DAILY":
            return "diarios"
        case "WEEKLY":
            return "semanales"
        case "BIWEEKLY":
            return "quincenales"
        case "MONTHLY":
        default:
            return "mensuales"
    }
}

const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === undefined) {
        return "COP 0"
    }
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    }).format(amount)
}

const formatNumber = (value: number | string | undefined): string => {
    if (value === undefined || value === null || value === "") return ""
    const numValue = typeof value === "string" ? Number.parseFloat(value) : value
    if (isNaN(numValue)) return ""
    return numValue.toLocaleString("es-CO").replace(/,/g, ".")
}

const parseFormattedNumber = (value: string): number => {
    if (!value) return 0
    const cleanValue = value.replace(/[^\d,.-]/g, "").replace(/\./g, "")
    return Number.parseFloat(cleanValue) || 0
}

export function useLoanForm({ loanId, loanData, onSaved }: UseLoanFormProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<User[]>([])
    const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([])
    const [availableUsers, setAvailableUsers] = useState<User[]>([])
    const [availableMotorcycles, setAvailableMotorcycles] = useState<Motorcycle[]>([])
    const [loadingData, setLoadingData] = useState(false)
    const [loanSummary, setLoanSummary] = useState<any>(null)
    const { toast } = useToast()
    const dataLoaded = useRef(false)
    const isMounted = useRef(false)
    const calculationInProgress = useRef(false)

    const form = useForm<LoanFormValues>({
        resolver: zodResolver(loanSchema),
        defaultValues: {
            userId: "",
            motorcycleId: "",
            totalAmount: 4000000,
            downPayment: 0,
            loanTermMonths: 18,
            interestRate: 12,
            interestType: "FIXED",
            paymentFrequency: "DAILY",
            installmentPaymentAmmount: 32000,
            gpsAmount: 2000,
        },
    })

    const formValues = form.watch()

    useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
        }
    }, [])

    const calculateLoanSummary = (values: LoanFormValues) => {
        if (calculationInProgress.current) return
        calculationInProgress.current = true
        try {
            const totalAmount = Number(values.totalAmount) || 0
            const downPayment = Number(values.downPayment) || 0
            const loanTermMonths = Number(values.loanTermMonths) || 1
            const interestRate = Number(values.interestRate) || 0
            const installmentPaymentAmmount = Number(values.installmentPaymentAmmount) || 32000
            const gpsAmount = Number(values.gpsAmount) || 0

            if (totalAmount <= 0 || loanTermMonths <= 0) {
                return
            }

            const financedAmount = totalAmount - downPayment
            let totalWithInterest: number
            let paymentAmount: number
            let totalPaymentWithGps: number

            const totalInstallments = getInstallmentsFromMonths(loanTermMonths, values.paymentFrequency)

            if (values.interestType === "FIXED") {
                const interestAmount = financedAmount * (interestRate / 100) * (loanTermMonths / 12)
                totalWithInterest = financedAmount + interestAmount
            } else {
                const monthlyRate = interestRate / 100 / 12
                totalWithInterest = financedAmount * Math.pow(1 + monthlyRate, loanTermMonths)
            }

            if (values.paymentFrequency === "DAILY") {
                paymentAmount = installmentPaymentAmmount
                totalPaymentWithGps = paymentAmount + gpsAmount
                const daysToPayOff = Math.ceil(totalWithInterest / paymentAmount)
                if (isMounted.current) {
                    setLoanSummary({
                        financedAmount,
                        totalWithInterest,
                        paymentAmount,
                        gpsAmount,
                        totalPaymentWithGps,
                        totalInstallments,
                        daysToPayOff,
                        totalInterest: totalWithInterest - financedAmount,
                    })
                }
            } else {
                paymentAmount = totalWithInterest / totalInstallments
                totalPaymentWithGps = paymentAmount + gpsAmount
                if (isMounted.current) {
                    setLoanSummary({
                        financedAmount,
                        totalWithInterest,
                        paymentAmount,
                        gpsAmount,
                        totalPaymentWithGps,
                        totalInstallments,
                        totalInterest: totalWithInterest - financedAmount,
                    })
                }
            }
        } catch (error) {
            console.error("Error calculating loan summary:", error)
        } finally {
            calculationInProgress.current = false
        }
    }

    const watchedValues = useWatch({
        control: form.control,
        name: [
            "totalAmount",
            "downPayment",
            "loanTermMonths",
            "interestRate",
            "interestType",
            "paymentFrequency",
            "installmentPaymentAmmount",
            "gpsAmount",
        ],
    })

    useEffect(() => {
        if (isOpen && isMounted.current) {
            const values = form.getValues()
            calculateLoanSummary(values)
        }
    }, [watchedValues, isOpen])

    const filterAvailableOptions = async (allUsers: User[], allMotorcycles: Motorcycle[]) => {
        try {
            const token = document.cookie
                .split("; ")
                .find((c) => c.startsWith("authToken="))
                ?.split("=")[1]

            // Fetch existing active loans
            const loansResponse = await HttpService.get<Loan[]>("/api/v1/loans", {
                headers: { Authorization: token ? `Bearer ${token}` : "" },
            })

            const activeLoans = loansResponse.data.filter(
                (loan) => !loan.archived && loan.status !== "COMPLETED" && loan.status !== "DEFAULTED",
            )

            // Get IDs of users and motorcycles that are already assigned to active loans
            const assignedUserIds = new Set(activeLoans.map((loan) => loan.userId))
            const assignedMotorcycleIds = new Set(activeLoans.map((loan) => loan.motorcycleId))

            // If we're editing a loan, allow the current user and motorcycle to be available
            if (loanData) {
                assignedUserIds.delete(loanData.userId)
                assignedMotorcycleIds.delete(loanData.motorcycleId)
            }

            // Filter out assigned users and motorcycles
            const filteredUsers = allUsers.filter((user) => !assignedUserIds.has(user.id))
            const filteredMotorcycles = allMotorcycles.filter((motorcycle) => !assignedMotorcycleIds.has(motorcycle.id))

            setAvailableUsers(filteredUsers)
            setAvailableMotorcycles(filteredMotorcycles)
        } catch (error) {
            console.error("Error filtering available options:", error)
            // Fallback to showing all options if filtering fails
            setAvailableUsers(allUsers)
            setAvailableMotorcycles(allMotorcycles)
        }
    }

    const loadInitialData = async () => {
        if (dataLoaded.current || !isMounted.current) return
        setLoadingData(true)
        try {
            const token = document.cookie
                .split("; ")
                .find((c) => c.startsWith("authToken="))
                ?.split("=")[1]

            const [userRes, motoRes] = await Promise.all([
                HttpService.get<User[]>("/api/v1/users", { headers: { Authorization: token ? `Bearer ${token}` : "" } }),
                HttpService.get<Motorcycle[]>("/api/v1/motorcycles", {
                    headers: { Authorization: token ? `Bearer ${token}` : "" },
                }),
            ])

            setUsers(userRes.data)
            setMotorcycles(motoRes.data)

            // Filter available options based on existing loans
            await filterAvailableOptions(userRes.data, motoRes.data)

            if (loanData) {
                // Convert installments back to months if needed
                let loanTermMonths = loanData.installments
                if (loanData.paymentFrequency === "DAILY") {
                    loanTermMonths = Math.ceil(loanData.installments / 30)
                } else if (loanData.paymentFrequency === "WEEKLY") {
                    loanTermMonths = Math.ceil(loanData.installments / 4)
                } else if (loanData.paymentFrequency === "BIWEEKLY") {
                    loanTermMonths = Math.ceil(loanData.installments / 2)
                }

                // Split installmentPaymentAmmount into payment and GPS if needed
                let installmentPayment = loanData.installmentPaymentAmmount ?? 32000
                let gpsAmount = loanData.gpsInstallmentPayment ?? 2000

                // If there's no GPS amount but we have a total payment, assume default split
                if (loanData.installmentPaymentAmmount && !loanData.gpsInstallmentPayment) {
                    installmentPayment = Math.max(0, loanData.installmentPaymentAmmount - 2000)
                    gpsAmount = 2000
                }

                form.reset({
                    userId: loanData.userId,
                    motorcycleId: loanData.motorcycleId,
                    totalAmount: loanData.totalAmount,
                    downPayment: loanData.downPayment ?? 0,
                    loanTermMonths: loanTermMonths,
                    interestRate: loanData.interestRate ?? 12,
                    interestType: loanData.interestType ?? "FIXED",
                    paymentFrequency: loanData.paymentFrequency ?? "DAILY",
                    installmentPaymentAmmount: installmentPayment,
                    gpsAmount: gpsAmount,
                })
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos" })
        } finally {
            setLoadingData(false)
            dataLoaded.current = true
        }
    }

    const handleMotorcycleChange = (motorcycleId: string) => {
        const selected = motorcycles.find((m) => m.id === motorcycleId)
        if (selected) form.setValue("totalAmount", selected.price || 0)
    }

    const onSubmit = async (values: LoanFormValues) => {
        try {
            setLoading(true)
            const token = document.cookie
                .split("; ")
                .find((c) => c.startsWith("authToken="))
                ?.split("=")[1]

            const totalInstallments = getInstallmentsFromMonths(values.loanTermMonths, values.paymentFrequency)

            const submissionValues = {
                ...values,
                totalAmount: Number(values.totalAmount) || 0,
                downPayment: Number(values.downPayment) || 0,
                installments: totalInstallments,
                interestRate: Number(values.interestRate) || 0,
                installmentPaymentAmmount: Number(values.installmentPaymentAmmount) || 32000,
                gpsInstallmentPayment: Number(values.gpsAmount) || 0,
            }

            // Remove fields that are not part of the API
            delete (submissionValues as any).loanTermMonths
            delete (submissionValues as any).gpsAmount

            let response
            if (loanId) {
                response = await HttpService.patch(`/api/v1/loans/${loanId}`, submissionValues, {
                    headers: { Authorization: token ? `Bearer ${token}` : "" },
                })
            } else {
                response = await HttpService.post("/api/v1/loans", submissionValues, {
                    headers: { Authorization: token ? `Bearer ${token}` : "" },
                })
            }

            toast({ title: loanId ? "Préstamo actualizado" : "Préstamo creado", description: "Operación exitosa" })
            setIsOpen(false)
            onSaved?.(response.data)
        } catch (error) {
            console.error("Error al guardar préstamo:", error)
            toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el préstamo" })
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDialog = () => {
        setIsOpen(true)
        if (!dataLoaded.current) loadInitialData()
    }

    const handleCloseDialog = () => {
        setIsOpen(false)
        setLoanSummary(null)
    }

    return {
        // State
        isOpen,
        loading,
        loadingData,
        availableUsers,
        availableMotorcycles,
        loanSummary,
        form,
        formValues,

        // Actions
        handleOpenDialog,
        handleCloseDialog,
        handleMotorcycleChange,
        onSubmit,

        // Utilities
        formatCurrency,
        formatNumber,
        parseFormattedNumber,
        getFrequencyText,
    }
}
