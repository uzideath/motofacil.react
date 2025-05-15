"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency, formatDate, getInterest } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Calculator, DollarSign, Percent } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { InstallmentForm } from "../installments/installment-form"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bike, Users } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { fetchLoan } from "@/lib/api"
import { Loan } from "@/lib/dto/loan"
type Payment = {
  id: string
  amount: number
  principalAmount: number
  interestAmount: number
  date: string
  isLate: boolean
}

type AmortizationRow = {
  installmentNumber: number
  date: string
  payment: number
  principalPayment: number
  interestPayment: number
  remainingBalance: number
  isPaid: boolean
}

// Función para generar una tabla de amortización de ejemplo
function generateAmortizationTable(
  installments: number,
  principal: number,
  monthlyPayment: number,
  interestRate: number,
  interestType: string,
  paidInstallments: number,
) {
  const table = []
  const monthlyInterestRate = interestRate / 100 / 12
  let balance = principal

  for (let i = 1; i <= installments; i++) {
    let interestPayment: number
    let principalPayment: number

    if (interestType === "FIXED") {
      // Para interés fijo, el interés se distribuye uniformemente
      interestPayment = (principal * (interestRate / 100) * (installments / 12)) / installments
      principalPayment = monthlyPayment - interestPayment
    } else {
      // Para interés compuesto, el interés se calcula sobre el saldo restante
      interestPayment = balance * monthlyInterestRate
      principalPayment = monthlyPayment - interestPayment
    }

    balance -= principalPayment

    // Asegurarse de que el saldo final sea exactamente 0
    if (i === installments) {
      principalPayment += balance
      balance = 0
    }

    // Calcular la fecha de pago
    const date = new Date("2023-01-10")
    date.setMonth(date.getMonth() + i - 1)

    table.push({
      installmentNumber: i,
      date: date.toISOString(),
      payment: monthlyPayment,
      principalPayment,
      interestPayment,
      remainingBalance: Math.max(0, balance),
      isPaid: i <= paidInstallments,
    })
  }

  return table
}

