"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HttpService } from "@/lib/http"
import type { Motorcycle } from "@/lib/types"
import { Loader2, Bike, X, Save, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const motorcycleSchema = z.object({
  brand: z.string().min(2, { message: "La marca debe tener al menos 2 caracteres" }),
  model: z.string().min(2, { message: "El modelo debe tener al menos 2 caracteres" }),
  plate: z.string().min(5, { message: "La placa debe tener al menos 5 caracteres" }),
  color: z.string().min(1, { message: "El color es obligatorio" }),
  cc: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z.number().min(1, { message: "El cilindraje debe ser un número positivo" }),
  ),
  gps: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z.number().min(1, { message: "El GPS debe ser un número mayor o igual a 1" }),
  ),
  engine: z.string().min(5, { message: "El número de motor debe tener al menos 5 caracteres" }),
  chassis: z.string().min(5, { message: "El número de chasis debe tener al menos 5 caracteres" }),
  provider: z.enum(["MOTOFACIL", "OBRASOCIAL", "PORCENTAJETITO"], {
    required_error: "El proveedor es obligatorio",
  }),
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
      engine: "",
      chassis: "",
      provider: undefined,
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (motorcycleData) {
      form.reset({
        provider: motorcycleData.provider,
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

  async function onSubmit(values: MotorcycleFormValues) {
    try {
      setLoading(true)

      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("authToken="))
        ?.split("=")[1]

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

      setOpen(false)
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
        provider: undefined,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <DialogTitle className="sr-only">{motorcycleId ? "Editar Motocicleta" : "Nueva Motocicleta"}</DialogTitle>

        <div className="relative">
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="rounded-full h-8 w-8 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-sky-500 p-6 flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
              <Bike className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {motorcycleId ? "Editar Motocicleta" : "Nueva Motocicleta"}
              </h2>
              <p className="text-blue-100 text-sm">
                {motorcycleId ? "Actualiza los datos de tu motocicleta" : "Ingresa los datos de tu nueva motocicleta"}
              </p>
            </div>
          </div>

          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card className="border border-blue-100 dark:border-blue-900/30 shadow-sm">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                      Información básica
                    </h3>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="after:content-['*'] after:text-red-500 after:ml-0.5">Marca</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Marca de la motocicleta"
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">Ej: Honda, Yamaha, Suzuki</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="after:content-['*'] after:text-red-500 after:ml-0.5">
                              Modelo
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Modelo de la motocicleta"
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">Ej: CBR 600, YZF-R6</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="plate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="after:content-['*'] after:text-red-500 after:ml-0.5">Placa</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Placa de la motocicleta"
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700 uppercase"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">Formato: ABC123</FormDescription>
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
                      Características
                    </h3>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="after:content-['*'] after:text-red-500 after:ml-0.5">Color</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Color de la motocicleta"
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">Ej: Rojo, Negro, Azul</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="after:content-['*'] after:text-red-500 after:ml-0.5">
                              Cilindraje (cc)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Ej: 150"
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Capacidad del motor en centímetros cúbicos
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="engine"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="after:content-['*'] after:text-red-500 after:ml-0.5">
                              Número de Motor
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: HA11EPR9M01101"
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700 font-mono uppercase"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Número de identificación único del motor
                            </FormDescription>
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
                      Identificación y seguimiento
                    </h3>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="chassis"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="after:content-['*'] after:text-red-500 after:ml-0.5">
                              Número de Chasis
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Chasis"
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700 font-mono uppercase"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Número de identificación único del chasis
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gps"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="after:content-['*'] after:text-red-500 after:ml-0.5">GPS</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Código GPS"
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">Código del dispositivo GPS instalado</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-6">
                      <FormField
                        control={form.control}
                        name="provider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="after:content-['*'] after:text-red-500 after:ml-0.5">
                              Proveedor
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700">
                                  <SelectValue placeholder="Selecciona un proveedor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MOTOFACIL">Moto Facil</SelectItem>
                                <SelectItem value="OBRASOCIAL">Obra Social</SelectItem>
                                <SelectItem value="PORCENTAJETITO">Porcentaje Tito</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-xs">
                              Selecciona el proveedor para esta motocicleta
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {form.formState.errors && Object.keys(form.formState.errors).length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-3 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-400">
                        Por favor corrige los errores antes de continuar
                      </p>
                      <ul className="list-disc pl-5 mt-1 text-xs text-red-700 dark:text-red-300">
                        {Object.entries(form.formState.errors).map(([key, error]) => (
                          <li key={key}>{error.message as string}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/30"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {motorcycleId ? "Actualizando..." : "Creando..."}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {motorcycleId ? "Actualizar" : "Guardar"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
