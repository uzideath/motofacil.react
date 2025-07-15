"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tag, Calendar, DollarSign, CreditCard } from 'lucide-react'
import { Providers } from "@/lib/types"
import type { Control } from "react-hook-form"
import { ExpenseFormValues } from "../hooks/useExpenseForm"

interface ExpenseBasicInfoProps {
    control: Control<ExpenseFormValues>
}

export function ExpenseBasicInfo({ control }: ExpenseBasicInfoProps) {
    return (
        <Card className="border border-blue-100 dark:border-blue-900/30 shadow-sm">
            <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Tag className="h-5 w-5" />
                    Información del egreso
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                        control={control}
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
                        control={control}
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
                        control={control}
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
                        control={control}
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

                    <FormField
                        control={control}
                        name="provider"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-1.5">
                                    <Tag className="h-4 w-4 text-blue-500" />
                                    Proveedor
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700">
                                            <SelectValue placeholder="Seleccione un proveedor" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={Providers.MOTOFACIL}>Moto Facil</SelectItem>
                                        <SelectItem value={Providers.OBRASOCIAL}>Obra Social</SelectItem>
                                        <SelectItem value={Providers.PORCENTAJETITO}>Tito</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription className="text-xs">Proveedor asociado al egreso</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
