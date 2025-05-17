"use client"

import { AuthService, decodeJWT } from "@/lib/services/auth.service"
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"

export type Role = "ADMIN" | "USER"

export type User = {
  id: string
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

  useEffect(() => {
    const token = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("authToken="))
      ?.split("=")[1]

    const decoded = token ? decodeJWT(token) : null

    if (decoded) {
      setUser({ ...decoded, exp: decoded.exp })
      setIsLoading(false)
    } else {
      AuthService.refresh().then((refreshedUser) => {
        if (refreshedUser) {
          setUser({ ...refreshedUser, exp: refreshedUser.exp })
        }
        setIsLoading(false)
      })
    }
  }, [])

  // ⏱️ Manejo de expiración y refresh automático
  useEffect(() => {
    if (!user?.exp) return

    const now = Math.floor(Date.now() / 1000)
    const timeUntilExpiration = user.exp - now
    const timeUntilRefresh = Math.max(timeUntilExpiration - 60, 0) // 1 minuto antes

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
