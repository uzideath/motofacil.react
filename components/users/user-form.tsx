"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HttpService } from "@/lib/http"
import type { Client } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  User,
  Phone,
  Home,
  Users,
  Save,
  X,
  UserPlus,
  UserCheck,
  MapPin,
  FileText,
  Calendar,
  Hash,
} from "lucide-react"

const userSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  identification: z.string().min(5, { message: "La identificación debe tener al menos 5 caracteres" }),
  idIssuedAt: z.string().min(2, { message: "El lugar de expedición debe tener al menos 2 caracteres" }),
  age: z.coerce.number().min(18, { message: "La edad debe ser mayor o igual a 18" }),
  phone: z.string().min(7, { message: "El teléfono debe tener al menos 7 caracteres" }),
  address: z.string().min(5, { message: "La dirección debe tener al menos 5 caracteres" }),
  city: z.string().min(2, { message: "La ciudad debe tener al menos 2 caracteres" }),
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
  const [activeTab, setActiveTab] = useState("personal")

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      identification: "",
      idIssuedAt: "",
      age: 18,
      phone: "",
      address: "",
      city: "",
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
        idIssuedAt: userData.idIssuedAt || "",
        age: userData.age,
        phone: userData.phone,
        address: userData.address,
        city: userData.city || "",
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
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
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
              {userId ? <UserCheck className="h-8 w-8 text-white" /> : <UserPlus className="h-8 w-8 text-white" />}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {userId ? "Editar Usuario" : "Nuevo Usuario"}
              </DialogTitle>
              <p className="text-blue-100 text-sm">
                {userId ? "Actualiza los datos del usuario" : "Ingresa los datos del nuevo usuario"}
              </p>
            </div>
          </div>

          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="personal" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Información Personal</span>
                    </TabsTrigger>
                    <TabsTrigger value="reference" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Información de Referencia</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal">
                    <Card className="border border-blue-100 dark:border-blue-900/30 shadow-sm">
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                          <User className="h-5 w-5" />
                          Datos personales
                        </h3>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5 after:content-['*'] after:text-red-500 after:ml-0.5">
                                  <User className="h-4 w-4 text-blue-500" />
                                  Nombre completo
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nombre y apellidos"
                                    {...field}
                                    className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  Ingrese el nombre completo del cliente
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5 after:content-['*'] after:text-red-500 after:ml-0.5">
                                  <Calendar className="h-4 w-4 text-blue-500" />
                                  Edad
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  La edad debe ser mayor o igual a 18 años
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="identification"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5 after:content-['*'] after:text-red-500 after:ml-0.5">
                                  <Hash className="h-4 w-4 text-blue-500" />
                                  Identificación
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Número de identificación"
                                    {...field}
                                    className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  Cédula de ciudadanía, extranjería o pasaporte
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="idIssuedAt"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5 after:content-['*'] after:text-red-500 after:ml-0.5">
                                  <MapPin className="h-4 w-4 text-blue-500" />
                                  Lugar de expedición
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ciudad o municipio de expedición"
                                    {...field}
                                    className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  Lugar donde se expidió el documento de identidad
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5 after:content-['*'] after:text-red-500 after:ml-0.5">
                                  <Phone className="h-4 w-4 text-blue-500" />
                                  Teléfono
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Número de teléfono"
                                    {...field}
                                    className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">Número de contacto principal</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5 after:content-['*'] after:text-red-500 after:ml-0.5">
                                  <Home className="h-4 w-4 text-blue-500" />
                                  Dirección
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Dirección completa"
                                    {...field}
                                    className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">Dirección de residencia actual</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5 after:content-['*'] after:text-red-500 after:ml-0.5">
                                  <MapPin className="h-4 w-4 text-blue-500" />
                                  Ciudad de residencia
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ciudad donde reside"
                                    {...field}
                                    className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  Ciudad o municipio de residencia actual
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex justify-between mt-6">
                      <div></div>
                      <Button
                        type="button"
                        onClick={() => setActiveTab("reference")}
                        className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white"
                      >
                        Siguiente
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="reference">
                    <Card className="border border-blue-100 dark:border-blue-900/30 shadow-sm">
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                          <Users className="h-5 w-5" />
                          Datos del referente
                        </h3>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="refName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5 after:content-['*'] after:text-red-500 after:ml-0.5">
                                  <User className="h-4 w-4 text-blue-500" />
                                  Nombre del referente
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nombre completo del referente"
                                    {...field}
                                    className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  Persona que puede dar referencias del cliente
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="refID"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5 after:content-['*'] after:text-red-500 after:ml-0.5">
                                  <FileText className="h-4 w-4 text-blue-500" />
                                  Identificación del referente
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Número de identificación"
                                    {...field}
                                    className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  Documento de identidad del referente
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="refPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5 after:content-['*'] after:text-red-500 after:ml-0.5">
                                  <Phone className="h-4 w-4 text-blue-500" />
                                  Teléfono del referente
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Número de contacto"
                                    {...field}
                                    className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">Número de contacto del referente</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex justify-between mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("personal")}
                        className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/30"
                      >
                        Anterior
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white shadow-md hover:shadow-lg transition-all"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {userId ? "Actualizando..." : "Creando..."}
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            {userId ? "Actualizar" : "Guardar"}
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
