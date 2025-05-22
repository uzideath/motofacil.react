"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import type { Loan as BaseLoan } from "../../../loans/loan-table"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { HttpService } from "@/lib/http"
import {
  CreditCard,
  Bike,
  User,
  DollarSign,
  CalendarIcon,
  Info,
  Paperclip,
  X,
  FileText,
  ImageIcon,
  File,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { PaymentSummaryCard } from "../payment-summary-card"
import { Progress } from "@/components/ui/progress"
import { uploadImageToCloudinary } from "@/lib/services/cloudinary"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Update schema to match DTO
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
    paymentDate: z.date().optional(), // Match the DTO with capital P
    notes: z.string().optional(),
    attachmentUrl: z.string().optional(),
    createdById: z.string().optional(),
  })
  .refine(
    (data) => {
      // If isLate is true, latePaymentDate is required
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

type EnrichedLoan = BaseLoan & {
  user: { name: string; identification?: string }
  motorcycle: { model: string; plate?: string }
  payments: { amount: number }[]
  monthlyPayment: number
  financedAmount: number
  totalCapitalPaid: number
  nextInstallmentNumber: number
}

export function InstallmentForm({
  children,
  loanId,
  installment,
  onSaved,
}: {
  children?: React.ReactNode
  loanId?: string
  installment?: any // Cuota existente para edición
  onSaved?: () => void
}) {
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
  const [isEditing, setIsEditing] = useState(false) // Nuevo estado para controlar si estamos editando
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      paymentDate: new Date(), // Initialize with current date
      notes: "",
      attachmentUrl: "",
      createdById: user?.id,
    },
  })

  // Efecto para cargar los datos de la cuota existente cuando se está editando
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

      // Create a temporary loan object to enable the button in edit mode
      if (!selectedLoan) {
        // Use a type assertion to avoid TypeScript errors
        const tempLoan = {
          id: installment.loanId,
          user: { name: "Cliente cargando..." },
          motorcycle: { model: "Cargando...", plate: "" },
          debtRemaining: 0,
          interestRate: 0,
          interestType: "FIXED",
          installments: 0,
          financedAmount: 0,
          totalCapitalPaid: 0,
          nextInstallmentNumber: 0,
          payments: [],
          monthlyPayment: 0,
          // Add these properties to satisfy BaseLoan requirements
          userId: "",
          contractNumber: "",
          motorcycleId: "",
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

      if (installment.PaymentDate) {
        form.setValue("paymentDate", new Date(installment.PaymentDate))
      }

      if (installment.attachmentUrl) {
        setFilePreview(installment.attachmentUrl)
      }
    } else {
      setIsEditing(false)
      // Set default values for new installment
      form.setValue("paymentDate", new Date())
      form.setValue("createdById", user?.id)
    }
  }, [installment, form, user, selectedLoan])

  const amount = form.watch("amount")
  const gps = form.watch("gps")
  const isLate = form.watch("isLate")

  useEffect(() => {
    if (selectedLoan && amount) {
      calculatePaymentBreakdown(selectedLoan, amount, gps)
    }
  }, [selectedLoan, amount, gps, isLate])

  const calculatePaymentBreakdown = (loan: EnrichedLoan, paymentAmount: number, gpsAmount: number) => {
    // Ensure all values are treated as numbers
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

    // Ensure proper numeric calculation
    const principalAmount = paymentAmountNum - interestAmount
    // Calculate total as a sum of numbers, not string concatenation
    const totalAmount = paymentAmountNum + gpsAmountNum

    setPaymentBreakdown({ principalAmount, interestAmount, totalAmount })
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
          motorcycleModel: loan.motorcycle?.model ?? "Sin modelo",
          motorcyclePlate: loan.motorcycle?.plate ?? "Sin placa",
          monthlyPayment,
          financedAmount,
          totalCapitalPaid: loan.totalPaid,
          nextInstallmentNumber: loan.paidInstallments + 1,
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

  useEffect(() => {
    if (open) loadLoans()
  }, [open])

  const handleLoanChange = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId)
    if (loan) {
      setSelectedLoan(loan)
      // Set default values for amount and GPS
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

    // Create preview for images
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

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />
    } else if (file.type === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-500" />
    } else {
      return <File className="h-5 w-5 text-gray-500" />
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
      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("authToken="))
        ?.split("=")[1]

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
        // Si estamos editando y hay una vista previa pero no un archivo nuevo, mantener la URL existente
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

      // Fechas válidas según DTO
      if (values.isLate && values.latePaymentDate) {
        payload.latePaymentDate = values.latePaymentDate.toISOString()
      }

      if (!isEditing) {
        payload.paymentDate = values.paymentDate
          ? values.paymentDate.toISOString()
          : new Date().toISOString()
      }

      if (isEditing && installment) {
        // Si estamos editando, hacer una petición PATCH
        await HttpService.patch(`/api/v1/installments/${installment.id}`, payload)
        toast({
          title: "Cuota actualizada",
          description: "La cuota ha sido actualizada correctamente",
        })
      } else {
        // Si estamos creando, hacer una petición POST
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

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
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
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[900px] p-0 max-h-[90vh] overflow-auto">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            {isEditing ? "Editar Cuota" : "Registrar Pago de Cuota"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifique los datos de la cuota existente."
              : "Complete el formulario para registrar un nuevo pago de cuota."}
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row">
              {/* Left column - Form fields */}
              <div className="flex-1 p-6 pt-0 border-r">
                <div className="space-y-6">
                  {/* Client Information */}
                  <Card className="border-primary/20 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Información del Cliente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="loanId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cliente</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between bg-background hover:bg-background/80 transition-colors h-10"
                                  >
                                    {field.value
                                      ? loans.find((loan) => loan.id === field.value)
                                        ? `${loans.find((loan) => loan.id === field.value)?.user.name}`
                                        : "Seleccionar cliente"
                                      : "Seleccionar cliente"}
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="ml-2 h-4 w-4 shrink-0 opacity-50"
                                    >
                                      <path d="m7 15 5 5 5-5" />
                                      <path d="m7 9 5-5 5 5" />
                                    </svg>
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="Buscar por nombre, placa o identificación..." />
                                  <CommandList>
                                    <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                                    <CommandGroup>
                                      {loans.map((loan) => (
                                        <CommandItem
                                          key={loan.id}
                                          value={`${loan.user.name} ${loan.motorcycle.plate || ""} ${loan.user.identification || ""}`}
                                          onSelect={() => {
                                            field.onChange(loan.id)
                                            handleLoanChange(loan.id)
                                            // Close the popover when a selection is made
                                            document.body.click()
                                          }}
                                        >
                                          <div className="flex flex-col">
                                            <span className={loan.id === field.value ? "font-medium" : ""}>
                                              {loan.user.name}
                                            </span>
                                            {loan.motorcycle.plate && (
                                              <span className="text-xs text-muted-foreground">
                                                Placa: {loan.motorcycle.plate}
                                              </span>
                                            )}
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormItem>
                        <FormLabel>Vehículo</FormLabel>
                        <div className="relative h-10">
                          <Bike className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={selectedLoan?.motorcycle.model || ""}
                            className="pl-9 bg-muted/50 h-10"
                            disabled
                            placeholder="Seleccione un cliente primero"
                          />
                        </div>
                      </FormItem>

                      <FormItem>
                        <FormLabel>Placa</FormLabel>
                        <div className="relative h-10">
                          <Bike className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={selectedLoan?.motorcycle.plate || ""}
                            className="pl-9 bg-muted/50 h-10"
                            disabled
                            placeholder="Seleccione un cliente primero"
                          />
                        </div>
                      </FormItem>
                    </CardContent>
                  </Card>

                  {/* Payment Details */}
                  <Card className="border-primary/20 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        Detalles del Pago
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monto</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                  <Input
                                    type="text"
                                    className="pl-7"
                                    value={field.value ? field.value.toLocaleString() : ""}
                                    onChange={(e) => {
                                      // Remove non-numeric characters and convert to number
                                      const value = e.target.value.replace(/[^\d]/g, "")
                                      field.onChange(value ? Number.parseInt(value) : 0)
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="gps"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GPS</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                  <Input
                                    type="text"
                                    className="pl-7"
                                    value={field.value ? field.value.toLocaleString() : ""}
                                    onChange={(e) => {
                                      // Remove non-numeric characters and convert to number
                                      const value = e.target.value.replace(/[^\d]/g, "")
                                      field.onChange(value ? Number.parseInt(value) : 0)
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Método de pago</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar método" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="CASH">Efectivo</SelectItem>
                                <SelectItem value="TRANSACTION">Transferencia</SelectItem>
                                <SelectItem value="CARD">Tarjeta</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Payment Date field (matches DTO with capital P) */}
                      <FormField
                        control={form.control}
                        name="paymentDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de pago</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"
                                      }`}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: es })
                                    ) : (
                                      <span>Seleccionar fecha</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>Fecha en que se realizó el pago</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isLate"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked)
                                  // If unchecked, clear the late payment date
                                  if (!checked) {
                                    form.setValue("latePaymentDate", undefined)
                                  } else {
                                    // If checked and no date is set, set to today
                                    if (!form.getValues("latePaymentDate")) {
                                      form.setValue("latePaymentDate", new Date())
                                    }
                                  }
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="cursor-pointer">Pago atrasado</FormLabel>
                              <FormDescription className="text-xs">
                                Marcar si el pago se realizó fuera de fecha
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      {isLate && (
                        <FormField
                          control={form.control}
                          name="latePaymentDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha de pago atrasado</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"
                                        }`}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP", { locale: es })
                                      ) : (
                                        <span>Seleccionar fecha</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value || undefined}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>Fecha en que se realizó el pago atrasado</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notas</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Agregue notas o comentarios sobre este pago..."
                                className="resize-none min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>Información adicional sobre el pago (opcional)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* File Attachment Section */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-sm">Adjuntar archivo</FormLabel>
                          <FormDescription className="text-[10px]">Máximo 5MB</FormDescription>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div
                            className="border-2 border-dashed rounded-md p-3 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Paperclip className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-xs font-medium">Haga clic para seleccionar un archivo</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">o arrastre y suelte aquí</p>
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              onChange={handleFileChange}
                              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                            />
                          </div>

                          {(selectedFile || filePreview) && (
                            <div className="bg-muted/30 rounded-md p-2 relative">
                              <div className="flex items-center gap-2">
                                {filePreview ? (
                                  <div className="h-10 w-10 rounded-md overflow-hidden border">
                                    <img
                                      src={filePreview || "/placeholder.svg"}
                                      alt="Vista previa"
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-10 w-10 rounded-md bg-background flex items-center justify-center border">
                                    {selectedFile && getFileIcon(selectedFile)}
                                  </div>
                                )}

                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {selectedFile ? selectedFile.name : "Archivo adjunto"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "Archivo existente"}
                                  </p>
                                </div>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={removeFile}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>

                              {isUploading && (
                                <div className="mt-1">
                                  <Progress value={uploadProgress} className="h-[3px]" />
                                  <p className="text-[10px] text-right mt-0.5 text-muted-foreground">
                                    {uploadProgress}%
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right column - Summary and data */}
              <div className="flex-1 p-6 pt-0">
                <div className="space-y-6">
                  {selectedLoan ? (
                    <>
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/30 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <Info className="h-4 w-4" />
                            Información del préstamo
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs font-medium text-blue-600/70 dark:text-blue-400/70 mb-1">
                                Deuda restante:
                              </p>
                              <p className="text-base font-semibold text-blue-700 dark:text-blue-300">
                                {formatCurrency(selectedLoan.debtRemaining)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-blue-600/70 dark:text-blue-400/70 mb-1">
                                Cuota mensual:
                              </p>
                              <p className="text-base font-semibold text-blue-700 dark:text-blue-300">
                                {formatCurrency(selectedLoan.monthlyPayment)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs font-medium text-blue-600/70 dark:text-blue-400/70 mb-1">
                                Tasa de interés:
                              </p>
                              <p className="text-base font-semibold text-blue-700 dark:text-blue-300">
                                {selectedLoan.interestRate}%
                                <span className="text-xs ml-1 font-normal">
                                  ({selectedLoan.interestType === "FIXED" ? "Fijo" : "Compuesto"})
                                </span>
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-blue-600/70 dark:text-blue-400/70 mb-1">
                                Próxima cuota:
                              </p>
                              <p className="text-base font-semibold text-blue-700 dark:text-blue-300">
                                #{selectedLoan.nextInstallmentNumber}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {paymentBreakdown && (
                        <>
                          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/20 border-green-200 dark:border-green-800/30 shadow-sm">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2 text-green-700 dark:text-green-300">
                                <DollarSign className="h-4 w-4" />
                                Desglose del pago
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <p className="text-xs font-medium text-green-600/70 dark:text-green-400/70 mb-1">
                                      Capital:
                                    </p>
                                    <p className="text-base font-semibold text-green-700 dark:text-green-300">
                                      {formatCurrency(paymentBreakdown.principalAmount)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-green-600/70 dark:text-green-400/70 mb-1">
                                      Interés:
                                    </p>
                                    <p className="text-base font-semibold text-green-700 dark:text-green-300">
                                      {formatCurrency(paymentBreakdown.interestAmount)}
                                    </p>
                                  </div>
                                </div>

                                {gps > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-green-600/70 dark:text-green-400/70 mb-1">
                                      GPS:
                                    </p>
                                    <p className="text-base font-semibold text-green-700 dark:text-green-300">
                                      {formatCurrency(gps)}
                                    </p>
                                  </div>
                                )}

                                <div className="pt-3 mt-3 border-t border-green-200 dark:border-green-800/50">
                                  <p className="text-xs font-medium text-green-600/70 dark:text-green-400/70 mb-1">
                                    Total a pagar:
                                  </p>
                                  <p className="text-xl font-semibold text-green-700 dark:text-green-300">
                                    {formatCurrency(paymentBreakdown.totalAmount)}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <PaymentSummaryCard
                            loanAmount={selectedLoan.financedAmount}
                            paidAmount={selectedLoan.totalCapitalPaid}
                            remainingAmount={selectedLoan.debtRemaining}
                            progress={(selectedLoan.totalCapitalPaid / selectedLoan.financedAmount) * 100}
                          />
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center text-muted-foreground">
                      <User className="h-12 w-12 mb-4 opacity-20" />
                      <h3 className="text-lg font-medium mb-2">Seleccione un cliente</h3>
                      <p className="text-sm max-w-xs">
                        Seleccione un cliente para ver la información del préstamo y calcular el desglose del pago
                      </p>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="mt-6 pt-6 border-t flex flex-col items-end gap-2">
                  <div className="flex justify-end gap-4 w-full">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading || (!isEditing && !selectedLoan)} className="gap-2">
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {isEditing ? "Actualizando..." : "Registrando..."}
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          {isEditing ? "Actualizar Cuota" : "Registrar Pago"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
