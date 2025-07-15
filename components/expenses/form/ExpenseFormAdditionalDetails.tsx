"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { User, Hash, FileText } from "lucide-react"
import type { Control } from "react-hook-form"
import { ExpenseFormValues } from "../hooks/useExpenseForm"

interface ExpenseAdditionalDetailsProps {
    control: Control<ExpenseFormValues>
}

export function ExpenseAdditionalDetails({ control }: ExpenseAdditionalDetailsProps) {
    return (
        <Card className="border border-blue-100 dark:border-blue-900/30 shadow-sm">
            <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <User className="h-5 w-5" />
                    Detalles adicionales
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                        control={control}
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
                        control={control}
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
                        control={control}
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
    )
}
