"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { DownloadIcon, FileTextIcon, PieChartIcon, BarChart3Icon, TrendingUpIcon } from "lucide-react"
import { LoanReportTable } from "./loan-report-table"
import { PaymentReportTable } from "./payment-report-table"
import { ClientReportTable } from "./client-report-table"
import { MotorcycleReportTable } from "./motorcycle-report-table"
import { ReportSummary } from "./report-summary"
import { ReportCharts } from "./report-charts"

export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState("prestamos")
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState("all")

  // Simular carga de datos
  useEffect(() => {
    setLoading(true)

    // Simulación de carga de datos
    const timer = setTimeout(() => {
      // Datos de ejemplo para los reportes
      const data = {
        loans: {
          total: 24,
          active: 18,
          completed: 6,
          defaulted: 2,
          totalAmount: 245000000,
          totalInterest: 32450000,
          items: generateLoansData(),
        },
        payments: {
          total: 156,
          onTime: 142,
          late: 14,
          totalCollected: 98500000,
          pendingCollection: 146500000,
          items: generatePaymentsData(),
        },
        clients: {
          total: 20,
          active: 15,
          inactive: 5,
          withDefaultedLoans: 2,
          items: generateClientsData(),
        },
        motorcycles: {
          total: 30,
          financed: 24,
          available: 6,
          totalValue: 360000000,
          items: generateMotorcyclesData(),
        },
      }

      setReportData(data)
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Función para exportar reportes
  const handleExport = (format: string) => {
    console.log(`Exportando reporte de ${activeTab} en formato ${format}`)
    // Aquí iría la lógica real para exportar los datos
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Filtros de Reporte</CardTitle>
            <CardDescription>Selecciona los filtros para generar el reporte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date-range">Rango de Fechas</Label>
              <DatePickerWithRange className="w-full" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                  <SelectItem value="defaulted">En mora</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <Input id="search" placeholder="Nombre, ID, etc." />
            </div>

            <div className="pt-4 space-y-2">
              <Label>Exportar Como</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleExport("excel")}
                >
                  <FileTextIcon className="h-4 w-4" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleExport("pdf")}
                >
                  <DownloadIcon className="h-4 w-4" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleExport("csv")}
                >
                  <FileTextIcon className="h-4 w-4" />
                  CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : reportData ? (
          <ReportSummary data={reportData} activeTab={activeTab} />
        ) : null}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="prestamos" className="flex items-center gap-2">
            <BarChart3Icon className="h-4 w-4" />
            <span className="hidden sm:inline">Préstamos</span>
          </TabsTrigger>
          <TabsTrigger value="pagos" className="flex items-center gap-2">
            <TrendingUpIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Pagos</span>
          </TabsTrigger>
          <TabsTrigger value="clientes" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Clientes</span>
          </TabsTrigger>
          <TabsTrigger value="motocicletas" className="flex items-center gap-2">
            <BarChart3Icon className="h-4 w-4" />
            <span className="hidden sm:inline">Motocicletas</span>
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TabsContent value="prestamos" className="mt-0">
              {loading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[400px] w-full" />
                  </CardContent>
                </Card>
              ) : (
                <LoanReportTable data={reportData?.loans.items || []} />
              )}
            </TabsContent>

            <TabsContent value="pagos" className="mt-0">
              {loading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[400px] w-full" />
                  </CardContent>
                </Card>
              ) : (
                <PaymentReportTable data={reportData?.payments.items || []} />
              )}
            </TabsContent>

            <TabsContent value="clientes" className="mt-0">
              {loading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[400px] w-full" />
                  </CardContent>
                </Card>
              ) : (
                <ClientReportTable data={reportData?.clients.items || []} />
              )}
            </TabsContent>

            <TabsContent value="motocicletas" className="mt-0">
              {loading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[400px] w-full" />
                  </CardContent>
                </Card>
              ) : (
                <MotorcycleReportTable data={reportData?.motorcycles.items || []} />
              )}
            </TabsContent>
          </div>

          <div>
            {loading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            ) : (
              <ReportCharts data={reportData} activeTab={activeTab} />
            )}
          </div>
        </div>
      </Tabs>
    </div>
  )
}

// Funciones para generar datos de ejemplo
function generateLoansData() {
  const statuses = ["ACTIVE", "COMPLETED", "DEFAULTED"]
  const loanTypes = ["FIXED", "COMPOUND"]
  const frequencies = ["MONTHLY", "BIWEEKLY", "WEEKLY"]

  return Array.from({ length: 20 }, (_, i) => ({
    id: `LOAN-${1000 + i}`,
    clientName: `Cliente ${i + 1}`,
    motorcycle: `Moto ${i + 1}`,
    amount: Math.floor(Math.random() * 15000000) + 5000000,
    interestRate: Math.floor(Math.random() * 15) + 5,
    interestType: loanTypes[Math.floor(Math.random() * loanTypes.length)],
    paymentFrequency: frequencies[Math.floor(Math.random() * frequencies.length)],
    installments: Math.floor(Math.random() * 24) + 6,
    paidInstallments: Math.floor(Math.random() * 12),
    startDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    progress: Math.floor(Math.random() * 100),
  }))
}

function generatePaymentsData() {
  const statuses = ["PAID", "PENDING", "LATE"]

  return Array.from({ length: 30 }, (_, i) => ({
    id: `PAY-${2000 + i}`,
    loanId: `LOAN-${1000 + Math.floor(Math.random() * 20)}`,
    clientName: `Cliente ${Math.floor(Math.random() * 20) + 1}`,
    amount: Math.floor(Math.random() * 1000000) + 200000,
    dueDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    paymentDate:
      Math.random() > 0.2 ? new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1) : null,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    installmentNumber: Math.floor(Math.random() * 12) + 1,
  }))
}

function generateClientsData() {
  const statuses = ["ACTIVE", "INACTIVE"]

  return Array.from({ length: 15 }, (_, i) => ({
    id: `CLI-${3000 + i}`,
    name: `Cliente ${i + 1}`,
    document: `1${Math.floor(Math.random() * 100000000)}`,
    phone: `3${Math.floor(Math.random() * 100000000)}`,
    email: `cliente${i + 1}@example.com`,
    address: `Dirección ${i + 1}`,
    activeLoans: Math.floor(Math.random() * 3),
    totalLoans: Math.floor(Math.random() * 5) + 1,
    totalAmount: Math.floor(Math.random() * 30000000) + 5000000,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    joinDate: new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
  }))
}

function generateMotorcyclesData() {
  const statuses = ["AVAILABLE", "FINANCED", "SOLD"]
  const brands = ["Honda", "Yamaha", "Suzuki", "Bajaj", "KTM", "Kawasaki"]

  return Array.from({ length: 15 }, (_, i) => ({
    id: `MOTO-${4000 + i}`,
    brand: brands[Math.floor(Math.random() * brands.length)],
    model: `Modelo ${Math.floor(Math.random() * 10) + 2010}`,
    plate: `AB${Math.floor(Math.random() * 100)}CD`,
    color: ["Negro", "Rojo", "Azul", "Blanco"][Math.floor(Math.random() * 4)],
    year: Math.floor(Math.random() * 10) + 2010,
    price: Math.floor(Math.random() * 15000000) + 5000000,
    purchaseDate: new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    clientName: Math.random() > 0.3 ? `Cliente ${Math.floor(Math.random() * 15) + 1}` : null,
  }))
}
