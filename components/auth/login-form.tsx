"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { loginRequest } from "@/lib/services/auth"
import { roleMap } from "@/lib/types"

const formSchema = z.object({
  username: z.string().min(3, {
    message: "El nombre de usuario debe tener al menos 3 caracteres.",
  }),
  password: z.string().min(3, {
    message: "La contraseña debe tener al menos 3 caracteres.",
  }),
  rememberMe: z.boolean().default(false),
})

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const data = await loginRequest({
        username: values.username,
        password: values.password,
      })

      document.cookie = `authToken=${data.access_token}; path=/; max-age=${values.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24
        }`

      const validRoles = data.user.roles
        .map((r: string) => roleMap[r.toUpperCase()])
        .filter(Boolean) as ("admin" | "manager" | "user")[]

      const rolePriority: ("admin" | "manager" | "user")[] = ["admin", "manager", "user"]
      const primaryRole = rolePriority.find((r) => validRoles.includes(r)) ?? "user"

      const user = {
        id: data.user.id,
        username: data.user.username,
        role: primaryRole,
      }

      login(user)

      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión correctamente.",
      })

      window.location.href = "/"
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: "Credenciales incorrectas. Por favor, inténtalo de nuevo.",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Usuario</FormLabel>
                <FormControl>
                  <Input placeholder="Ingresa tu Usuario" {...field} className="glass-input" />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-gray-300">Contraseña</FormLabel>
                  <Link href="/forgot-password" className="text-xs text-gray-400 hover:text-primary transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} className="glass-input" />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-dark-blue-700 bg-dark-blue-800/30 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-dark-blue-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-gray-300">Recordarme</FormLabel>
                  <FormDescription className="text-gray-500">
                    Mantén la sesión iniciada en este dispositivo
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
