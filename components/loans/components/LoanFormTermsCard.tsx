"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Calendar, Clock, Percent, Navigation } from "lucide-react"
import type { Control } from "react-hook-form"

interface LoanFormTermsCardProps {
    control: Control<any>
    formValues: any
    formatNumber: (value: number | string | undefined) => string
    parseFormattedNumber: (value: string) => number
}

export function LoanFormTermsCard({ control, formValues, formatNumber, parseFormattedNumber }: LoanFormTermsCardProps) {
    return (
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
                        control={control}
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
                                <FormDescription className="text-xs">Duración total del préstamo en meses</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
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
                        control={control}
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
                        control={control}
                        name="interestType"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Tipo de Interés</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
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
                                control={control}
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
                                control={control}
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
                                        <FormDescription className="text-xs">Monto adicional para GPS por día</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
