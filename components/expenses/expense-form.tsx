"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Receipt, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { HttpService } from "@/lib/http"

export enum ExpenseCategory {
    RENT = "RENT",
    SERVICES = "SERVICES",
    SALARIES = "SALARIES",
    TAXES = "TAXES",
    MAINTENANCE = "MAINTENANCE",
    PURCHASES = "PURCHASES",
    MARKETING = "MARKETING",
    TRANSPORT = "TRANSPORT",
    OTHER = "OTHER",
}

export enum PaymentMethod {
    CASH = "CASH",
    CARD = "CARD",
    TRANSACTION = "TRANSACTION",
}



const expenseFormSchema = z.object({
    amount: z
        .string()
        .min(1, "El monto es obligatorio")
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val > 0, {
            message: "Debe ser un número mayor a 0",
        }),
    date: z.date({ required_error: "La fecha es obligatoria" }),
    category: z.nativeEnum(ExpenseCategory, { errorMap: () => ({ message: "Categoría inválida" }) }),
    paymentMethod: z.nativeEnum(PaymentMethod, { errorMap: () => ({ message: "Método inválido" }) }),
    beneficiary: z.string().min(2, "Debe tener al menos 2 caracteres"),
    reference: z.string().optional(),
    description: z.string().min(5, "Debe tener al menos 5 caracteres"),
    attachments: z
        .any()
        .refine((val) => val instanceof FileList || val === undefined, {
            message: "Debe ser una lista de archivos válida",
        })
        .optional(),
})

type ExpenseFormValues = z.infer<typeof expenseFormSchema>

interface ExpenseFormProps {
    onSuccess?: () => void
    isModal?: boolean
}

export function ExpenseForm({ onSuccess, isModal = false }: ExpenseFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseFormSchema),
        defaultValues: {
            date: new Date(),
            paymentMethod: PaymentMethod.CASH,
        },
    })

    async function onSubmit(data: ExpenseFormValues) {
        setIsSubmitting(true)

        try {
            let attachmentUrl: string | undefined

            // 1. Subir imagen si hay archivos
            if (data.attachments && data.attachments.length > 0) {
                const file = (data.attachments as FileList)[0] // Solo uno, o itera si deseas varios
                const imageForm = new FormData()
                imageForm.append("file", file)

                const imageRes = await HttpService.post("/api/v1/cloudinary/upload", imageForm)
                console.log(imageRes.data)
                console.log(imageForm)
                attachmentUrl = imageRes.data.imageUrl
            }

            // 2. Construir objeto JSON para el egreso
            const payload = {
                amount: data.amount,
                date: data.date.toISOString(),
                category: data.category,
                paymentMethod: data.paymentMethod,
                beneficiary: data.beneficiary,
                reference: data.reference || null,
                description: data.description,
                attachments: attachmentUrl ? [attachmentUrl] : [], // o solo string si es una URL
            }

            await HttpService.post("/api/v1/expense", payload)

            toast({
                title: "Egreso registrado",
                description: "Egreso guardado exitosamente",
            })

            onSuccess?.() || router.push("/egresos")
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Hubo un error al guardar el egreso",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }



    const formContent = (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Monto</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                                        <Input placeholder="0.00" {...field} className="pl-8" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Fecha</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                            >
                                                {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Categoría</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar categoría" />
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
                                        <SelectItem value="CARD">Tarjeta</SelectItem>
                                        <SelectItem value="TRANSACTION">Transferencia</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="beneficiary"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Beneficiario/Proveedor</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nombre del beneficiario" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    <FormField
                        control={form.control}
                        name="reference"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Referencia (opcional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Número de factura, recibo, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Detalle del egreso" className="min-h-[120px]" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="attachments"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Comprobantes (opcional)</FormLabel>
                            <FormControl>
                                <div
                                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm font-medium">
                                        Arrastra archivos aquí o haz clic para seleccionar
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Soporta: JPG, PNG, PDF (máx. 5MB)
                                    </p>
                                </div>
                            </FormControl>

                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                multiple
                                accept="image/jpeg, image/png, application/pdf"
                                onChange={(e) => {
                                    const files = e.target.files
                                    if (files && files.length > 0) {
                                        field.onChange(files)
                                    } else {
                                        field.onChange(undefined)
                                    }
                                }}
                            />

                            <FormDescription>
                                Adjunta facturas, recibos u otros documentos relacionados con este egreso.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => (isModal ? onSuccess && onSuccess() : router.push("/egresos"))}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Receipt className="mr-2 h-4 w-4" />
                                Registrar Egreso
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )

    if (isModal) {
        return formContent
    }

    return (
        <Card>
            <CardContent className="pt-6">{formContent}</CardContent>
        </Card>
    )
}
