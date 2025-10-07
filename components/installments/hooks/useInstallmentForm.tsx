"use client"

import { useState, useEffect, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loan as BaseLoan, Installment } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { HttpService } from "@/lib/http"
import { useAuth } from "@/hooks/useAuth"
import { uploadImageToCloudinary } from "@/lib/services/cloudinary"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const installmentSchema = z
    .object({
        loanId: z.string({ required_error: "Debe seleccionar un préstamo" }),
        amount: z.coerce.number().min(1, { message: "El monto debe ser mayor a 0" }),
        gps: z.coerce.number(),
        paymentMethod: z.enum(["CASH", "CARD", "TRANSACTION"], {
            required_error: "Debe seleccionar un método de pago",
        }),
        isLate: z.boolean().default(false),
        latePaymentDate: z.date().optional(),
        paymentDate: z.date().optional(),
        notes: z.string().optional(),
        attachmentUrl: z.string().optional(),
        createdById: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.isLate && !data.latePaymentDate) {
                return false
            }
            return true
        },
        {
            message: "Debe seleccionar una fecha de pago cuando el pago es atrasado",
            path: ["latePaymentDate"],
        },
    )

type InstallmentFormValues = z.infer<typeof installmentSchema>

export type EnrichedLoan = BaseLoan & {
    user: { name: string; identification?: string }
    vehicle: { model: string; plate?: string }
    motorcycle?: { model: string; plate?: string } // Legacy support
    payments: Installment[]
    monthlyPayment: number
    financedAmount: number
    totalCapitalPaid: number
    nextInstallmentNumber: number
}

interface UseInstallmentFormProps {
    loanId?: string
    installment?: any
    onSaved?: () => void
}

