"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Bike, CreditCard, Receipt, TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDashboardContext } from "./dashboard-provider"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardStats() {
  const { data, loading } = useDashboardContext()
  const stats = data?.stats || {
    totalUsers: 0,
    totalVehicles: 0,
    totalLoans: 0,
    totalInstallments: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    growthRate: 0,
    defaultRate: 0,
  }

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
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-200/80">Total Usuarios</p>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-16 mt-1 bg-blue-200/20" />
                  <Skeleton className="h-3 w-32 mt-1 bg-blue-200/10" />
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mt-1 text-white">{stats.totalUsers}</h3>
                  <p className="text-xs text-blue-200/60 mt-1">Clientes registrados</p>
                </>
              )}
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
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-200/80">Total Vehículos</p>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-16 mt-1 bg-blue-200/20" />
                  <Skeleton className="h-3 w-24 mt-1 bg-blue-200/10" />
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mt-1 text-white">{stats.totalVehicles}</h3>
                  <p className="text-xs text-blue-200/60 mt-1">En inventario</p>
                </>
              )}
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
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-200/80">arrendamientos Activos</p>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-16 mt-1 bg-blue-200/20" />
                  <Skeleton className="h-3 w-32 mt-1 bg-blue-200/10" />
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mt-1 text-white">{stats.totalLoans}</h3>
                  <p className="text-xs text-blue-200/60 mt-1">arrendamientos en curso</p>
                </>
              )}
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
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-200/80">Cuotas Pagadas</p>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-16 mt-1 bg-blue-200/20" />
                  <Skeleton className="h-3 w-36 mt-1 bg-blue-200/10" />
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mt-1 text-white">{stats.totalInstallments}</h3>
                  <p className="text-xs text-blue-200/60 mt-1">Total pagos registrados</p>
                </>
              )}
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
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-200/80">Ingresos Totales</p>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-24 mt-1 bg-blue-200/20" />
                  <Skeleton className="h-3 w-32 mt-1 bg-blue-200/10" />
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mt-1 text-white">{formatCurrency(stats.totalRevenue)}</h3>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                    <p className="text-xs text-green-400">+{stats.growthRate}% vs mes anterior</p>
                  </div>
                </>
              )}
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
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-200/80">Pagos Pendientes</p>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-24 mt-1 bg-blue-200/20" />
                  <Skeleton className="h-3 w-32 mt-1 bg-blue-200/10" />
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mt-1 text-white">{formatCurrency(stats.pendingPayments)}</h3>
                  <p className="text-xs text-blue-200/60 mt-1">Deuda total pendiente</p>
                </>
              )}
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
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-200/80">Tasa de Crecimiento</p>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-20 mt-1 bg-blue-200/20" />
                  <Skeleton className="h-3 w-40 mt-1 bg-blue-200/10" />
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mt-1 text-white">{stats.growthRate}%</h3>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                    <p className="text-xs text-green-400">vs mes anterior</p>
                  </div>
                </>
              )}
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
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-200/80">Tasa de Incumplimiento</p>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-16 mt-1 bg-blue-200/20" />
                  <Skeleton className="h-3 w-32 mt-1 bg-blue-200/10" />
                </>
              ) : (
                <>
                  <h3 className={cn("text-2xl font-bold mt-1", stats.defaultRate > 5 ? "text-red-400" : "text-green-400")}>
                    {stats.defaultRate}%
                  </h3>
                  <p className="text-xs text-blue-200/60 mt-1">arrendamientos incumplidos</p>
                </>
              )}
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
