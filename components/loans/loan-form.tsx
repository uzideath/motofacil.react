"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { HttpService } from "@/lib/http"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Bike,
  DollarSign,
  Calendar,
  Percent,
  CreditCard,
  Calculator,
  ChevronsUpDownIcon as ChevronUpDown,
  Save,
  User,
  Clock,
  Navigation,
} from "lucide-react"

interface I_User {
  id: string
  name: string
}

interface Motorcycle {
  id: string
  brand: string
  model: string
  plate: string
  price: number
}

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

const formatCurrency = (amount: number) => {
  // Check if amount is a valid number before formatting
  if (isNaN(amount) || amount === undefined) {
    return "COP 0"
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount)
}

// Format number with thousands separator (using dots)
const formatNumber = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === "") return ""

  // Convert to number if it's a string
  const numValue = typeof value === "string" ? Number.parseFloat(value) : value

  // Check if it's a valid number
  if (isNaN(numValue)) return ""

  // Format with thousands separator (dot)
  return numValue.toLocaleString("es-CO").replace(/,/g, ".")
}

// Parse formatted number back to number
const parseFormattedNumber = (value: string): number => {
  if (!value) return 0
  // Remove all non-numeric characters except decimal point
  const cleanValue = value.replace(/[^\d,.-]/g, "").replace(/\./g, "")
  return Number.parseFloat(cleanValue) || 0
}

// Helper function to convert months to installments based on payment frequency
const getInstallmentsFromMonths = (months: number, frequency: string): number => {
  switch (frequency) {
    case "DAILY":
      return months * 30 // Approximately 30 days per month
    case "WEEKLY":
      return months * 4 // Approximately 4 weeks per month
    case "BIWEEKLY":
      return months * 2 // 2 biweekly periods per month
    case "MONTHLY":
    default:
      return months // 1 installment per month
  }
}

// Helper function to get frequency display text
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

