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

// Definición de tipos
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

// Definición del esquema de validación con Zod
const loanSchema = z.object({
  userId: z.string().min(1, { message: "Por favor, selecciona un cliente." }),
  motorcycleId: z.string().min(1, { message: "Por favor, selecciona una motocicleta." }),
  totalAmount: z.coerce.number().min(1, { message: "El precio total debe ser mayor a cero." }),
  downPayment: z.coerce.number().min(0, { message: "El pago inicial no puede ser negativo." }),
  installments: z.coerce.number().min(1, { message: "El número de cuotas debe ser al menos 1." }),
  interestRate: z.coerce.number().min(0, { message: "La tasa de interés no puede ser negativa." }),
  interestType: z.enum(["FIXED", "COMPOUND"]),
  paymentFrequency: z.enum(["MONTHLY", "BIWEEKLY", "WEEKLY"]),
})

// Definición del tipo para los valores del formulario
type LoanFormValues = z.infer<typeof loanSchema>

// Función para formatear la moneda
const formatCurrency = (amount: number) => {
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
}: {
  children: React.ReactNode
  loanId?: string
  loanData?: any
}) {
  // Estado para controlar si el diálogo está abierto
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [loanSummary, setLoanSummary] = useState<any>(null)
  const { toast } = useToast()

  // Referencia para controlar si ya se han cargado los datos
  const dataLoaded = useRef(false)
  // Referencia para controlar si el componente está montado
  const isMounted = useRef(false)

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      userId: "",
      motorcycleId: "",
      totalAmount: 0,
      downPayment: 0,
      installments: 12,
      interestRate: 12,
      interestType: "FIXED",
      paymentFrequency: "MONTHLY",
    },
  })

  // Observar cambios en los valores del formulario para actualizar el resumen
  const formValues = form.watch()

  // Efecto para marcar el componente como montado
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Función para calcular el resumen del préstamo
  const calculateLoanSummary = (values: LoanFormValues) => {
    if (!values.totalAmount || !values.installments || !values.interestRate) return

    const financedAmount = values.totalAmount - values.downPayment
    let totalWithInterest: number
    let monthlyPayment: number

    if (values.interestType === "FIXED") {
      // Interés simple
      const interestAmount = financedAmount * (values.interestRate / 100) * (values.installments / 12)
      totalWithInterest = financedAmount + interestAmount
    } else {
      // Interés compuesto
      const monthlyRate = values.interestRate / 100 / 12
      totalWithInterest = financedAmount * Math.pow(1 + monthlyRate, values.installments)
    }

    monthlyPayment = totalWithInterest / values.installments

    // Ajustar la frecuencia de pago
    if (values.paymentFrequency === "BIWEEKLY") {
      monthlyPayment = (totalWithInterest * 12) / (values.installments * 26)
    } else if (values.paymentFrequency === "WEEKLY") {
      monthlyPayment = (totalWithInterest * 12) / (values.installments * 52)
    }

    if (isMounted.current) {
      setLoanSummary({
        financedAmount,
        totalWithInterest,
        monthlyPayment,
        totalInterest: totalWithInterest - financedAmount,
      })
    }
  }

  // Efecto para calcular el resumen cuando cambian los valores del formulario
  const watchedValues = useWatch({
    control: form.control,
    name: [
      "totalAmount",
      "downPayment",
      "installments",
      "interestRate",
      "interestType",
      "paymentFrequency",
    ],
  })
  
  // Calcular resumen solo cuando se abre el modal y cambian los valores relevantes
  useEffect(() => {
    if (isOpen && isMounted.current) {
      const values = form.getValues()
      calculateLoanSummary(values)
    }
  }, [watchedValues, isOpen])

  // Función para cargar los datos iniciales
  const loadInitialData = () => {
    if (dataLoaded.current || !isMounted.current) return

    setLoadingData(true)

    // Simulación de carga de datos
    const timer = setTimeout(() => {
      if (!isMounted.current) return

      const usersData = [
        { id: "1", name: "Carlos Rodríguez" },
        { id: "2", name: "María López" },
        { id: "3", name: "Juan Pérez" },
        { id: "4", name: "Ana Gómez" },
      ]

      const motorcyclesData = [
        { id: "1", brand: "Honda", model: "CB 125F", plate: "ABC123", price: 8500000 },
        { id: "2", brand: "Yamaha", model: "FZ 150", plate: "DEF456", price: 12000000 },
        { id: "3", brand: "Suzuki", model: "Gixxer 250", plate: "GHI789", price: 15000000 },
        { id: "4", brand: "Bajaj", model: "Pulsar NS 200", plate: "JKL012", price: 10500000 },
      ]

      setUsers(usersData)
      setMotorcycles(motorcyclesData)
      setLoadingData(false)
      dataLoaded.current = true

      // Solo resetear el formulario si hay datos de préstamo
      if (loanData) {
        form.reset({
          userId: loanData.userId || "1",
          motorcycleId: loanData.motorcycleId || "1",
          totalAmount: loanData.totalAmount,
          downPayment: loanData.downPayment || 0,
          installments: loanData.installments,
          interestRate: loanData.interestRate || 12,
          interestType: loanData.interestType || "FIXED",
          paymentFrequency: loanData.paymentFrequency || "MONTHLY",
        })
      }
    }, 1000)

    return () => clearTimeout(timer)
  }

  // Función para actualizar el monto total cuando se selecciona una motocicleta
  const handleMotorcycleChange = (motorcycleId: string) => {
    const selectedMotorcycle = motorcycles.find((m) => m.id === motorcycleId)
    if (selectedMotorcycle) {
      form.setValue("totalAmount", selectedMotorcycle.price)
    }
  }

  async function onSubmit(values: LoanFormValues) {
    try {
      setLoading(true)

      // Simulación de guardado
      console.log(loanId ? "Actualizando préstamo:" : "Creando préstamo:", loanId ? { id: loanId, ...values } : values)

      // Esperar un momento para simular la operación
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: loanId ? "Préstamo actualizado" : "Préstamo creado",
        description: loanId
          ? "El préstamo ha sido actualizado correctamente"
          : "El préstamo ha sido creado correctamente",
      })

      setIsOpen(false)
    } catch (error) {
      console.error("Error al guardar préstamo:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: loanId ? "No se pudo actualizar el préstamo" : "No se pudo crear el préstamo",
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para manejar la apertura del diálogo
  const handleOpenDialog = () => {
    setIsOpen(true)
    // Cargar datos solo cuando se abre el diálogo
    if (!dataLoaded.current) {
      setLoadingData(true)
      loadInitialData()
    }
  }

  // Función para manejar el cierre del diálogo
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
                            <Input type="number" {...field} />
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
                            <Input type="number" {...field} />
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
                            <Input type="number" {...field} />
                          </FormControl>
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
                            <Input type="number" step="0.01" {...field} />
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
                              <SelectItem value="MONTHLY">Mensual</SelectItem>
                              <SelectItem value="BIWEEKLY">Quincenal</SelectItem>
                              <SelectItem value="WEEKLY">Semanal</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                              {formValues.paymentFrequency === "MONTHLY"
                                ? "Mensual"
                                : formValues.paymentFrequency === "BIWEEKLY"
                                  ? "Quincenal"
                                  : "Semanal"}
                              :
                            </p>
                            <p className="text-lg font-medium text-amber-400">
                              {formatCurrency(loanSummary.monthlyPayment)}
                            </p>
                          </div>
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
