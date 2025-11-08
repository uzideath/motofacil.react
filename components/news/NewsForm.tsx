"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { News, NewsType, NewsCategory, Loan } from "@/lib/types"
import { NewsService, CreateNewsDto } from "@/lib/services/news.service"
import { HttpService } from "@/lib/http"
import { useStore } from "@/contexts/StoreContext"
import { useToast } from "@/components/ui/use-toast"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

const newsSchema = z.object({
    type: z.nativeEnum(NewsType),
    category: z.nativeEnum(NewsCategory),
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
    notes: z.string().optional(),
    startDate: z.string().min(1, "La fecha de inicio es requerida"),
    endDate: z.string().optional(),
    isActive: z.boolean().default(true),
    loanId: z.string().optional(),
    autoCalculateInstallments: z.boolean().default(false),
    daysUnavailable: z.number().min(0).optional(),
    installmentsToSubtract: z.number().min(0).optional(),
})

type NewsFormValues = z.infer<typeof newsSchema>

interface NewsFormProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    news?: News | null
}

export function NewsForm({ open, onClose, onSuccess, news }: NewsFormProps) {
    const [loading, setLoading] = useState(false)
    const [loans, setLoans] = useState<Loan[]>([])
    const [loadingLoans, setLoadingLoans] = useState(false)
    const { currentStore } = useStore()
    const { toast } = useToast()

    const form = useForm<NewsFormValues>({
        resolver: zodResolver(newsSchema),
        defaultValues: {
            type: NewsType.LOAN_SPECIFIC,
            category: NewsCategory.WORKSHOP,
            title: "",
            description: "",
            notes: "",
            startDate: new Date().toISOString().split("T")[0],
            endDate: "",
            isActive: true,
            loanId: "",
            autoCalculateInstallments: false,
            daysUnavailable: 0,
            installmentsToSubtract: 0,
        },
    })

    const newsType = form.watch("type")
    const autoCalculate = form.watch("autoCalculateInstallments")
    const daysUnavailable = form.watch("daysUnavailable")

    useEffect(() => {
        if (open && currentStore) {
            loadLoans()
        }
    }, [open, currentStore])

    useEffect(() => {
        if (news) {
            form.reset({
                type: news.type,
                category: news.category,
                title: news.title,
                description: news.description,
                notes: news.notes || "",
                startDate: new Date(news.startDate).toISOString().split("T")[0],
                endDate: news.endDate ? new Date(news.endDate).toISOString().split("T")[0] : "",
                isActive: news.isActive,
                loanId: news.loanId || "",
                autoCalculateInstallments: news.autoCalculateInstallments,
                daysUnavailable: news.daysUnavailable || 0,
                installmentsToSubtract: news.installmentsToSubtract || 0,
            })
        } else {
            form.reset()
        }
    }, [news, open])

    const loadLoans = async () => {
        if (!currentStore) return

        try {
            setLoadingLoans(true)
            const token = document.cookie
                .split("; ")
                .find((c) => c.startsWith("authToken="))
                ?.split("=")[1]

            const response = await HttpService.get<{ data: Loan[] }>(
                `/api/v1/loans?page=1&limit=1000&storeId=${currentStore.id}`,
                {
                    headers: { Authorization: token ? `Bearer ${token}` : "" },
                }
            )
            setLoans(response.data.data || [])
        } catch (error) {
            console.error("Error loading loans:", error)
        } finally {
            setLoadingLoans(false)
        }
    }

    const onSubmit = async (values: NewsFormValues) => {
        if (!currentStore) return

        try {
            setLoading(true)

            const data: CreateNewsDto = {
                ...values,
                storeId: currentStore.id,
                loanId: values.type === NewsType.LOAN_SPECIFIC ? values.loanId : undefined,
                endDate: values.endDate || undefined,
                notes: values.notes || undefined,
                daysUnavailable: values.daysUnavailable || undefined,
                installmentsToSubtract: values.installmentsToSubtract || undefined,
            }

            if (news) {
                await NewsService.update(news.id, data)
                toast({
                    title: "Novedad actualizada",
                    description: "La novedad ha sido actualizada correctamente",
                })
            } else {
                await NewsService.create(data)
                toast({
                    title: "Novedad creada",
                    description: "La novedad ha sido creada correctamente",
                })
            }

            onSuccess()
        } catch (error) {
            console.error("Error saving news:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo guardar la novedad",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {news ? "Editar Novedad" : "Nueva Novedad"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Novedad</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={NewsType.LOAN_SPECIFIC}>
                                                Préstamo Específico
                                            </SelectItem>
                                            <SelectItem value={NewsType.STORE_WIDE}>
                                                Toda la Tienda
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        {newsType === NewsType.LOAN_SPECIFIC
                                            ? "Afecta solo a un préstamo específico"
                                            : "Afecta a toda la tienda"}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {newsType === NewsType.LOAN_SPECIFIC && (
                            <FormField
                                control={form.control}
                                name="loanId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Préstamo</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={loadingLoans}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona un préstamo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {loans.map((loan) => (
                                                    <SelectItem key={loan.id} value={loan.id}>
                                                        {loan.user.name} - {loan.vehicle?.plate || "N/A"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoría</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una categoría" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={NewsCategory.WORKSHOP}>Taller</SelectItem>
                                            <SelectItem value={NewsCategory.MAINTENANCE}>Mantenimiento</SelectItem>
                                            <SelectItem value={NewsCategory.ACCIDENT}>Accidente</SelectItem>
                                            <SelectItem value={NewsCategory.THEFT}>Robo</SelectItem>
                                            <SelectItem value={NewsCategory.DAY_OFF}>Día Libre</SelectItem>
                                            <SelectItem value={NewsCategory.HOLIDAY}>Festivo</SelectItem>
                                            <SelectItem value={NewsCategory.SYSTEM_MAINTENANCE}>
                                                Mantenimiento del Sistema
                                            </SelectItem>
                                            <SelectItem value={NewsCategory.OTHER}>Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Título de la novedad" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descripción detallada"
                                            {...field}
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Notas adicionales"
                                            {...field}
                                            rows={2}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Inicio</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Fin (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {newsType === NewsType.LOAN_SPECIFIC && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="autoCalculateInstallments"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">
                                                    Auto-calcular Cuotas
                                                </FormLabel>
                                                <FormDescription>
                                                    Calcular automáticamente las cuotas a descontar basado en los días no disponibles
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="daysUnavailable"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Días No Disponible</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        {...field}
                                                        onChange={(e) =>
                                                            field.onChange(parseInt(e.target.value) || 0)
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="installmentsToSubtract"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cuotas a Descontar</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        disabled={autoCalculate}
                                                        {...field}
                                                        onChange={(e) =>
                                                            field.onChange(parseInt(e.target.value) || 0)
                                                        }
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    {autoCalculate
                                                        ? "Se calculará automáticamente"
                                                        : "Especificar manualmente"}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </>
                        )}

                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Activa</FormLabel>
                                        <FormDescription>
                                            Marcar como activa o inactiva
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {news ? "Actualizar" : "Crear"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
