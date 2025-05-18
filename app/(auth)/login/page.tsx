import type { Metadata } from "next"
import { ModeToggle } from "@/components/mode-toggle"
import { LoginForm } from "@/components/auth/login-form"
import { Particles } from "@/components/ui/particles"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Login | MotoFácil Atlántico",
  description: "Iniciar sesión en el sistema de arrendamientos de motocicletas",
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Animated background particles */}
      <Particles className="absolute inset-0 z-0" quantity={100} color="#ffffff" speed={0.5} />

      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-700/20 blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-700/20 blur-3xl"></div>

      {/* Abstract pattern overlay */}
      <div className="absolute inset-0 bg-[url('/abstract-geometric-shapes.png')] bg-cover bg-center opacity-5"></div>

      {/* Animated gradient ring */}
      <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent"></div>

      {/* Theme toggle */}
      <div className="absolute right-4 top-4 z-50">
        <ModeToggle />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and branding */}
          <div className="mb-8 flex flex-col items-center">
            <div className="group mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 p-0.5 shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-black/80 backdrop-blur-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="url(#logo-gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-white"
                >
                  <defs>
                    <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </div>
            </div>
            <h1 className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-3xl font-bold tracking-tighter text-transparent">
              MotoFácil Atlántico
            </h1>
            <p className="mt-2 text-center text-sm text-gray-400">Sistema de gestión de arrendamientos</p>
          </div>

          {/* Login card */}
          <div className="overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)]">
            {/* Card header with decorative gradient */}
            <div className="h-2 w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600"></div>

            <div className="relative bg-black/40 backdrop-blur-xl">
              {/* Decorative circles */}
              <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-purple-500/10"></div>
              <div className="absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-blue-500/10"></div>

              {/* Card content */}
              <div className="relative z-10 p-8">
                <div className="mb-6 flex flex-col space-y-2 text-center">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">Bienvenido de nuevo</h2>
                  <p className="text-sm text-gray-400">Ingresa tus credenciales para acceder al sistema</p>
                </div>

                <Suspense fallback={<div>Cargando formulario...</div>}>
                  <LoginForm />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} MotoFácil Atlántico. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
