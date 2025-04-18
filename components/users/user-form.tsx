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

const userSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres",
  }),
  identification: z.string().min(5, {
    message: "La identificación debe tener al menos 5 caracteres",
  }),
  age: z.coerce.number().min(18, {
    message: "La edad debe ser mayor o igual a 18",
  }),
  phone: z.string().min(7, {
    message: "El teléfono debe tener al menos 7 caracteres",
  }),
  address: z.string().min(5, {
    message: "La dirección debe tener al menos 5 caracteres",
  }),
})

type UserFormValues = z.infer<typeof userSchema>

type UserData = {
  id: string
  name: string
  identification: string
  age: number
  phone: string
  address: string
}

export function UserForm({
  children,
  userId,
  userData,
}: {
  children: React.ReactNode
  userId?: string
  userData?: UserData
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      identification: "",
      age: 18,
      phone: "",
      address: "",
    },
  })

  useEffect(() => {
    if (userData) {
      form.reset({
        name: userData.name,
        identification: userData.identification,
        age: userData.age,
        phone: userData.phone,
        address: userData.address,
      })
    }
  }, [userData, form])

  async function onSubmit(values: UserFormValues) {
    try {
      setLoading(true)

      // Simulación de guardado
      console.log(userId ? "Actualizando usuario:" : "Creando usuario:", userId ? { id: userId, ...values } : values)

      // Esperar un momento para simular la operación
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: userId ? "Usuario actualizado" : "Usuario creado",
        description: userId
          ? "El usuario ha sido actualizado correctamente"
          : "El usuario ha sido creado correctamente",
      })

      setOpen(false)
    } catch (error) {
      console.error("Error al guardar usuario:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: userId ? "No se pudo actualizar el usuario" : "No se pudo crear el usuario",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{userId ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="identification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identificación</FormLabel>
                    <FormControl>
                      <Input placeholder="Número de identificación" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edad</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="Número de teléfono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Dirección completa" {...field} />
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
                {loading ? "Guardando..." : userId ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
