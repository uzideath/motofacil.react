import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/dashboard/overview"
import { RecentLoans } from "@/components/dashboard/recent-loans"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { Button } from "@/components/ui/button"
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart"
import { LoanStatusChart } from "@/components/dashboard/loan-status-chart"
import { PaymentCalendar } from "@/components/dashboard/payment-calendar"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { AlertCircle, ArrowUpRight, Bell, Download, Filter } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  return (
    <div className="flex-1 w-full">
      <div className="gradient-bg text-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-white/80 mt-1">Bienvenido de nuevo, Admin</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Download className="mr-2 h-4 w-4" />
              Exportar Datos
            </Button>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>
            <MobileSidebar />
          </div>
        </div>
      </div>

      <div className="p-6">
        <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500">Atención</AlertTitle>
          <AlertDescription>
            Hay 5 préstamos con pagos pendientes esta semana.{" "}
            <a href="#" className="font-medium underline">
              Ver detalles
            </a>
          </AlertDescription>
        </Alert>

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Card className="col-span-1 lg:col-span-2 card-hover-effect">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Flujo de Caja</CardTitle>
                <CardDescription>Ingresos y egresos de los últimos 6 meses</CardDescription>
              </div>
              <Badge variant="outline" className="flex items-center">
                <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">+12.5%</span>
              </Badge>
            </CardHeader>
            <CardContent>
              <CashFlowChart />
            </CardContent>
          </Card>

          <Card className="card-hover-effect">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Operaciones frecuentes</CardDescription>
            </CardHeader>
            <CardContent>
              <QuickActions />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Card className="card-hover-effect">
            <CardHeader>
              <CardTitle>Estado de Préstamos</CardTitle>
              <CardDescription>Distribución actual</CardDescription>
            </CardHeader>
            <CardContent>
              <LoanStatusChart />
            </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-2 card-hover-effect">
            <CardHeader>
              <CardTitle>Calendario de Pagos</CardTitle>
              <CardDescription>Próximos 7 días</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentCalendar />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview">Resumen General</TabsTrigger>
            <TabsTrigger value="recent">Préstamos Recientes</TabsTrigger>
            <TabsTrigger value="analytics">Análisis Detallado</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="card-hover-effect">
              <CardHeader>
                <CardTitle>Resumen de Préstamos</CardTitle>
                <CardDescription>Préstamos activos en los últimos 30 días</CardDescription>
              </CardHeader>
              <CardContent>
                <Overview />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <Card className="card-hover-effect">
              <CardHeader>
                <CardTitle>Préstamos Recientes</CardTitle>
                <CardDescription>Últimos préstamos realizados</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentLoans />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="card-hover-effect">
              <CardHeader>
                <CardTitle>Análisis Detallado</CardTitle>
                <CardDescription>Estadísticas detalladas de préstamos y pagos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Análisis detallado en desarrollo</p>
                  <Button variant="outline" className="mt-4">
                    Solicitar Acceso Anticipado
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
