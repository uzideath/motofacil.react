"use client"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Control, UseFormSetValue } from "react-hook-form"

interface PaymentDetailsCardProps {
    control: Control<any>
    hasDueDate: boolean
    setValue: UseFormSetValue<any>
}

export function PaymentDetailsCard({ control, hasDueDate, setValue }: PaymentDetailsCardProps) {
    // Determine if it's a late or advance payment based on dates
    const paymentDate = control._formValues?.paymentDate
    const latePaymentDate = control._formValues?.latePaymentDate
    const advancePaymentDate = control._formValues?.advancePaymentDate
    
    const isLate = hasDueDate && latePaymentDate && paymentDate && 
        new Date(latePaymentDate).setHours(0, 0, 0, 0) < new Date(paymentDate).setHours(0, 0, 0, 0)
    
    const isAdvance = hasDueDate && advancePaymentDate && paymentDate && 
        new Date(advancePaymentDate).setHours(0, 0, 0, 0) > new Date(paymentDate).setHours(0, 0, 0, 0)

    return (
        <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Detalles del Pago
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Monto</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                        <Input
                                            type="text"
                                            className="pl-7"
                                            value={field.value ? field.value.toLocaleString() : ""}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^\d]/g, "")
                                                field.onChange(value ? Number.parseInt(value) : 0)
                                            }}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="gps"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>GPS</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                        <Input
                                            type="text"
                                            className="pl-7"
                                            value={field.value ? field.value.toLocaleString() : ""}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^\d]/g, "")
                                                field.onChange(value ? Number.parseInt(value) : 0)
                                            }}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={control}
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
                    control={control}
                    name="paymentDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fecha de la cuota</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                        >
                                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                        mode="single"
                                        selected={field.value || undefined}
                                        onSelect={(date) => {
                                            field.onChange(date)
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormDescription>Fecha en que se realizó el pago</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="space-y-4">
                    <FormField
                        control={control}
                        name="hasDueDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={(checked) => {
                                            field.onChange(checked)
                                        }}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="cursor-pointer">Asignar fecha de vencimiento</FormLabel>
                                    <FormDescription className="text-xs">
                                        Marcar si esta cuota corresponde a una fecha específica (pasada o futura)
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />
                    {hasDueDate && (
                        <FormField
                            control={control}
                            name="latePaymentDate"
                            render={({ field }) => {
                                const paymentDate = control._formValues?.paymentDate
                                const lateDate = control._formValues?.latePaymentDate
                                const advanceDate = control._formValues?.advancePaymentDate
                                const dueDate = lateDate || advanceDate
                                
                                // Determine if it's late or advance based on dates
                                let dateType: 'late' | 'advance' | 'same' = 'same'
                                if (paymentDate && dueDate) {
                                    const paymentTime = new Date(paymentDate).setHours(0, 0, 0, 0)
                                    const dueTime = new Date(dueDate).setHours(0, 0, 0, 0)
                                    
                                    if (dueTime < paymentTime) {
                                        dateType = 'late'
                                    } else if (dueTime > paymentTime) {
                                        dateType = 'advance'
                                    }
                                }

                                return (
                                    <FormItem>
                                        <FormLabel>Fecha de vencimiento</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={`w-full pl-3 text-left font-normal ${!dueDate && "text-muted-foreground"}`}
                                                    >
                                                        {dueDate ? (
                                                            format(dueDate, "PPP", { locale: es })
                                                        ) : (
                                                            <span>Seleccionar fecha de vencimiento</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <CalendarComponent
                                                    mode="single"
                                                    selected={dueDate || undefined}
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            const paymentTime = paymentDate ? new Date(paymentDate).setHours(0, 0, 0, 0) : new Date().setHours(0, 0, 0, 0)
                                                            const dueTime = new Date(date).setHours(0, 0, 0, 0)
                                                            
                                                            console.log('🎯 Date selected:', {
                                                                selectedDate: date,
                                                                paymentDate,
                                                                paymentTime: new Date(paymentTime),
                                                                dueTime: new Date(dueTime),
                                                                isFuture: dueTime >= paymentTime
                                                            })
                                                            
                                                            // Set the appropriate field based on whether it's past or future
                                                            if (dueTime >= paymentTime) {
                                                                // Future or same date - use advancePaymentDate
                                                                console.log('✅ Setting advancePaymentDate:', date)
                                                                setValue('latePaymentDate', undefined)
                                                                setValue('advancePaymentDate', date)
                                                            } else {
                                                                // Past date - use latePaymentDate
                                                                console.log('⚠️ Setting latePaymentDate:', date)
                                                                setValue('advancePaymentDate', undefined)
                                                                setValue('latePaymentDate', date)
                                                            }
                                                        }
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription>
                                            {dateType === 'late' && (
                                                <span className="text-amber-600 dark:text-amber-400">
                                                    ⚠️ Pago atrasado - Fecha de vencimiento original de esta cuota
                                                </span>
                                            )}
                                            {dateType === 'advance' && (
                                                <span className="text-blue-600 dark:text-blue-400">
                                                    ✓ Pago adelantado - Fecha futura a la que corresponde este pago
                                                </span>
                                            )}
                                            {dateType === 'same' && (
                                                <span>Fecha a la que corresponde esta cuota</span>
                                            )}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                    )}
                </div>
                <FormField
                    control={control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notas</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Agregue notas o comentarios sobre este pago..."
                                    className="resize-none min-h-[80px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>Información adicional sobre el pago (opcional)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    )
}
