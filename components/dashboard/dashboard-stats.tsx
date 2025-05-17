"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Bike, CreditCard, Receipt, TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type StatsData = {
  totalUsers: number
  totalMotorcycles: number
  totalLoans: number
  totalInstallments: number
  totalRevenue: number
  pendingPayments: number
  growthRate: number
  defaultRate: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalMotorcycles: 0,
    totalLoans: 0,
    totalInstallments: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    growthRate: 0,
    defaultRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulación de carga de datos
    const timer = setTimeout(() => {
      setStats({
        totalUsers: 124,
        totalMotorcycles: 87,
        totalLoans: 56,
        totalInstallments: 342,
        totalRevenue: 125000000,
        pendingPayments: 15000000,
        growthRate: 12.5,
        defaultRate: 3.2,
      })
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value)
  }

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
      <Card className="col-span-2 glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-200/80">Total Usuarios</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{loading ? "..." : stats.totalUsers}</h3>
              <p className="text-xs text-blue-200/60 mt-1">Clientes registrados</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-400 animated-icon" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2 glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-200/80">Total Motocicletas</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{loading ? "..." : stats.totalMotorcycles}</h3>
              <p className="text-xs text-blue-200/60 mt-1">En inventario</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Bike className="h-6 w-6 text-indigo-400 animated-icon" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2 glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-200/80">arrendamientos Activos</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{loading ? "..." : stats.totalLoans}</h3>
              <p className="text-xs text-blue-200/60 mt-1">arrendamientos en curso</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-400 animated-icon" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2 glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-200/80">Cuotas Pagadas</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{loading ? "..." : stats.totalInstallments}</h3>
              <p className="text-xs text-blue-200/60 mt-1">Total pagos registrados</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-green-400 animated-icon" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2 glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-200/80">Ingresos Totales</p>
              <h3 className="text-2xl font-bold mt-1 text-white">
                {loading ? "..." : formatCurrency(stats.totalRevenue)}
              </h3>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                <p className="text-xs text-green-400">+8.2% vs mes anterior</p>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-400 animated-icon" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2 glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-200/80">Pagos Pendientes</p>
              <h3 className="text-2xl font-bold mt-1 text-white">
                {loading ? "..." : formatCurrency(stats.pendingPayments)}
              </h3>
              <div className="flex items-center mt-1">
                <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
                <p className="text-xs text-red-400">+2.4% vs mes anterior</p>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-amber-400 animated-icon" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2 glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-200/80">Tasa de Crecimiento</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{loading ? "..." : `${stats.growthRate}%`}</h3>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                <p className="text-xs text-green-400">+1.8% vs trimestre anterior</p>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-400 animated-icon" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2 glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-200/80">Tasa de Incumplimiento</p>
              <h3 className={cn("text-2xl font-bold mt-1", stats.defaultRate > 5 ? "text-red-400" : "text-amber-400")}>
                {loading ? "..." : `${stats.defaultRate}%`}
              </h3>
              <div className="flex items-center mt-1">
                <TrendingDown className="h-3 w-3 text-green-400 mr-1" />
                <p className="text-xs text-green-400">-0.5% vs mes anterior</p>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <Percent className="h-6 w-6 text-red-400 animated-icon" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
