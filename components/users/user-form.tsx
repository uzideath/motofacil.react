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
import { Client } from "@/lib/types"


const userSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  identification: z.string().min(5, { message: "La identificación debe tener al menos 5 caracteres" }),
  age: z.coerce.number().min(18, { message: "La edad debe ser mayor o igual a 18" }),
  phone: z.string().min(7, { message: "El teléfono debe tener al menos 7 caracteres" }),
  address: z.string().min(5, { message: "La dirección debe tener al menos 5 caracteres" }),
  refName: z.string().min(2, { message: "El nombre del referente debe tener al menos 2 caracteres" }),
  refID: z.string().min(5, { message: "La identificación del referente debe tener al menos 5 caracteres" }),
  refPhone: z.string().min(7, { message: "El teléfono del referente debe tener al menos 7 caracteres" }),
})

type UserFormValues = z.infer<typeof userSchema>

type Props = {
  children: React.ReactNode
  userId?: string
  userData?: Client
  onCreated?: (user: Client) => void
}

export function UserForm({ children, userId, userData, onCreated }: Props) {
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
      refName: "",
      refID: "",
      refPhone: "",
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
        refName: userData.refName,
        refID: userData.refID,
        refPhone: userData.refPhone,
      })
    }
  }, [userData, form])

  async function onSubmit(values: UserFormValues) {
    try {
      setLoading(true)

      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("authToken="))
        ?.split("=")[1]

      let response
      if (userId) {
        response = await HttpService.put(`/api/v1/users/${userId}`, values, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        })
      } else {
        response = await HttpService.post("/api/v1/users", values, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        })
      }

      toast({
        title: userId ? "Usuario actualizado" : "Usuario creado",
        description: userId
          ? "El usuario ha sido actualizado correctamente"
          : "El usuario ha sido creado correctamente",
      })

      onCreated?.(response.data)
      setOpen(false)
      form.reset()
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
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="identification" render={({ field }) => (
                <FormItem>
                  <FormLabel>Identificación</FormLabel>
                  <FormControl>
                    <Input placeholder="Número de identificación" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="age" render={({ field }) => (
                <FormItem>
                  <FormLabel>Edad</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="Número de teléfono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Dirección completa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="refName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Referente</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del referente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="refID" render={({ field }) => (
                <FormItem>
                  <FormLabel>Identificación del Referente</FormLabel>
                  <FormControl>
                    <Input placeholder="ID del referente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="refPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono del Referente</FormLabel>
                  <FormControl>
                    <Input placeholder="Teléfono del referente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
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