export function LoanDetails({
  children,
  loanId,
  loanData,
}: {
  children: React.ReactNode
  loanId: string
  loanData?: any
}) {
  const [open, setOpen] = useState(false)
  const [loan, setLoan] = useState<Loan | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("payments")
  const { toast } = useToast()
  const [interests, setInterests] = useState(0);
  const dataFetchedRef = useRef(false)

  // Función para obtener datos del préstamo
  const fetchLoanData = () => {
    setLoading(true)
    // Simulación de carga de datos
    setTimeout(async () => {
      try {
        const response = await fetchLoan(loanId);
        const periods = response.paymentFrequency === 'DAILY' ? 365 : response.paymentFrequency === 'WEEKLY' ? 52 : response.paymentFrequency === 'BIWEEKLY' ? 24 : 12; // <- Monthly
        setInterests(getInterest(response.totalAmount, response.interestRate, periods));
        setLoan(loanData);
      } catch (error) {
        console.error("Error al cargar datos del préstamo:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los datos del préstamo",
        })
      } finally {
        setLoading(false)
      }
    }, 1000)
  }

  // Efecto para cargar datos cuando se abre el diálogo
  useEffect(() => {
    if (open && !dataFetchedRef.current) {
      dataFetchedRef.current = true
      fetchLoanData()
    }

    // Limpiar cuando se cierra el diálogo
    if (!open) {
      dataFetchedRef.current = false
    }
  }, [open])

  // Función para obtener el color del estado
  function getStatusColor(status: string) {
    switch (status) {
      case "ACTIVE":
        return "bg-blue-500"
      case "COMPLETED":
        return "bg-green-500"
      case "DEFAULTED":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Función para obtener el texto del estado
  function getStatusText(status: string) {
    switch (status) {
      case "ACTIVE":
        return "Activo"
      case "COMPLETED":
        return "Completado"
      case "DEFAULTED":
        return "Incumplido"
      default:
        return status
    }
  }

  // Función para obtener el texto de la frecuencia de pago
  function getPaymentFrequencyText(frequency: string) {
    switch (frequency) {
      case "MONTHLY":
        return "Mensual"
      case "BIWEEKLY":
        return "Quincenal"
      case "WEEKLY":
        return "Semanal"
      default:
        return frequency
    }
  }

  // Función para obtener el texto del tipo de interés
  function getInterestTypeText(type: string) {
    switch (type) {
      case "FIXED":
        return "Fijo (Simple)"
      case "COMPOUND":
        return "Compuesto"
      default:
        return type
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Resetear estados cuando se cierra el diálogo
      setActiveTab("payments")
      setLoan(null)
      setLoading(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Préstamo</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-6 py-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-[150px] w-full" />
              <Skeleton className="h-[150px] w-full" />
            </div>
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : loan ? (
          <div className="space-y-6 py-4">
            <div className="flex justify-end">
              <InstallmentForm loanId={loan.id}>
                <Button>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Registrar Pago
                </Button>
              </InstallmentForm>
            </div>

            {/* Información del cliente y motocicleta */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="card-hover-effect">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-blue-400" />
                    Información del Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-12 w-12 border border-dark-blue-700 bg-dark-blue-800/50">
                      <AvatarImage
                        src={`/abstract-geometric-shapes.png?height=48&width=48&query=${loan.id}`}
                        alt={loan.id}
                      />
                      <AvatarFallback className="bg-dark-blue-800/80 text-blue-200">
                        {/* {loan.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()} */}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-white">{loan.user.name} {loan.user.refName}</h3>
                      <p className="text-sm text-blue-200/70">Cliente</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-dark-blue-800/50">
                      <span className="text-sm text-blue-200/80">ID Cliente</span>
                      <span className="text-sm font-medium text-white">#{loan.user.identification || "001"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dark-blue-800/50">
                      <span className="text-sm text-blue-200/80">Teléfono</span>
                      <span className="text-sm font-medium text-white">{loan.user.phone || "none"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover-effect">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Bike className="mr-2 h-5 w-5 text-blue-400" />
                    Información de la Motocicleta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Bike className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">
                        {loan.motorcycle.brand} {loan.motorcycle.model}
                      </h3>
                      <p className="text-sm text-blue-200/70">Motocicleta</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-dark-blue-800/50">
                      <span className="text-sm text-blue-200/80">Marca</span>
                      <span className="text-sm font-medium text-white">{loan.motorcycle.brand}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dark-blue-800/50">
                      <span className="text-sm text-blue-200/80">Modelo</span>
                      <span className="text-sm font-medium text-white">{loan.motorcycle.model}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-blue-200/80">Placa</span>
                      <span className="text-sm font-medium text-white">{loan.motorcycle.plate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detalles del préstamo */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Préstamo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
                  <div className="col-span-2 md:col-span-4 mb-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-200/80">ID del Préstamo</p>
                          <p className="text-lg font-bold text-white">{loan.id}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(loan.status)} text-white px-3 py-1 text-sm`}>
                        {getStatusText(loan.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Información financiera */}
                  <div className="glass-card p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-200/80">Precio Total</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(loan.totalAmount)}</p>
                    <div className="flex justify-between text-xs text-blue-200/60 mt-1">
                      <span>Pago inicial: {formatCurrency(loan.totalAmount)}</span>
                      {/* <span>Financiado: {formatCurrency(loan.downPayment)}</span> */}
                    </div>
                  </div>

                  <div className="glass-card p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-200/80">Total con Interés</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(loan.totalAmount + (interests * loan.installments))}</p>
                    <div className="flex justify-between text-xs text-blue-200/60 mt-1">
                      <span>Tasa: {loan.interestRate}%</span>
                    </div>
                  </div>

                  <div className="glass-card p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-200/80">
                      Cuota {getPaymentFrequencyText(loan.paymentFrequency)}
                    </p>
                    <p className="text-xl font-bold text-white">{formatCurrency(loan.installmentPaymentAmmount)}</p>
                    <div className="flex justify-between text-xs text-blue-200/60 mt-1">
                      <span>Tipo: {getInterestTypeText(loan.interestType)}</span>
                      <span>Cuotas: {loan.installments}</span>
                    </div>
                  </div>

                  <div className="glass-card p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-200/80">Progreso</p>
                    <p className="text-xl font-bold text-white">
                      {loan.paidInstallments} / {loan.installments}
                    </p>
                    <div className="mt-2">
                      <Progress value={(loan.paidInstallments / loan.installments) * 100} className="h-2" />
                    </div>
                  </div>
                </div>

                {/* Resumen de pagos */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <DollarSign className="h-4 w-4 text-green-400 mr-1" />
                      <p className="text-sm font-medium text-blue-200/80">Total Pagado</p>
                    </div>
                    <p className="text-xl font-bold text-green-400">{formatCurrency(loan.totalPaid)}</p>
                    <div className="flex justify-between text-xs text-blue-200/60 mt-1">
                      <span>Capital: {formatCurrency(loan.totalPaid)}</span>
                      {/* <span>Interés: {formatCurrency(loan.totalInterestPaid)}</span> */}
                    </div>
                  </div>

                  <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <DollarSign className="h-4 w-4 text-amber-400 mr-1" />
                      <p className="text-sm font-medium text-blue-200/80">Deuda Restante</p>
                    </div>
                    <p className="text-xl font-bold text-amber-400">{formatCurrency(loan.debtRemaining)}</p>
                    <p className="text-xs text-blue-200/60 mt-1">
                      {/* {((loan.debtRemaining / loan.totalWithInterest) * 100).toFixed(0)}% pendiente */}
                    </p>
                  </div>

                  <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Percent className="h-4 w-4 text-blue-400 mr-1" />
                      <p className="text-sm font-medium text-blue-200/80">Interés Pagado</p>
                    </div>
                    <p className="text-xl font-bold text-blue-400">{formatCurrency(interests * loan.paidInstallments)}</p>

                    {/* <p className="text-xs text-blue-200/60 mt-1">
                      {((loan.totalInterestPaid / (loan.totalWithInterest - loan.financedAmount)) * 100).toFixed(0)}%
                      del interés total
                    </p> */}
                  </div>
                </div>

                {/* Fechas */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-card p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-200/80">Fecha de Inicio</p>
                    <p className="text-base font-medium text-white">{loan.startDate ? formatDate(loan.startDate.split('T')[0]): ""}</p>
                  </div>


                  <div className="glass-card p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-200/80">Fecha Estimada de Finalización</p>
                    <p className="text-base font-medium text-white">{loan.endDate ? formatDate(loan.endDate.split('T')[0]): ""}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pestañas para historial de pagos y tabla de amortización */}
            <div>
              <div className="flex space-x-1 rounded-lg bg-dark-blue-800/30 p-1">
                <button
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${
                    activeTab === "payments"
                      ? "bg-blue-500 text-white"
                      : "text-blue-200 hover:bg-dark-blue-700/50 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("payments")}
                >
                  Historial de Pagos
                </button>
                {/* <button
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${
                    activeTab === "amortization"
                      ? "bg-blue-500 text-white"
                      : "text-blue-200 hover:bg-dark-blue-700/50 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("amortization")}
                >
                  Tabla de Amortización
                </button> */}
              </div>

              <div className="mt-4">
                {activeTab === "payments" && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fecha</TableHead>
                              <TableHead>ID</TableHead>
                              <TableHead>Monto</TableHead>
                              {/* <TableHead>Capital</TableHead> */}
                              {/* <TableHead>Interés</TableHead> */}
                              <TableHead>Estado</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loan.payments.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                  No hay pagos registrados
                                </TableCell>
                              </TableRow>
                            ) : (
                              loan.payments.map((payment) => (
                                <TableRow key={payment.id}>
                                  <TableCell>{formatDate(payment.paymentDate.split('T')[0])}</TableCell>
                                  <TableCell>{payment.id}</TableCell>
                                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                                  {/* <TableCell>{formatCurrency(payment.principalAmount)}</TableCell> */}
                                  <TableCell>
                                    {payment.isLate ? (
                                      <Badge variant="destructive">Atrasado</Badge>
                                    ) : (
                                      <Badge variant="default" className="bg-green-500">
                                        A tiempo
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
{/* 
                {activeTab === "amortization" && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <Calculator className="h-5 w-5 text-blue-400 mr-2" />
                        <h3 className="text-lg font-medium">Tabla de Amortización</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Desglose de pagos mostrando la distribución entre capital e interés para cada cuota.
                      </p>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Cuota</TableHead>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Pago</TableHead>
                              <TableHead>Capital</TableHead>
                              <TableHead>Interés</TableHead>
                              <TableHead>Saldo</TableHead>
                              <TableHead>Estado</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loan.amortizationTable.map((row) => (
                              <TableRow key={row.installmentNumber} className={row.isPaid ? "bg-blue-900/10" : ""}>
                                <TableCell>{row.installmentNumber}</TableCell>
                                <TableCell>{formatDate(row.date.split('T')[0])}</TableCell>
                                <TableCell>{formatCurrency(row.payment)}</TableCell>
                                <TableCell>{formatCurrency(row.principalPayment)}</TableCell>
                                <TableCell>{formatCurrency(row.interestPayment)}</TableCell>
                                <TableCell>{formatCurrency(row.remainingBalance)}</TableCell>
                                <TableCell>
                                  {row.isPaid ? (
                                    <Badge variant="default" className="bg-green-500">
                                      Pagado
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-blue-300 border-blue-300">
                                      Pendiente
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )} */}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center">
            <p>No se encontró información del préstamo</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
