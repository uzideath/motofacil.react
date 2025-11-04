"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Store,
  Users,
  Car,
  FileText,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  MapPin,
  MessageSquare,
  Building2,
  ArrowUpRight,
  Activity,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { HttpService } from "@/lib/http"

interface StoreStats {
  totalVehicles: number
  totalLoans: number
  totalEmployees: number
  totalProviders: number
  activeLoans: number
  vehiclesInUse: number
  monthlyRevenue: number
  pendingPayments: number
}

interface StoreData {
  id: string
  name: string
  code: string
  city: string
  status: string
  whatsappEnabled: boolean
  whatsappConfigured: boolean
  stats: StoreStats
}

interface AdminDashboardData {
  overview: {
    totalStores: number
    activeStores: number
    totalVehicles: number
    totalLoans: number
    totalEmployees: number
    totalProviders: number
    activeLoans: number
    totalRevenue: number
  }
  stores: StoreData[]
}

export function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await HttpService.get<AdminDashboardData>("/api/v1/stores/admin/dashboard")
      setData(response.data)
    } catch (error: any) {
      console.error("Error fetching admin dashboard:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-4">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No se pudieron cargar los datos</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tiendas</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalStores}</div>
            <p className="text-xs text-muted-foreground">
              {data.overview.activeStores} activas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehículos Total</CardTitle>
            <Car className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">En todas las tiendas</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arrendamientos Activos</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.activeLoans}</div>
            <p className="text-xs text-muted-foreground">
              De {data.overview.totalLoans} totales
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.overview.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Acumulado histórico</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados</CardTitle>
            <Users className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Personal activo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proveedores</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalProviders}</div>
            <p className="text-xs text-muted-foreground">Registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Tienda</CardTitle>
            <Activity className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.totalStores > 0
                ? Math.round(data.overview.totalVehicles / data.overview.totalStores)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Vehículos por tienda</p>
          </CardContent>
        </Card>
      </div>

      {/* Stores List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tiendas</CardTitle>
              <CardDescription>
                Vista detallada de cada tienda y sus métricas
              </CardDescription>
            </div>
            <Button onClick={() => router.push("/admin/stores")}>
              Ver Gestión
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.stores.map((store) => (
              <Card
                key={store.id}
                className={`hover:shadow-lg transition-all cursor-pointer ${
                  store.status !== "ACTIVE" ? "opacity-60" : ""
                }`}
                onClick={() => router.push(`/admin/stores/${store.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        {store.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {store.city}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant={store.status === "ACTIVE" ? "default" : "secondary"}
                        className={
                          store.status === "ACTIVE"
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                        }
                      >
                        {store.status === "ACTIVE" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {store.status === "ACTIVE" ? "Activa" : "Inactiva"}
                      </Badge>
                      {store.whatsappEnabled && (
                        <Badge
                          variant="outline"
                          className={
                            store.whatsappConfigured
                              ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                              : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                          }
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          WhatsApp
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="w-fit text-xs">
                    {store.code}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-purple-500" />
                      <span className="text-muted-foreground">Vehículos:</span>
                      <span className="font-semibold">{store.stats.totalVehicles}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-muted-foreground">En uso:</span>
                      <span className="font-semibold">{store.stats.vehiclesInUse}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-500" />
                      <span className="text-muted-foreground">Arriendos:</span>
                      <span className="font-semibold">{store.stats.activeLoans}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-cyan-500" />
                      <span className="text-muted-foreground">Empleados:</span>
                      <span className="font-semibold">{store.stats.totalEmployees}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Ingresos mes:
                      </span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(store.stats.monthlyRevenue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        Pendiente:
                      </span>
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(store.stats.pendingPayments)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
