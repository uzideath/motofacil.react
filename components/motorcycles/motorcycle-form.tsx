"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const motorcycleSchema = z.object({
  brand: z.string().min(2, {
    message: "La marca debe tener al menos 2 caracteres",
  }),
  model: z.string().min(2, {
    message: "El modelo debe tener al menos 2 caracteres",
  }),
  plate: z.string().min(5, {
    message: "La placa debe tener al menos 5 caracteres",
  }),
})

type MotorcycleFormValues = z.infer<typeof motorcycleSchema>

type MotorcycleData = {
  id: string
  brand: string
  model: string
  plate: string
}

export function MotorcycleForm({
  children,
  motorcycleId,
  motorcycleData,
}: {
  children: React.ReactNode
  motorcycleId?: string
  motorcycleData?: MotorcycleData
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<MotorcycleFormValues>({
    resolver: zodResolver(motorcycleSchema),
    defaultValues: {
      brand: "",
      model: "",
      plate: "",
    },
  })

  useEffect(() => {
    if (motorcycleData) {
      form.reset({
        brand: motorcycleData.brand,
        model: motorcycleData.model,
        plate: motorcycleData.plate,
      })
    }
  }, [motorcycleData, form])

  async function onSubmit(values: MotorcycleFormValues) {
    try {
      setLoading(true)

      // Simulación de guardado
      console.log(
        motorcycleId ? "Actualizando motocicleta:" : "Creando motocicleta:",
        motorcycleId ? { id: motorcycleId, ...values } : values,
      )

      // Esperar un momento para simular la operación
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: motorcycleId ? "Motocicleta actualizada" : "Motocicleta creada",
        description: motorcycleId
          ? "La motocicleta ha sido actualizada correctamente"
          : "La motocicleta ha sido creada correctamente",
      })

      setOpen(false)
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{motorcycleId ? "Editar Motocicleta" : "Nueva Motocicleta"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Marca de la motocicleta" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Modelo de la motocicleta" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa</FormLabel>
                    <FormControl>
                      <Input placeholder="Placa de la motocicleta" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : motorcycleId ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
