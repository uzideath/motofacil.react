"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { HttpService } from "@/lib/http"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Save, Calendar, Tag, DollarSign, CreditCard, User, Hash, FileText } from "lucide-react"
import { format } from "date-fns"
import type { Expense } from "./expense-table"
import { useAuth } from "@/hooks/use-auth"


const expenseSchema = z.object({
    category: z.string().min(1, { message: "La categoría es obligatoria" }),
    amount: z.coerce.number().positive({ message: "El monto debe ser mayor a 0" }),
    paymentMethod: z.string().min(1, { message: "El método de pago es obligatorio" }),
    beneficiary: z.string().min(1, { message: "El beneficiario es obligatorio" }),
    reference: z.string().optional(),
    description: z.string().min(1, { message: "La descripción es obligatoria" }),
    date: z.string().min(1, { message: "La fecha es obligatoria" }),
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

interface ExpenseFormProps {
    onSuccess?: () => void
    isModal?: boolean
    expenseData?: Expense
    isEditing?: boolean
}

export function ExpenseForm({ onSuccess, isModal = false, expenseData, isEditing = false }: ExpenseFormProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const { user } = useAuth();

    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            category: "",
            amount: 0,
            paymentMethod: "",
            beneficiary: "",
            reference: "",
            description: "",
            date: format(new Date(), "yyyy-MM-dd"),
        },
    })

    useEffect(() => {
        if (expenseData && isEditing) {
            form.reset({
                category: expenseData.category,
                amount: expenseData.amount,
                paymentMethod: expenseData.paymentMethod,
                beneficiary: expenseData.beneficiary,
                reference: expenseData.reference || "",
                description: expenseData.description,
                date: format(new Date(expenseData.date), "yyyy-MM-dd"),
            })
        }
    }, [expenseData, isEditing, form])

    async function onSubmit(values: ExpenseFormValues) {
        try {
            setLoading(true)

            const payload = {
                ...values,
                createdById: user?.id,
            }

            console.log(user?.id)
            if (isEditing && expenseData) {
                await HttpService.put(`/api/v1/expense/${expenseData.id}`, payload)
                toast({
                    title: "Egreso actualizado",
                    description: "El egreso ha sido actualizado correctamente",
                })
            } else {
                await HttpService.post("/api/v1/expense", payload)
                toast({
                    title: "Egreso registrado",
                    description: "El egreso ha sido registrado correctamente",
                })
            }

            if (onSuccess) onSuccess()

            if (!isModal) {
                form.reset({
                    category: "",
                    amount: 0,
                    paymentMethod: "",
                    beneficiary: "",
                    reference: "",
                    description: "",
                    date: format(new Date(), "yyyy-MM-dd"),
                })
            }
        } catch (error) {
            console.error("Error al guardar egreso:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: isEditing
                    ? "No se pudo actualizar el egreso. Intente nuevamente."
                    : "No se pudo registrar el egreso. Intente nuevamente.",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card className="border border-blue-100 dark:border-blue-900/30 shadow-sm">
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                            <Tag className="h-5 w-5" />
                            Información del egreso
                        </h3>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-1.5 after:content-['*'] after:text-red-500 after:ml-0.5">
                                            <Tag className="h-4 w-4 text-blue-500" />
                                            Categoría
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700">
                                                    <SelectValue placeholder="Seleccione una categoría" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="RENT">Alquiler</SelectItem>
                                                <SelectItem value="SERVICES">Servicios</SelectItem>
                                                <SelectItem value="SALARIES">Salarios</SelectItem>
                                                <SelectItem value="TAXES">Impuestos</SelectItem>
                                                <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                                                <SelectItem value="PURCHASES">Compras</SelectItem>
                                                <SelectItem value="MARKETING">Marketing</SelectItem>
                                                <SelectItem value="TRANSPORT">Transporte</SelectItem>
                                                <SelectItem value="OTHER">Otros</SelectItem>

                                            </SelectContent>
                                        </Select>
                                        <FormDescription className="text-xs">Seleccione la categoría del egreso</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-1.5 after:content-['*'] after:text-red-500 after:ml-0.5">
                                            <Calendar className="h-4 w-4 text-blue-500" />
                                            Fecha
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs">Fecha en que se realizó el egreso</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-1.5 after:content-['*'] after:text-red-500 after:ml-0.5">
                                            <DollarSign className="h-4 w-4 text-blue-500" />
                                            Monto
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs">Valor del egreso</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-1.5 after:content-['*'] after:text-red-500 after:ml-0.5">
                                            <CreditCard className="h-4 w-4 text-blue-500" />
                                            Método de pago
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700">
                                                    <SelectValue placeholder="Seleccione un método de pago" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CASH">Efectivo</SelectItem>
                                                <SelectItem value="CARD">Tarjeta</SelectItem>
                                                <SelectItem value="TRANSACTION">Transferencia</SelectItem>
                                                <SelectItem value="CHECK">Cheque</SelectItem>
                                                <SelectItem value="OTHER">Otro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription className="text-xs">Método utilizado para el pago</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-blue-100 dark:border-blue-900/30 shadow-sm">
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                            <User className="h-5 w-5" />
                            Detalles adicionales
                        </h3>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="beneficiary"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-1.5 after:content-['*'] after:text-red-500 after:ml-0.5">
                                            <User className="h-4 w-4 text-blue-500" />
                                            Beneficiario
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Nombre del beneficiario"
                                                {...field}
                                                className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs">Persona o entidad que recibe el pago</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-1.5">
                                            <Hash className="h-4 w-4 text-blue-500" />
                                            Referencia
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Número de factura o referencia"
                                                {...field}
                                                className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs">Número de factura o referencia (opcional)</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="col-span-1 md:col-span-2">
                                        <FormLabel className="flex items-center gap-1.5 after:content-['*'] after:text-red-500 after:ml-0.5">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            Descripción
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Descripción detallada del egreso"
                                                {...field}
                                                className="min-h-[100px] border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs">Detalle el propósito del egreso</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4 pt-2">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white shadow-md hover:shadow-lg transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isEditing ? "Actualizando..." : "Guardando..."}
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {isEditing ? "Actualizar Egreso" : "Guardar Egreso"}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
