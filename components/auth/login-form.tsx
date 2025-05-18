"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, User, Lock, ArrowRight } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { AuthService } from "@/lib/services/auth.service"
import { useNavigationStore } from "@/lib/nav"
import { motion } from "framer-motion"

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
  const [formSubmitted, setFormSubmitted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { login } = useAuth()
  const { setNavigatingFromLogin } = useNavigationStore()

  // Check for expired session parameter
  useEffect(() => {
    const expired = searchParams.get("expired")
    if (expired === "true" && !formSubmitted) {
      toast({
        variant: "destructive",
        title: "Sesión expirada",
        description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
      })
    }
  }, [searchParams, toast, formSubmitted])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    setFormSubmitted(true)

    try {
      const user = await AuthService.login({
        username: values.username,
        password: values.password,
        rememberMe: values.rememberMe,
      })

      login(user)
      setNavigatingFromLogin(true)

      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión correctamente.",
        className: "bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none",
      })

      // Use router.push instead of window.location to prevent full page reload
      router.push("/dashboard")
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid gap-6"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-300">Usuario</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                    <Input
                      placeholder="Ingresa tu Usuario"
                      {...field}
                      className="border-gray-800 bg-black/30 pl-10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
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
                  <FormLabel className="text-sm font-medium text-gray-300">Contraseña</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-gray-400 transition-colors hover:text-purple-400"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="border-gray-800 bg-black/30 pl-10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-800 bg-black/30 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-gray-700 data-[state=checked]:border-purple-500 data-[state=checked]:bg-purple-500"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium text-gray-300">Recordarme</FormLabel>
                  <FormDescription className="text-xs text-gray-500">
                    Mantén la sesión iniciada en este dispositivo
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="group relative w-full overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white transition-all duration-300 hover:from-purple-700 hover:to-blue-700 hover:shadow-lg hover:shadow-purple-500/20"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              <>
                Iniciar sesión
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
            <span className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-600/0 via-white/10 to-purple-600/0 opacity-0 transition-opacity duration-500 group-hover:animate-shimmer group-hover:opacity-100"></span>
          </Button>
        </form>
      </Form>
    </motion.div>
  )
}
