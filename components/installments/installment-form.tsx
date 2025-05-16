// IMPORTACIONES CORREGIDAS Y CONSOLIDADAS
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import type { Loan as BaseLoan } from "../loans/loan-table"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
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
import { CreditCard, Calendar, Bike, User, DollarSign } from "lucide-react"

const installmentSchema = z.object({
  loanId: z.string({ required_error: "Debe seleccionar un préstamo" }),
  amount: z.coerce.number().min(1, { message: "El monto debe ser mayor a 0" }),
  gps: z.coerce.number(),
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
  onSaved,
}: {
  children?: React.ReactNode
  loanId?: string
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
      gps: 0,
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
          (loan.financedAmount * (loan.interestRate / 100) * (loan.installments / 12)) / loan.installments,
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

      await HttpService.post("/api/v1/installments", {
        ...values,
        gps: values.gps,
        principalAmount: paymentBreakdown?.principalAmount,
        interestAmount: paymentBreakdown?.interestAmount,
      })

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
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) setLoadingData(true)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Registrar Pago de Cuota
          </DialogTitle>
          <DialogDescription>Complete el formulario para registrar un nuevo pago de cuota.</DialogDescription>
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
              <Card className="border-primary/20 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Información del Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                <CommandInput placeholder="Buscar cliente por nombre..." />
                                <CommandList>
                                  <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                                  <CommandGroup>
                                    {loans.map((loan) => (
                                      <CommandItem
                                        key={loan.id}
                                        value={loan.user.name}
                                        onSelect={() => {
                                          field.onChange(loan.id)
                                          handleLoanChange(loan.id)
                                        }}
                                      >
                                        <span className={loan.id === field.value ? "font-medium" : ""}>
                                          {loan.user.name}
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
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Detalles del Pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                              <Input type="number" className="pl-7" {...field} />
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
                              <Input type="number" className="pl-7" {...field} />
                            </div>
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
                        <FormItem>
                          <FormLabel>Estado del pago</FormLabel>
                          <div className="flex items-center space-x-2 h-10 pt-0.5">
                            <Checkbox
                              id="isLate"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            />
                            <label
                              htmlFor="isLate"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Pago atrasado
                            </label>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {selectedLoan && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/30 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Calendar className="h-4 w-4" />
                        Información del préstamo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/20 border-green-200 dark:border-green-800/30 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2 text-green-700 dark:text-green-300">
                          <DollarSign className="h-4 w-4" />
                          Desglose del pago
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
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
                          <div className="col-span-2 mt-2 pt-2 border-t border-green-200 dark:border-green-800/50">
                            <p className="text-xs font-medium text-green-600/70 dark:text-green-400/70 mb-1">
                              Total a pagar:
                            </p>
                            <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                              {formatCurrency(amount)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-4 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
                      Registrando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Registrar Pago
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
