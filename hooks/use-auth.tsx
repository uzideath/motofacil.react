"use client"

import { AuthService, decodeJWT } from "@/lib/services/auth.service"
import { usePathname } from "next/navigation"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Role = "ADMIN" | "USER"

export type User = {
  id: string
  name: string
  username: string
  roles: Role[]
  exp?: number
}

type AuthContextType = {
  user: User | null
  login: (user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  // Inicializa sesión desde cookie o hace refresh
  useEffect(() => {
    const publicPaths = ["/login", "/forgot-password"]
    const isPublicPath = publicPaths.some((path) => pathname === path)

    const token = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("authToken="))
      ?.split("=")[1]

    const decoded = token ? decodeJWT(token) : null

    if (decoded) {
      setUser({ ...decoded, exp: decoded.exp })
      setIsLoading(false)
    } else if (!isPublicPath) {
      // Solo intenta refresh si NO estamos en una ruta pública
      AuthService.refresh().then((refreshedUser) => {
        if (refreshedUser) {
          setUser({ ...refreshedUser, exp: refreshedUser.exp })
        }
        setIsLoading(false)
      })
    } else {
      // En rutas públicas, simplemente marca como no cargando
      setIsLoading(false)
    }
  }, [pathname])

  // ⏱️ Maneja expiración y refresh programado
  useEffect(() => {
    if (!user?.exp) return

    const now = Math.floor(Date.now() / 1000)
    const timeUntilExpiration = user.exp - now
    const timeUntilRefresh = Math.max(timeUntilExpiration - 60, 0)

    const refreshTimeout = setTimeout(async () => {
      const refreshedUser = await AuthService.refresh()
      if (refreshedUser) {
        setUser({ ...refreshedUser, exp: refreshedUser.exp })
      } else {
        logout()
      }
    }, timeUntilRefresh * 1000)

    const forceLogoutTimeout = setTimeout(() => {
      logout()
    }, timeUntilExpiration * 1000)

    return () => {
      clearTimeout(refreshTimeout)
      clearTimeout(forceLogoutTimeout)
    }
  }, [user])

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
    AuthService.logout()
    window.location.href = "/login"
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
