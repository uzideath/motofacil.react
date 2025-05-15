// IMPORTACIONES CORREGIDAS Y CONSOLIDADAS
"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loan as BaseLoan } from "../loans/loan-table"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { HttpService } from "@/lib/http"

const installmentSchema = z.object({
  loanId: z.string({ required_error: "Debe seleccionar un préstamo" }),
  amount: z.coerce.number().min(1, { message: "El monto debe ser mayor a 0" }),
  isLate: z.boolean().default(false),
  paymentMethod: z.enum(["CASH", "CARD", "TRANSACTION"], {
    required_error: "Debe seleccionar un método de pago",
  }),
})


type InstallmentFormValues = z.infer<typeof installmentSchema>

type EnrichedLoan = BaseLoan & {
  user: { name: string }
  motorcycle: { model: string }
  payments: { amount: number }[]
  monthlyPayment: number
  financedAmount: number
  totalCapitalPaid: number
  nextInstallmentNumber: number
}

export function InstallmentForm({
  children,
  loanId,
  onSaved
}: {
  children?: React.ReactNode
  loanId?: string,
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

  const amount = form.watch("amount")

  useEffect(() => {
    if (selectedLoan && amount) {
      calculatePaymentBreakdown(selectedLoan, amount)
    }
  }, [selectedLoan, amount])

  const calculatePaymentBreakdown = (loan: EnrichedLoan, paymentAmount: number) => {
    const monthlyRate = loan.interestRate / 100 / 12
    const remainingPrincipal = loan.debtRemaining

    const interestAmount =
      loan.interestType === "FIXED"
        ? Math.min(
          paymentAmount,
          (loan.financedAmount * (loan.interestRate / 100) * (loan.installments / 12)) / loan.installments
        )
        : Math.min(paymentAmount, remainingPrincipal * monthlyRate)

    const principalAmount = paymentAmount - interestAmount

    setPaymentBreakdown({ principalAmount, interestAmount })
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
          calculatePaymentBreakdown(loan, loan.monthlyPayment)
        }
      }

      setLoadingData(false)
    } catch (err) {
      console.error("Error al cargar préstamos:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los préstamos",
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
      form.setValue("amount", loan.monthlyPayment)
      calculatePaymentBreakdown(loan, loan.monthlyPayment)
    } else {
      setSelectedLoan(null)
      setPaymentBreakdown(null)
    }
  }

  const onSubmit = async (values: InstallmentFormValues) => {
    try {
      setLoading(true)
      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("authToken="))
        ?.split("=")[1]

      await HttpService.post(
        "/api/v1/installments",
        {
          ...values,
          principalAmount: paymentBreakdown?.principalAmount,
          interestAmount: paymentBreakdown?.interestAmount,
        },
      )

      toast({
        title: "Pago registrado",
        description: "El pago ha sido registrado correctamente",
      })

      onSaved?.() // ✅ Notificar éxito
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
    <Dialog open={open} onOpenChange={(newOpen) => { setOpen(newOpen); if (!newOpen) setLoadingData(true) }}>
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
                <>
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
                            {selectedLoan.interestRate}% ({selectedLoan.interestType === "FIXED" ? "Fijo" : "Compuesto"})
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-300">Próxima cuota:</p>
                          <p className="text-base font-medium text-white">
                            #{selectedLoan.nextInstallmentNumber}
                          </p>
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
                </>
              )}

              <div className="flex justify-end gap-4">
                <Button type="button" onClick={() => setOpen(false)}>Cancelar</Button>
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
