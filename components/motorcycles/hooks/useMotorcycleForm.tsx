"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { HttpService } from "@/lib/http"
import type { Motorcycle } from "@/lib/types"

const motorcycleSchema = z.object({
    brand: z.string().min(2, { message: "La marca debe tener al menos 2 caracteres" }),
    model: z.string().min(2, { message: "El modelo debe tener al menos 2 caracteres" }),
    plate: z.string().min(5, { message: "La placa debe tener al menos 5 caracteres" }),
    color: z.string().min(1, { message: "El color es obligatorio" }),
    cc: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().min(1, { message: "El cilindraje debe ser un número positivo" }).optional(),
    ),
    gps: z.preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z.number().min(1, { message: "El GPS debe ser un número mayor o igual a 1" }).optional(),
    ),
    engine: z.string().min(5, { message: "El número de motor debe tener al menos 5 caracteres" }),
    chassis: z.string().min(5, { message: "El número de chasis debe tener al menos 5 caracteres" }),
    providerId: z.string({ required_error: "El proveedor es obligatorio" }).uuid(),
})

export type MotorcycleFormValues = z.infer<typeof motorcycleSchema>

interface UseMotorcycleFormProps {
    motorcycleId?: string
    motorcycleData?: Motorcycle
    onCreated?: (newMotorcycle?: Motorcycle) => void
    onClose?: () => void
}

export function useMotorcycleForm({ motorcycleId, motorcycleData, onCreated, onClose }: UseMotorcycleFormProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const form = useForm<MotorcycleFormValues>({
        resolver: zodResolver(motorcycleSchema),
        defaultValues: {
            brand: "",
            model: "",
            plate: "",
            color: "",
            cc: undefined,
            gps: undefined,
            engine: "",
            chassis: "",
            providerId: "",
        },
        mode: "onChange",
    })

    // Populate form with existing motorcycle data
    useEffect(() => {
        if (motorcycleData) {
            form.reset({
                providerId: motorcycleData.providerId,
                brand: motorcycleData.brand,
                model: motorcycleData.model,
                plate: motorcycleData.plate,
                color: motorcycleData.color ?? "",
                cc: motorcycleData.cc ?? undefined,
                gps: motorcycleData.gps ?? undefined,
                engine: motorcycleData.engine ?? "",
                chassis: motorcycleData.chassis ?? "",
            })
        }
    }, [motorcycleData, form])

    const getAuthToken = () => {
        return document.cookie
            .split("; ")
            .find((c) => c.startsWith("authToken="))
            ?.split("=")[1]
    }

    const onSubmit = async (values: MotorcycleFormValues) => {
        try {
            setLoading(true)
            const token = getAuthToken()

            let response
            if (motorcycleId) {
                response = await HttpService.put(`/api/v1/motorcycles/${motorcycleId}`, values, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                })
            } else {
                response = await HttpService.post("/api/v1/motorcycles", values, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                })
            }

            toast({
                title: motorcycleId ? "Motocicleta actualizada" : "Motocicleta creada",
                description: motorcycleId
                    ? "La motocicleta ha sido actualizada correctamente"
                    : "La motocicleta ha sido creada correctamente",
            })

            onClose?.()
            setTimeout(() => {
                onCreated?.(response.data)
            }, 100)

            form.reset({
                brand: "",
                model: "",
                plate: "",
                color: "",
                cc: undefined,
                gps: undefined,
                engine: "",
                chassis: "",
                providerId: "",
            })
        } catch (error) {
            console.error("Error al guardar motocicleta:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: motorcycleId ? "No se pudo actualizar la motocicleta" : "No se pudo crear la motocicleta",
            })
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        form.reset({
            brand: "",
            model: "",
            plate: "",
            color: "",
            cc: undefined,
            gps: undefined,
            engine: "",
            chassis: "",
            providerId: "",
        })
    }

    return {
        // Form state
        form,
        loading,

        // Actions
        onSubmit: form.handleSubmit(onSubmit),
        resetForm,

        // Computed values
        isEditing: !!motorcycleId,
        hasErrors: Object.keys(form.formState.errors).length > 0,
    }
}

export { motorcycleSchema }
