"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { HttpService } from "@/lib/http"

interface User {
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
  installments: z.coerce.number().min(1, { message: "El número de cuotas debe ser al menos 1." }),
  interestRate: z.coerce.number().min(0, { message: "La tasa de interés no puede ser negativa." }),
  interestType: z.enum(["FIXED", "COMPOUND"]),
  paymentFrequency: z.enum(["DAILY", "MONTHLY", "BIWEEKLY", "WEEKLY"]),
  installmentPaymentAmmount: z.coerce.number().optional(),
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

export function LoanForm({
  children,
  loanId,
  loanData,
  onSaved,
}: { children: React.ReactNode; loanId?: string; loanData?: any; onSaved?: (updatedLoan?: any) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
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
      installments: 18,
      interestRate: 12,
      interestType: "FIXED",
      paymentFrequency: "DAILY",
      installmentPaymentAmmount: 34000,
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
      const installments = Number(values.installments) || 1
      const interestRate = Number(values.interestRate) || 0
      const installmentPaymentAmmount = Number(values.installmentPaymentAmmount) || 34000

      // Skip calculation if essential values are missing or invalid
      if (totalAmount <= 0 || installments <= 0) {
        return
      }

      const financedAmount = totalAmount - downPayment
      let totalWithInterest: number
      let paymentAmount: number
      let totalInstallments = installments

      if (values.interestType === "FIXED") {
        const interestAmount = financedAmount * (interestRate / 100) * (installments / 12)
        totalWithInterest = financedAmount + interestAmount
      } else {
        const monthlyRate = interestRate / 100 / 12
        totalWithInterest = financedAmount * Math.pow(1 + monthlyRate, installments)
      }

      if (values.paymentFrequency === "DAILY") {
        // For daily payments, we use the fixed amount
        paymentAmount = installmentPaymentAmmount

        // Calculate how many installments would be needed, but don't update the form
        if (paymentAmount > 0) {
          totalInstallments = Math.ceil(totalWithInterest / paymentAmount)
        } else {
          totalInstallments = 0
        }
      } else if (values.paymentFrequency === "BIWEEKLY") {
        paymentAmount = (totalWithInterest * 12) / (installments * 26)
      } else if (values.paymentFrequency === "WEEKLY") {
        paymentAmount = (totalWithInterest * 12) / (installments * 52)
      } else {
        // Monthly
        paymentAmount = totalWithInterest / installments
      }

      if (isMounted.current) {
        setLoanSummary({
          financedAmount,
          totalWithInterest,
          paymentAmount,
          totalInstallments,
          totalInterest: totalWithInterest - financedAmount,
        })
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
      "installments",
      "interestRate",
      "interestType",
      "paymentFrequency",
      "installmentPaymentAmmount",
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
        HttpService.get<User[]>("/api/v1/users", { headers: { Authorization: token ? `Bearer ${token}` : "" } }),
        HttpService.get<Motorcycle[]>("/api/v1/motorcycles", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }),
      ])
      setUsers(userRes.data)
      setMotorcycles(motoRes.data)
      if (loanData) {
        form.reset({
          userId: loanData.userId,
          motorcycleId: loanData.motorcycleId,
          totalAmount: loanData.totalAmount,
          downPayment: loanData.downPayment ?? 0,
          installments: loanData.installments,
          interestRate: loanData.interestRate ?? 12,
          interestType: loanData.interestType ?? "FIXED",
          paymentFrequency: loanData.paymentFrequency ?? "DAILY",
          installmentPaymentAmmount: loanData.installmentPaymentAmmount ?? 34000,
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

      // Ensure all numeric values are valid numbers
      const submissionValues = {
        ...values,
        totalAmount: Number(values.totalAmount) || 0,
        downPayment: Number(values.downPayment) || 0,
        installments:
          values.paymentFrequency === "DAILY" && loanSummary
            ? loanSummary.totalInstallments
            : Number(values.installments) || 1,
        interestRate: Number(values.interestRate) || 0,
        installmentPaymentAmmount: Number(values.installmentPaymentAmmount) || 34000,
      }

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
              <DialogTitle>{loanId ? "Editar Préstamo" : "Nuevo Préstamo"}</DialogTitle>
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
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="userId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cliente</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar cliente" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              handleMotorcycleChange(value)
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar motocicleta" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {motorcycles.map((moto) => (
                                <SelectItem key={moto.id} value={moto.id}>
                                  {moto.brand} {moto.model} ({moto.plate}) - {formatCurrency(moto.price)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="totalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio Total</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} min="1" />
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
                            <Input type="number" {...field} min="0" />
                          </FormControl>
                          <FormDescription>Monto que el cliente paga por adelantado</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="installments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Cuotas</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              min="1"
                              disabled={formValues.paymentFrequency === "DAILY"}
                            />
                          </FormControl>
                          {formValues.paymentFrequency === "DAILY" && (
                            <FormDescription>
                              El número de cuotas se calcula automáticamente para pagos diarios
                            </FormDescription>
                          )}
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
                            <Input type="number" step="0.01" {...field} min="0" />
                          </FormControl>
                          <FormDescription>Tasa de interés anual</FormDescription>
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
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="FIXED" />
                                </FormControl>
                                <FormLabel className="font-normal">Fijo (Simple)</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
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

                    <FormField
                      control={form.control}
                      name="paymentFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frecuencia de Pago</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar frecuencia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DAILY">Diario</SelectItem>
                              <SelectItem value="MONTHLY">Mensual</SelectItem>
                              <SelectItem value="BIWEEKLY">Quincenal</SelectItem>
                              <SelectItem value="WEEKLY">Semanal</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {formValues.paymentFrequency === "DAILY" && (
                      <FormField
                        control={form.control}
                        name="installmentPaymentAmmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monto de Pago Diario</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} min="1" />
                            </FormControl>
                            <FormDescription>Cantidad fija a pagar por día</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {loanSummary && (
                    <Card className="bg-blue-900/20 border-blue-800/30">
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4 text-blue-200">Resumen del Préstamo</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-blue-300">Monto Financiado:</p>
                            <p className="text-lg font-medium text-white">
                              {formatCurrency(loanSummary.financedAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-blue-300">Total a Pagar (con interés):</p>
                            <p className="text-lg font-medium text-white">
                              {formatCurrency(loanSummary.totalWithInterest)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-blue-300">Interés Total:</p>
                            <p className="text-lg font-medium text-green-400">
                              {formatCurrency(loanSummary.totalInterest)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-blue-300">
                              Cuota{" "}
                              {formValues.paymentFrequency === "DAILY"
                                ? "Diaria"
                                : formValues.paymentFrequency === "MONTHLY"
                                  ? "Mensual"
                                  : formValues.paymentFrequency === "BIWEEKLY"
                                    ? "Quincenal"
                                    : "Semanal"}
                              :
                            </p>
                            <p className="text-lg font-medium text-amber-400">
                              {formatCurrency(loanSummary.paymentAmount)}
                            </p>
                          </div>
                          {formValues.paymentFrequency === "DAILY" && (
                            <div>
                              <p className="text-sm text-blue-300">Total de Pagos:</p>
                              <p className="text-lg font-medium text-white">{loanSummary.totalInstallments}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Guardando..." : loanId ? "Actualizar" : "Crear"}
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