export function useInstallmentForm({ loanId, installment, onSaved }: UseInstallmentFormProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loans, setLoans] = useState<EnrichedLoan[]>([])
    const [loadingData, setLoadingData] = useState(true)
    const [selectedLoan, setSelectedLoan] = useState<EnrichedLoan | null>(null)
    const [paymentBreakdown, setPaymentBreakdown] = useState<{
        principalAmount: number
        interestAmount: number
        totalAmount: number
    } | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [filePreview, setFilePreview] = useState<string | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [lastInstallmentInfo, setLastInstallmentInfo] = useState<{
        lastPaymentDate: Date | null
        daysSinceLastPayment: number | null
    } | null>(null)

    const { toast } = useToast()
    const { user } = useAuth()

    const form = useForm<InstallmentFormValues>({
        resolver: zodResolver(installmentSchema),
        defaultValues: {
            loanId: loanId || "",
            amount: 0,
            gps: 0,
            isLate: false,
            latePaymentDate: undefined,
            paymentDate: new Date(),
            notes: "",
            attachmentUrl: "",
            createdById: user?.id,
        },
    })

    const amount = form.watch("amount")
    const gps = form.watch("gps")
    const isLate = form.watch("isLate")

    // Load installment data for editing
    useEffect(() => {
        if (installment) {
            setIsEditing(true)
            form.setValue("loanId", installment.loanId)
            form.setValue("amount", installment.amount)
            form.setValue("gps", installment.gps || 0)
            form.setValue("isLate", installment.isLate || false)
            form.setValue("paymentMethod", installment.paymentMethod || "CASH")
            form.setValue("notes", installment.notes || "")
            form.setValue("attachmentUrl", installment.attachmentUrl || "")
            form.setValue("createdById", installment.createdById || user?.id)

            if (!selectedLoan) {
                const tempLoan = {
                    id: installment.loanId,
                    user: { name: "Cliente cargando..." },
                    vehicle: { model: "Cargando...", plate: "" },
                    debtRemaining: 0,
                    interestRate: 0,
                    interestType: "FIXED",
                    installments: 0,
                    financedAmount: 0,
                    totalCapitalPaid: 0,
                    nextInstallmentNumber: 0,
                    payments: [],
                    monthlyPayment: 0,
                    userId: "",
                    contractNumber: "",
                    vehicleId: "",
                    totalAmount: 0,
                    downPayment: 0,
                    startDate: new Date(),
                    endDate: new Date(),
                    status: "ACTIVE",
                    paymentFrequency: "MONTHLY",
                    paidInstallments: 0,
                    totalPaid: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as unknown as EnrichedLoan
                setSelectedLoan(tempLoan)
            }

            if (installment.latePaymentDate) {
                form.setValue("latePaymentDate", new Date(installment.latePaymentDate))
            }
            if (installment.paymentDate) {
                form.setValue("paymentDate", new Date(installment.paymentDate))
            }
            if (installment.attachmentUrl) {
                setFilePreview(installment.attachmentUrl)
            }
        } else {
            setIsEditing(false)
            form.setValue("paymentDate", new Date())
            form.setValue("createdById", user?.id)
        }
    }, [installment, form, user, selectedLoan])

    // Calculate payment breakdown
    useEffect(() => {
        if (selectedLoan && amount) {
            calculatePaymentBreakdown(selectedLoan, amount, gps)
        }
    }, [selectedLoan, amount, gps, isLate])

    // Initialize late payment date
    useEffect(() => {
        if (isLate && !form.getValues("latePaymentDate")) {
            form.setValue("latePaymentDate", new Date())
        }
    }, [isLate, form])

    // Load loans when dialog opens
    useEffect(() => {
        if (open) loadLoans()
    }, [open])

    const calculatePaymentBreakdown = (loan: EnrichedLoan, paymentAmount: number, gpsAmount: number) => {
        const paymentAmountNum = Number(paymentAmount) || 0
        const gpsAmountNum = Number(gpsAmount) || 0
        const monthlyRate = loan.interestRate / 100 / 12
        const remainingPrincipal = loan.debtRemaining
        const interestAmount =
            loan.interestType === "FIXED"
                ? Math.min(
                    paymentAmountNum,
                    (loan.financedAmount * (loan.interestRate / 100) * (loan.installments / 12)) / loan.installments,
                )
                : Math.min(paymentAmountNum, remainingPrincipal * monthlyRate)

        const principalAmount = paymentAmountNum - interestAmount
        const totalAmount = paymentAmountNum + gpsAmountNum

        setPaymentBreakdown({ principalAmount, interestAmount, totalAmount })

        // Calculate last installment info
        if (loan.payments && loan.payments.length > 0) {
            // Sort payments by date to get the most recent one
            const sortedPayments = [...loan.payments].sort(
                (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
            )
            const lastPayment = sortedPayments[0]
            const lastPaymentDate = new Date(lastPayment.paymentDate)
            const today = new Date()

            // Set time to start of day for accurate day comparison
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            const lastPaymentStart = new Date(
                lastPaymentDate.getFullYear(),
                lastPaymentDate.getMonth(),
                lastPaymentDate.getDate(),
            )

            const daysSinceLastPayment = Math.floor(
                (todayStart.getTime() - lastPaymentStart.getTime()) / (1000 * 60 * 60 * 24),
            )

            setLastInstallmentInfo({
                lastPaymentDate,
                daysSinceLastPayment,
            })
        } else {
            // No payments yet - calculate days since loan start
            const startDate = new Date(loan.startDate)
            const today = new Date()
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            const startDateStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())

            const daysSinceStart = Math.floor((todayStart.getTime() - startDateStart.getTime()) / (1000 * 60 * 60 * 24))

            setLastInstallmentInfo({
                lastPaymentDate: null,
                daysSinceLastPayment: daysSinceStart,
            })
        }
    }

    const loadLoans = async () => {
        try {
            const token = document.cookie
                .split("; ")
                .find((c) => c.startsWith("authToken="))
                ?.split("=")[1]
            const res = await HttpService.get<any[]>("/api/v1/loans", {
                headers: { Authorization: token ? `Bearer ${token}` : "" },
            })
            const rawData = res.data
            const mappedLoans: EnrichedLoan[] = rawData.map((loan) => {
                const financedAmount = loan.totalAmount - loan.downPayment
                const monthlyPayment =
                    loan.paymentFrequency === "MONTHLY" ? loan.installmentPaymentAmmount : loan.installmentPaymentAmmount * 30
                return {
                    ...loan,
                    userName: loan.user?.name ?? "Sin nombre",
                    vehicleModel: loan.vehicle?.model ?? loan.motorcycle?.model ?? "Sin modelo",
                    vehiclePlate: loan.vehicle?.plate ?? loan.motorcycle?.plate ?? "Sin placa",
                    // Keep legacy fields for backwards compatibility
                    motorcycleModel: loan.vehicle?.model ?? loan.motorcycle?.model ?? "Sin modelo",
                    motorcyclePlate: loan.vehicle?.plate ?? loan.motorcycle?.plate ?? "Sin placa",
                    monthlyPayment,
                    financedAmount,
                    totalCapitalPaid: loan.totalPaid,
                    nextInstallmentNumber: loan.paidInstallments + 1,
                    payments: loan.payments || [],
                }
            })
            setLoans(mappedLoans)
            if (loanId) {
                const loan = mappedLoans.find((l) => l.id === loanId)
                if (loan) {
                    setSelectedLoan(loan)
                    form.setValue("loanId", loanId)
                    form.setValue("amount", loan.monthlyPayment)
                    calculatePaymentBreakdown(loan, loan.monthlyPayment, 0)
                }
            }
            setLoadingData(false)
        } catch (err) {
            console.error("Error al cargar arrendamientos:", err)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron cargar los arrendamientos",
            })
        }
    }

    const handleLoanChange = (loanId: string) => {
        const loan = loans.find((l) => l.id === loanId)
        if (loan) {
            setSelectedLoan(loan)
            form.setValue("amount", 32000)
            form.setValue("gps", 2000)
            calculatePaymentBreakdown(loan, 32000, 2000)
        } else {
            setSelectedLoan(null)
            setPaymentBreakdown(null)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > MAX_FILE_SIZE) {
            toast({
                variant: "destructive",
                title: "Archivo demasiado grande",
                description: "El archivo no debe superar los 5MB",
            })
            return
        }

        setSelectedFile(file)
        if (file.type.startsWith("image/")) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setFilePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        } else {
            setFilePreview(null)
        }
    }

    const removeFile = () => {
        setSelectedFile(null)
        setFilePreview(null)
        form.setValue("attachmentUrl", "")
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const simulateUploadProgress = () => {
        setIsUploading(true)
        setUploadProgress(0)
        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setIsUploading(false)
                    return 100
                }
                return prev + 10
            })
        }, 200)
        return () => clearInterval(interval)
    }

    const onSubmit = async (values: InstallmentFormValues) => {
        try {
            setLoading(true)
            let attachmentUrl: string | undefined = undefined

            if (selectedFile) {
                const cleanupProgress = simulateUploadProgress()
                const url = await uploadImageToCloudinary(selectedFile)
                cleanupProgress()
                if (!url) {
                    toast({
                        variant: "destructive",
                        title: "Error al subir el archivo",
                        description: "No se pudo subir el archivo a Cloudinary",
                    })
                    return
                }
                attachmentUrl = url
                form.setValue("attachmentUrl", url)
            } else if (isEditing && filePreview && !selectedFile) {
                attachmentUrl = filePreview
                form.setValue("attachmentUrl", filePreview)
            }

            const payload: Record<string, any> = {
                loanId: values.loanId,
                amount: values.amount,
                gps: values.gps,
                paymentMethod: values.paymentMethod,
                isLate: values.isLate,
                notes: values.notes || "",
                attachmentUrl: values.attachmentUrl || "",
                createdById: values.createdById || user?.id,
            }

            if (values.isLate && values.latePaymentDate) {
                payload.latePaymentDate = values.latePaymentDate.toISOString()
            }

            if (!isEditing) {
                payload.paymentDate = values.paymentDate ? values.paymentDate.toISOString() : new Date().toISOString()
            }

            if (isEditing && installment) {
                await HttpService.patch(`/api/v1/installments/${installment.id}`, payload)
                toast({
                    title: "Cuota actualizada",
                    description: "La cuota ha sido actualizada correctamente",
                })
            } else {
                await HttpService.post("/api/v1/installments", payload)
                toast({
                    title: "Pago registrado",
                    description: "El pago ha sido registrado correctamente",
                })
            }

            onSaved?.()
            setOpen(false)
        } catch (error) {
            console.error(`Error al ${isEditing ? "actualizar" : "registrar"} pago:`, error)
            toast({
                variant: "destructive",
                title: "Error",
                description: `No se pudo ${isEditing ? "actualizar" : "registrar"} el pago`,
            })
        } finally {
            setLoading(false)
            setIsUploading(false)
            setUploadProgress(0)
        }
    }

    const handleDialogChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            setLoadingData(true)
            setSelectedFile(null)
            setFilePreview(null)
            setUploadProgress(0)
            setIsUploading(false)
            if (!isEditing) {
                form.reset()
            }
        }
    }

    return {
        // State
        open,
        loading,
        loans,
        loadingData,
        selectedLoan,
        paymentBreakdown,
        selectedFile,
        filePreview,
        uploadProgress,
        isUploading,
        isEditing,
        fileInputRef,
        form,
        amount,
        gps,
        isLate,
        lastInstallmentInfo,

        // Actions
        setOpen,
        handleLoanChange,
        handleFileChange,
        removeFile,
        onSubmit,
        handleDialogChange,
    }
}
