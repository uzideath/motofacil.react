"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Role = "admin" | "user" | "manager"

export type User = {
  id: string
  username: string
  role: Role
}

type AuthContextType = {
  user: User | null
  login: (user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Función para decodificar un JWT (sin verificar la firma)
function decodeJWT(token: string): any | null {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("authToken="))
      ?.split("=")[1]

    if (token) {
      const decoded = decodeJWT(token)

      if (decoded && decoded.sub && decoded.username && Array.isArray(decoded.roles)) {
        // Mapear roles válidos
        const roleMap: Record<string, Role> = {
          ADMIN: "admin",
          MANAGER: "manager",
          USER: "user",
        }

        const validRoles = decoded.roles
          .map((r: string) => roleMap[r.toUpperCase()])
          .filter(Boolean) as Role[]

        const rolePriority: Role[] = ["admin", "manager", "user"]
        const primaryRole = rolePriority.find((r) => validRoles.includes(r)) ?? "user"

        setUser({
          id: decoded.sub,
          username: decoded.username,
          role: primaryRole,
        })
      }
    }

    setIsLoading(false)
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    // Ya no se usa localStorage
  }

  const logout = () => {
    setUser(null)
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
