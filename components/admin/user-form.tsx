"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

type User = {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "manager"
  status: "active" | "inactive"
  lastLogin?: string
  createdAt?: string
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor ingresa un correo electrónico válido.",
  }),
  role: z.enum(["admin", "user", "manager"], {
    required_error: "Por favor selecciona un rol.",
  }),
  status: z.enum(["active", "inactive"], {
    required_error: "Por favor selecciona un estado.",
  }),
})

type UserFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onSave: (user: User) => void
}

export function UserForm({ open, onOpenChange, user, onSave }: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      status: "active",
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      })
    } else {
      form.reset({
        name: "",
        email: "",
        role: "user",
        status: "active",
      })
    }
  }, [user, form, open])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Simulación de guardado
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const savedUser: User = {
        id: user?.id || "new",
        ...values,
        lastLogin: user?.lastLogin || new Date().toISOString(),
        createdAt: user?.createdAt || new Date().toISOString(),
      }

      onSave(savedUser)
    } catch (error) {
      console.error("Error al guardar usuario:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {user
              ? "Actualiza la información del usuario existente."
              : "Completa el formulario para crear un nuevo usuario."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Nombre completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Juan Pérez"
                      {...field}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus-visible:ring-primary/50"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="nombre@ejemplo.com"
                      {...field}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus-visible:ring-primary/50"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Rol</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white focus:ring-primary/50">
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="admin" className="focus:bg-gray-700 focus:text-white">
                          Administrador
                        </SelectItem>
                        <SelectItem value="manager" className="focus:bg-gray-700 focus:text-white">
                          Gerente
                        </SelectItem>
                        <SelectItem value="user" className="focus:bg-gray-700 focus:text-white">
                          Usuario
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-gray-500">
                      Define los permisos del usuario en el sistema.
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white focus:ring-primary/50">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="active" className="focus:bg-gray-700 focus:text-white">
                          Activo
                        </SelectItem>
                        <SelectItem value="inactive" className="focus:bg-gray-700 focus:text-white">
                          Inactivo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-gray-500">
                      Determina si el usuario puede acceder al sistema.
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {user ? "Actualizando..." : "Creando..."}
                  </>
                ) : user ? (
                  "Actualizar"
                ) : (
                  "Crear"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
