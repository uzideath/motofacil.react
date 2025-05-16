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
      setUser(decoded)
      setIsLoading(false)
    } else {
      AuthService.refresh().then((refreshedUser) => {
        if (refreshedUser) {
          setUser(refreshedUser)
        }
        setIsLoading(false)
      })
    }
  }, [])

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