export function LoanForm({
  children,
  loanId,
  loanData,
  onSaved,
}: {
  children: React.ReactNode
  loanId?: string
  loanData?: any
  onSaved?: (updatedLoan?: any) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<I_User[]>([])
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([])
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
      loanTermMonths: 18, // Changed from installments to months
      interestRate: 12,
      interestType: "FIXED",
      paymentFrequency: "DAILY",
      installmentPaymentAmmount: 32000, // Updated from 34000 to 32000
      gpsAmount: 2000, // Added GPS amount
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
      // Ensure all values are valid numbers
      const totalAmount = Number(values.totalAmount) || 0
      const downPayment = Number(values.downPayment) || 0
      const loanTermMonths = Number(values.loanTermMonths) || 1
      const interestRate = Number(values.interestRate) || 0
      const installmentPaymentAmmount = Number(values.installmentPaymentAmmount) || 32000
      const gpsAmount = Number(values.gpsAmount) || 0

      // Skip calculation if essential values are missing or invalid
      if (totalAmount <= 0 || loanTermMonths <= 0) {
        return
      }

      const financedAmount = totalAmount - downPayment
      let totalWithInterest: number
      let paymentAmount: number
      let totalPaymentWithGps: number

      // Calculate total number of installments based on frequency and loan term in months
      const totalInstallments = getInstallmentsFromMonths(loanTermMonths, values.paymentFrequency)

      if (values.interestType === "FIXED") {
        const interestAmount = financedAmount * (interestRate / 100) * (loanTermMonths / 12)
        totalWithInterest = financedAmount + interestAmount
      } else {
        const monthlyRate = interestRate / 100 / 12
        totalWithInterest = financedAmount * Math.pow(1 + monthlyRate, loanTermMonths)
      }

      if (values.paymentFrequency === "DAILY") {
        // For daily payments, we use the fixed amount
        paymentAmount = installmentPaymentAmmount
        totalPaymentWithGps = paymentAmount + gpsAmount

        // Calculate how many days it would take to pay off the loan
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
        // For other frequencies, calculate the payment amount based on total installments
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

  const loadInitialData = async () => {
    if (dataLoaded.current || !isMounted.current) return
    setLoadingData(true)
    try {
      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("authToken="))
        ?.split("=")[1]
      const [userRes, motoRes] = await Promise.all([
        HttpService.get<I_User[]>("/api/v1/users", { headers: { Authorization: token ? `Bearer ${token}` : "" } }),
        HttpService.get<Motorcycle[]>("/api/v1/motorcycles", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }),
      ])
      setUsers(userRes.data)
      setMotorcycles(motoRes.data)
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
        let gpsAmount = loanData.gpsAmount ?? 2000

        // If there's no GPS amount but we have a total payment, assume default split
        if (loanData.installmentPaymentAmmount && !loanData.gpsAmount) {
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
    if (selected) form.setValue("totalAmount", selected.price)
  }

  async function onSubmit(values: LoanFormValues) {
    try {
      setLoading(true)
      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("authToken="))
        ?.split("=")[1]

      // Calculate total installments based on frequency and loan term
      const totalInstallments = getInstallmentsFromMonths(values.loanTermMonths, values.paymentFrequency)

      // Ensure all numeric values are valid numbers
      const submissionValues = {
        ...values,
        totalAmount: Number(values.totalAmount) || 0,
        downPayment: Number(values.downPayment) || 0,
        installments: totalInstallments,
        interestRate: Number(values.interestRate) || 0,
        installmentPaymentAmmount: Number(values.installmentPaymentAmmount) || 32000,
        gpsInstallmentPayment: Number(values.gpsAmount) || 0, // Changed from gpsAmount to gpsInstallmentPayment
      }

      // Remove loanTermMonths as it's not part of the API
      delete (submissionValues as any).loanTermMonths
      // Remove gpsAmount as we're using gpsInstallmentPayment instead
      delete (submissionValues as any).gpsAmount

      // Changed to post to /api/loans as requested
      const response = await HttpService.post("/api/v1/loans", submissionValues, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      })

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

  return (
    <>
      <div onClick={handleOpenDialog}>{children}</div>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={(open) => (open ? handleOpenDialog() : handleCloseDialog())}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                {loanId ? "Editar Préstamo" : "Nuevo Préstamo"}
              </DialogTitle>
              <DialogDescription>
                Complete el formulario para {loanId ? "actualizar el" : "crear un nuevo"} préstamo.
              </DialogDescription>
            </DialogHeader>
            {loadingData ? (
              <div className="py-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                  <Card className="border-primary/20 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Información del Cliente y Vehículo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="userId"
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
                                        ? users.find((user) => user.id === field.value)?.name || "Seleccionar cliente"
                                        : "Seleccionar cliente"}
                                      <ChevronUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0" align="start">
                                  <Command>
                                    <CommandInput placeholder="Buscar cliente por nombre..." />
                                    <CommandList>
                                      <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                                      <CommandGroup>
                                        {users.map((user) => (
                                          <CommandItem
                                            key={user.id}
                                            value={user.name}
                                            onSelect={() => field.onChange(user.id)}
                                          >
                                            <User className="mr-2 h-4 w-4" />
                                            <span className={user.id === field.value ? "font-medium" : ""}>
                                              {user.name}
                                            </span>
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

                        <FormField
                          control={form.control}
                          name="motorcycleId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Motocicleta</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      className="w-full justify-between bg-background hover:bg-background/80 transition-colors h-10"
                                    >
                                      {field.value
                                        ? (() => {
                                          const moto = motorcycles.find((m) => m.id === field.value)
                                          return moto
                                            ? `${moto.brand} ${moto.model} (${moto.plate})`
                                            : "Seleccionar motocicleta"
                                        })()
                                        : "Seleccionar motocicleta"}
                                      <ChevronUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[350px] p-0" align="start">
                                  <Command>
                                    <CommandInput placeholder="Buscar por marca, modelo o placa..." />
                                    <CommandList>
                                      <CommandEmpty>No se encontraron motocicletas.</CommandEmpty>
                                      <CommandGroup>
                                        {motorcycles.map((moto) => (
                                          <CommandItem
                                            key={moto.id}
                                            value={`${moto.brand} ${moto.model} ${moto.plate}`}
                                            onSelect={() => {
                                              field.onChange(moto.id)
                                              handleMotorcycleChange(moto.id)
                                            }}
                                          >
                                            <Bike className="mr-2 h-4 w-4" />
                                            <div className="flex flex-col">
                                              <span className={moto.id === field.value ? "font-medium" : ""}>
                                                {moto.brand} {moto.model} ({moto.plate})
                                              </span>
                                              <span className="text-xs text-muted-foreground">
                                                {formatCurrency(moto.price)}
                                              </span>
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
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        Detalles del Préstamo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="totalAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Precio Total</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                  <Input
                                    type="text"
                                    className="pl-7"
                                    value={formatNumber(field.value)}
                                    onChange={(e) => {
                                      const value = parseFormattedNumber(e.target.value)
                                      field.onChange(value)
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
                          name="downPayment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pago Inicial</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                  <Input
                                    type="text"
                                    className="pl-7"
                                    value={formatNumber(field.value)}
                                    onChange={(e) => {
                                      const value = parseFormattedNumber(e.target.value)
                                      field.onChange(value)
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs">
                                Monto que el cliente paga por adelantado
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-primary" />
                        Términos del Préstamo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="loanTermMonths"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Plazo del Préstamo (meses)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="text"
                                    className="pl-9"
                                    value={formatNumber(field.value)}
                                    onChange={(e) => {
                                      const value = parseFormattedNumber(e.target.value)
                                      field.onChange(value)
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs">
                                Duración total del préstamo en meses
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="paymentFrequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frecuencia de Pago</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-10">
                                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Seleccionar frecuencia" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="DAILY">Diario</SelectItem>
                                  <SelectItem value="WEEKLY">Semanal</SelectItem>
                                  <SelectItem value="BIWEEKLY">Quincenal</SelectItem>
                                  <SelectItem value="MONTHLY">Mensual</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription className="text-xs">
                                {formValues.paymentFrequency === "DAILY" && "Pagos todos los días"}
                                {formValues.paymentFrequency === "WEEKLY" && "Pagos una vez por semana"}
                                {formValues.paymentFrequency === "BIWEEKLY" && "Pagos cada dos semanas"}
                                {formValues.paymentFrequency === "MONTHLY" && "Pagos una vez al mes"}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="interestRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tasa de Interés (%)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="text"
                                    step="0.01"
                                    className="pl-9"
                                    value={formatNumber(field.value)}
                                    onChange={(e) => {
                                      const value = parseFormattedNumber(e.target.value)
                                      field.onChange(value)
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs">Tasa de interés anual</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="interestType"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Tipo de Interés</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex space-x-4"
                                >
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="FIXED" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Fijo (Simple)</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="COMPOUND" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Compuesto</FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {formValues.paymentFrequency === "DAILY" && (
                          <>
                            <FormField
                              control={form.control}
                              name="installmentPaymentAmmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Monto de Pago Diario</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                      <Input
                                        type="text"
                                        className="pl-7"
                                        value={formatNumber(field.value)}
                                        onChange={(e) => {
                                          const value = parseFormattedNumber(e.target.value)
                                          field.onChange(value)
                                        }}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-xs">Cantidad fija a pagar por día</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="gpsAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Monto de GPS Diario</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                      <Navigation className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                      <Input
                                        type="text"
                                        className="pl-7 pr-9"
                                        value={formatNumber(field.value)}
                                        onChange={(e) => {
                                          const value = parseFormattedNumber(e.target.value)
                                          field.onChange(value)
                                        }}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-xs">
                                    Monto adicional para GPS por día
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {loanSummary && (
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/30 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2 text-blue-700 dark:text-blue-300">
                          <Calculator className="h-4 w-4" />
                          Resumen del Préstamo
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-xs font-medium text-blue-600/70 dark:text-blue-400/70 mb-1">
                              Monto Financiado:
                            </p>
                            <p className="text-base font-semibold text-blue-700 dark:text-blue-300">
                              {formatCurrency(loanSummary.financedAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-blue-600/70 dark:text-blue-400/70 mb-1">
                              Total a Pagar (con interés):
                            </p>
                            <p className="text-base font-semibold text-blue-700 dark:text-blue-300">
                              {formatCurrency(loanSummary.totalWithInterest)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-green-600/70 dark:text-green-400/70 mb-1">
                              Interés Total:
                            </p>
                            <p className="text-base font-semibold text-green-600 dark:text-green-400">
                              {formatCurrency(loanSummary.totalInterest)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-amber-600/70 dark:text-amber-400/70 mb-1">
                              Cuota {getFrequencyText(formValues.paymentFrequency)}:
                            </p>
                            <div className="flex flex-col">
                              <p className="text-base font-semibold text-amber-600 dark:text-amber-400">
                                {formatCurrency(loanSummary.paymentAmount)}
                                {formValues.paymentFrequency === "DAILY" && loanSummary.gpsAmount > 0 && (
                                  <span className="text-sm font-normal ml-1">+ GPS</span>
                                )}
                              </p>
                              {formValues.paymentFrequency === "DAILY" && loanSummary.gpsAmount > 0 && (
                                <div className="flex items-center gap-1 text-xs text-amber-600/70 dark:text-amber-400/70">
                                  <span>GPS: {formatCurrency(loanSummary.gpsAmount)}</span>
                                  <span>|</span>
                                  <span>Total: {formatCurrency(loanSummary.totalPaymentWithGps)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-span-2 pt-2 border-t border-blue-200 dark:border-blue-800/50">
                            <p className="text-xs font-medium text-blue-600/70 dark:text-blue-400/70 mb-1">
                              Total de Pagos:
                            </p>
                            <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                              {loanSummary.totalInstallments} pagos {getFrequencyText(formValues.paymentFrequency)}
                              {formValues.paymentFrequency === "DAILY" && loanSummary.daysToPayOff && (
                                <span className="text-sm font-normal ml-2">
                                  (aproximadamente {Math.floor(loanSummary.daysToPayOff / 30)} meses y{" "}
                                  {loanSummary.daysToPayOff % 30} días)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-end gap-4 pt-2">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading} className="gap-2">
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
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {loanId ? "Actualizar" : "Crear"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
