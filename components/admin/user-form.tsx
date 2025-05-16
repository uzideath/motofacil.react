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
import { Loader2, Copy, Check, KeyRound, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { HttpService } from "@/lib/http"
import type { User } from "./types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  username: z.string().min(3, {
    message: "El nombre de usuario debe tener al menos 3 caracteres.",
  }),
  role: z.enum(["ADMIN", "USER", "MANAGER"], {
    required_error: "Por favor selecciona un rol.",
  }),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    required_error: "Por favor selecciona un estado.",
  }),
})

type UserFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onSave: (user: User) => void
  onDelete?: (user: User) => void
}

// Function to generate a random password
const generateRandomPassword = (length = 10) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?"
  let password = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }
  return password
}

export function UserForm({ open, onOpenChange, user, onSave, onDelete }: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [copied, setCopied] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      role: "USER",
      status: "ACTIVE",
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        username: user.username,
        role: user.role,
        status: user.status,
      })
      // Clear generated password when editing
      setGeneratedPassword("")
      setShowResetPassword(false)
    } else {
      form.reset({
        name: "",
        username: "",
        role: "USER",
        status: "ACTIVE",
      })
      // Generate a new password when creating
      setGeneratedPassword(generateRandomPassword())
    }
    setCopied(false)
  }, [user, form, open])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword)
    setCopied(true)
    toast({
      title: "Contraseña copiada",
      description: "La contraseña ha sido copiada al portapapeles.",
    })

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const regeneratePassword = () => {
    setGeneratedPassword(generateRandomPassword())
    setCopied(false)
  }

  const handleResetPassword = () => {
    setGeneratedPassword(generateRandomPassword())
    setShowResetPassword(true)
    setCopied(false)
  }

  const handleDelete = async () => {
    if (!user) return

    setIsDeleting(true)

    try {
      await HttpService.delete(`/api/v1/owners/${user.id}`)

      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente.",
        variant: "default",
      })

      if (onDelete) {
        onDelete(user)
      }

      onOpenChange(false)
    } catch (error: any) {
      console.error("Error al eliminar usuario:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Ocurrió un error al eliminar el usuario. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      if (user) {
        // Update existing user with PUT request
        const updateData = {
          ...values,
          // Include password only if reset password is shown
          ...(showResetPassword && { password: generatedPassword }),
        }

        const response = await HttpService.put(`/api/v1/owners/${user.id}`, updateData)
        const responseData = response.data

        const updatedUser: User = {
          id: user.id,
          name: values.name,
          username: values.username,
          role: values.role,
          status: values.status,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        }

        onSave(updatedUser)

        toast({
          title: "Usuario actualizado",
          description: showResetPassword
            ? "El usuario ha sido actualizado y su contraseña ha sido restablecida exitosamente."
            : "El usuario ha sido actualizado exitosamente.",
          variant: "default",
        })
      } else {
        // Create new user
        const response = await HttpService.post("/api/v1/owners", {
          ...values,
          password: generatedPassword,
        })

        const newUser: User = response.data

        onSave(newUser)

        toast({
          title: "Usuario creado",
          description: "El usuario ha sido creado exitosamente. Asegúrate de guardar la contraseña.",
          variant: "default",
        })
      }
    } catch (error: any) {
      console.error("Error al guardar usuario:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Ocurrió un error al guardar el usuario. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
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
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Nombre de usuario</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="usuario123"
                        {...field}
                        className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus-visible:ring-primary/50"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {/* Password section for new user */}
              {!user && generatedPassword && (
                <div className="space-y-2">
                  <FormLabel className="text-gray-300">Contraseña generada</FormLabel>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-white font-mono">
                      {generatedPassword}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={regeneratePassword}
                    className="mt-1 text-xs border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Generar nueva contraseña
                  </Button>
                  <FormDescription className="text-amber-400/80 text-sm">
                    Guarda esta contraseña en un lugar seguro. No podrás verla de nuevo.
                  </FormDescription>
                </div>
              )}

              {/* Password reset section for existing user */}
              {user && (
                <div className="space-y-2">
                  {!showResetPassword ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetPassword}
                      className="flex items-center space-x-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <KeyRound className="h-4 w-4 mr-2" />
                      Restablecer contraseña
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <FormLabel className="text-gray-300">Nueva contraseña</FormLabel>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-white font-mono">
                          {generatedPassword}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={copyToClipboard}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={regeneratePassword}
                          className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          Generar nueva contraseña
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowResetPassword(false)}
                          className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          Cancelar
                        </Button>
                      </div>
                      <FormDescription className="text-amber-400/80 text-sm">
                        Al guardar, la contraseña del usuario será cambiada por esta nueva.
                      </FormDescription>
                    </div>
                  )}
                </div>
              )}

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
                          <SelectItem value="ADMIN" className="focus:bg-gray-700 focus:text-white">
                            Administrador
                          </SelectItem>
                          <SelectItem value="USER" className="focus:bg-gray-700 focus:text-white">
                            Empleado
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
                          <SelectItem value="ACTIVE" className="focus:bg-gray-700 focus:text-white">
                            Activo
                          </SelectItem>
                          <SelectItem value="INACTIVE" className="focus:bg-gray-700 focus:text-white">
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
              <DialogFooter className="flex justify-between items-center pt-2">
                <div className="flex items-center space-x-2">
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
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Esta acción eliminará permanentemente al usuario {user?.name} y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500/80 hover:bg-red-500 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
