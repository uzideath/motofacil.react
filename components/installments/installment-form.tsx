"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

const installmentSchema = z.object({
  loanId: z.string({
    required_error: "Debe seleccionar un préstamo",
  }),
  amount: z.coerce.number().min(1, {
    message: "El monto debe ser mayor a 0",
  }),
  isLate: z.boolean().default(false),
})

type InstallmentFormValues = z.infer<typeof installmentSchema>

type Loan = {
  id: string
  userName: string
  motorcycleModel: string
  debtRemaining: number
  monthlyPayment: number
  interestRate: number
  interestType: "FIXED" | "COMPOUND"
  totalCapitalPaid: number
  financedAmount: number
  nextInstallmentNumber: number
}

export function InstallmentForm({
  children,
  loanId,
}: {
  children?: React.ReactNode
  loanId?: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loans, setLoans] = useState<Loan[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [paymentBreakdown, setPaymentBreakdown] = useState<{
    principalAmount: number
    interestAmount: number
  } | null>(null)
  const { toast } = useToast()

  const form = useForm<InstallmentFormValues>({
    resolver: zodResolver(installmentSchema),
    defaultValues: {
      loanId: loanId || "",
      amount: 0,
      isLate: false,
    },
  })

  // Observar cambios en el monto para actualizar el desglose
  const amount = form.watch("amount")

  useEffect(() => {
    if (selectedLoan && amount) {
      calculatePaymentBreakdown(selectedLoan, amount)
    }
  }, [selectedLoan, amount])

  // Función para calcular el desglose del pago
  const calculatePaymentBreakdown = (loan: Loan, paymentAmount: number) => {
    let principalAmount: number
    let interestAmount: number
    const monthlyRate = loan.interestRate / 100 / 12

    if (loan.interestType === "FIXED") {
      // Para interés fijo, el interés se distribuye uniformemente
      interestAmount = Math.min(
        paymentAmount,
        (loan.financedAmount * (loan.interestRate / 100) * (loan.nextInstallmentNumber / 12)) /
          loan.nextInstallmentNumber,
      )
    } else {
      // Para interés compuesto, el interés se calcula sobre el saldo restante
      const remainingPrincipal = loan.financedAmount - loan.totalCapitalPaid
      interestAmount = Math.min(paymentAmount, remainingPrincipal * monthlyRate)
    }

    principalAmount = paymentAmount - interestAmount

    setPaymentBreakdown({
      principalAmount,
      interestAmount,
    })
  }

  useEffect(() => {
    if (open) {
      // Simulación de carga de datos
      const timer = setTimeout(() => {
        const loansData = [
          {
            id: "1",
            userName: "Carlos Rodríguez",
            motorcycleModel: "Honda CB 125F",
            debtRemaining: 6375000,
            monthlyPayment: 354167,
            interestRate: 12,
            interestType: "FIXED" as const,
            totalCapitalPaid: 2125000,
            financedAmount: 8500000,
            nextInstallmentNumber: 7,
          },
          {
            id: "2",
            userName: "María López",
            motorcycleModel: "Yamaha FZ 150",
            debtRemaining: 8000000,
            monthlyPayment: 333333,
            interestRate: 10,
            interestType: "COMPOUND" as const,
            totalCapitalPaid: 4000000,
            financedAmount: 12000000,
            nextInstallmentNumber: 13,
          },
          {
            id: "4",
            userName: "Ana Gómez",
            motorcycleModel: "Bajaj Pulsar NS 200",
            debtRemaining: 9041667,
            monthlyPayment: 291667,
            interestRate: 15,
            interestType: "FIXED" as const,
            totalCapitalPaid: 1458333,
            financedAmount: 10500000,
            nextInstallmentNumber: 6,
          },
        ]

        // Filtrar préstamos completados
        setLoans(loansData)

        // Si hay un loanId preseleccionado, establecer el monto de la cuota
        if (loanId) {
          const loan = loansData.find((l) => l.id === loanId)
          if (loan) {
            setSelectedLoan(loan)
            form.setValue("loanId", loanId)
            form.setValue("amount", loan.monthlyPayment)
            calculatePaymentBreakdown(loan, loan.monthlyPayment)
          }
        }

        setLoadingData(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [open, loanId, form])

  const handleLoanChange = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId)
    if (loan) {
      setSelectedLoan(loan)
      form.setValue("amount", loan.monthlyPayment)
      calculatePaymentBreakdown(loan, loan.monthlyPayment)
    } else {
      setSelectedLoan(null)
      setPaymentBreakdown(null)
    }
  }

  async function onSubmit(values: InstallmentFormValues) {
    try {
      setLoading(true)

      // Simulación de guardado
      console.log("Registrando pago:", {
        ...values,
        principalAmount: paymentBreakdown?.principalAmount,
        interestAmount: paymentBreakdown?.interestAmount,
      })

      // Esperar un momento para simular la operación
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Pago registrado",
        description: "El pago ha sido registrado correctamente",
      })

      setOpen(false)
    } catch (error) {
      console.error("Error al registrar pago:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar el pago",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) {
          setLoadingData(true)
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Registrar Pago de Cuota</DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="py-6 space-y-4">
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
                  name="loanId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Préstamo</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          handleLoanChange(value)
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar préstamo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loans.map((loan) => (
                            <SelectItem key={loan.id} value={loan.id}>
                              {loan.userName} - {loan.motorcycleModel}
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
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isLate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Pago atrasado</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Marcar si el pago se realiza después de la fecha límite
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {selectedLoan && (
                <div className="space-y-4">
                  <Card className="bg-blue-900/20 border-blue-800/30">
                    <CardContent className="pt-6">
                      <h3 className="font-medium mb-2 text-blue-200">Información del préstamo</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-blue-300">Cliente:</p>
                          <p className="text-base font-medium text-white">{selectedLoan.userName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-300">Motocicleta:</p>
                          <p className="text-base font-medium text-white">{selectedLoan.motorcycleModel}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-300">Deuda restante:</p>
                          <p className="text-base font-medium text-white">
                            {formatCurrency(selectedLoan.debtRemaining)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-300">Cuota mensual:</p>
                          <p className="text-base font-medium text-white">
                            {formatCurrency(selectedLoan.monthlyPayment)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-300">Tasa de interés:</p>
                          <p className="text-base font-medium text-white">
                            {selectedLoan.interestRate}% ({selectedLoan.interestType === "FIXED" ? "Fijo" : "Compuesto"}
                            )
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-300">Próxima cuota:</p>
                          <p className="text-base font-medium text-white">#{selectedLoan.nextInstallmentNumber}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {paymentBreakdown && (
                    <Card className="bg-green-900/20 border-green-800/30">
                      <CardContent className="pt-6">
                        <h3 className="font-medium mb-2 text-green-200">Desglose del pago</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-green-300">Capital:</p>
                            <p className="text-base font-medium text-white">
                              {formatCurrency(paymentBreakdown.principalAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-green-300">Interés:</p>
                            <p className="text-base font-medium text-white">
                              {formatCurrency(paymentBreakdown.interestAmount)}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-green-300">Total a pagar:</p>
                            <p className="text-lg font-medium text-white">{formatCurrency(amount)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Registrando..." : "Registrar Pago"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
