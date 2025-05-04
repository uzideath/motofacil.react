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
import { HttpService } from "@/lib/http"
import type { Motorcycle } from "@/lib/types"
import { Loader2 } from "lucide-react"

const motorcycleSchema = z.object({
  brand: z.string().min(2, { message: "La marca debe tener al menos 2 caracteres" }),
  model: z.string().min(2, { message: "El modelo debe tener al menos 2 caracteres" }),
  plate: z.string().min(5, { message: "La placa debe tener al menos 5 caracteres" }),
  color: z.string().optional().default(""),
  cc: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z.number().min(0, { message: "El cilindraje debe ser un número positivo" }).optional(),
  ),
  gps: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z.number().min(1, { message: "El GPS debe ser un número mayor o igual a 1" }).optional(),
  ),
})

type MotorcycleFormValues = z.infer<typeof motorcycleSchema>

type Props = {
  children: React.ReactNode
  motorcycleId?: string
  motorcycleData?: Motorcycle
  onCreated?: (newMotorcycle?: Motorcycle) => void
}

export function MotorcycleForm({ children, motorcycleId, motorcycleData, onCreated }: Props) {
  const [open, setOpen] = useState(false)
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
    },
  })

  useEffect(() => {
    if (motorcycleData) {
      form.reset({
        brand: motorcycleData.brand,
        model: motorcycleData.model,
        plate: motorcycleData.plate,
        color: motorcycleData.color ?? "",
        cc: motorcycleData.cc ?? undefined,
        gps: motorcycleData.gps ?? undefined,
      })
    }
  }, [motorcycleData, form])

  async function onSubmit(values: MotorcycleFormValues) {
    try {
      setLoading(true)

      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("authToken="))
        ?.split("=")[1]

      const response = await HttpService.post("/api/v1/motorcycles", values, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      toast({
        title: "Motocicleta creada",
        description: "La motocicleta ha sido creada correctamente",
      })

      setOpen(false)

      // Pass the new motorcycle data to the onCreated callback
      if (onCreated) {
        onCreated(response.data)
      }

      // Reset the form
      form.reset({
        brand: "",
        model: "",
        plate: "",
        color: "",
        cc: undefined,
        gps: undefined,
      })
    } catch (error) {
      console.error("Error al crear motocicleta:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la motocicleta",
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
                      <Input
                        placeholder="Marca de la motocicleta"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
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
                      <Input
                        placeholder="Modelo de la motocicleta"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
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
                      <Input
                        placeholder="Placa de la motocicleta"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Color de la motocicleta"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GPS</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Código GPS"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cilindraje (cc)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 150" value={field.value ?? ""} onChange={field.onChange} />
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
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
