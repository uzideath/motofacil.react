"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

interface ReportChartsProps {
  data: any
  activeTab: string
}

export function ReportCharts({ data, activeTab }: ReportChartsProps) {
  // Colores para los gráficos
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Datos para los gráficos según la pestaña activa
  const getChartData = () => {
    switch (activeTab) {
      case "prestamos":
        return {
          title: "Análisis de arrendamientos",
          description: "Distribución y tendencias de arrendamientos",
          pieData: [
            { name: "Activos", value: data.loans.active },
            { name: "Completados", value: data.loans.completed },
            { name: "En Mora", value: data.loans.defaulted },
          ],
          barData: [
            { name: "Ene", value: 12500000 },
            { name: "Feb", value: 18900000 },
            { name: "Mar", value: 15600000 },
            { name: "Abr", value: 22300000 },
            { name: "May", value: 19800000 },
            { name: "Jun", value: 25400000 },
          ],
          lineData: [
            { name: "Ene", value: 8 },
            { name: "Feb", value: 12 },
            { name: "Mar", value: 10 },
            { name: "Abr", value: 15 },
            { name: "May", value: 13 },
            { name: "Jun", value: 18 },
          ],
        }
      case "pagos":
        return {
          title: "Análisis de Pagos",
          description: "Distribución y tendencias de pagos",
          pieData: [
            { name: "A Tiempo", value: data.payments.onTime },
            { name: "Tardíos", value: data.payments.late },
          ],
          barData: [
            { name: "Ene", value: 8500000 },
            { name: "Feb", value: 12300000 },
            { name: "Mar", value: 9800000 },
            { name: "Abr", value: 14500000 },
            { name: "May", value: 11200000 },
            { name: "Jun", value: 16800000 },
          ],
          lineData: [
            { name: "Ene", value: 25 },
            { name: "Feb", value: 32 },
            { name: "Mar", value: 28 },
            { name: "Abr", value: 35 },
            { name: "May", value: 30 },
            { name: "Jun", value: 38 },
          ],
        }
      case "clientes":
        return {
          title: "Análisis de Clientes",
          description: "Distribución y tendencias de clientes",
          pieData: [
            { name: "Activos", value: data.clients.active },
            { name: "Inactivos", value: data.clients.inactive },
          ],
          barData: [
            { name: "Ene", value: 3 },
            { name: "Feb", value: 5 },
            { name: "Mar", value: 2 },
            { name: "Abr", value: 4 },
            { name: "May", value: 6 },
            { name: "Jun", value: 4 },
          ],
          lineData: [
            { name: "Ene", value: 12 },
            { name: "Feb", value: 15 },
            { name: "Mar", value: 14 },
            { name: "Abr", value: 18 },
            { name: "May", value: 20 },
            { name: "Jun", value: 22 },
          ],
        }
      case "motocicletas":
        return {
          title: "Análisis de Motocicletas",
          description: "Distribución y tendencias de motocicletas",
          pieData: [
            { name: "Financiadas", value: data.motorcycles.financed },
            { name: "Disponibles", value: data.motorcycles.available },
          ],
          barData: [
            { name: "Honda", value: 8 },
            { name: "Yamaha", value: 6 },
            { name: "Suzuki", value: 5 },
            { name: "Bajaj", value: 7 },
            { name: "KTM", value: 3 },
            { name: "Kawasaki", value: 1 },
          ],
          lineData: [
            { name: "Ene", value: 2 },
            { name: "Feb", value: 4 },
            { name: "Mar", value: 3 },
            { name: "Abr", value: 5 },
            { name: "May", value: 7 },
            { name: "Jun", value: 6 },
          ],
        }
      default:
        return {
          title: "Análisis General",
          description: "Distribución y tendencias generales",
          pieData: [],
          barData: [],
          lineData: [],
        }
    }
  }

  const chartData = getChartData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{chartData.title}</CardTitle>
        <CardDescription>{chartData.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="distribucion">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="distribucion">Distribución</TabsTrigger>
            <TabsTrigger value="tendencia">Tendencia</TabsTrigger>
            <TabsTrigger value="comparativa">Comparativa</TabsTrigger>
          </TabsList>

          <TabsContent value="distribucion" className="p-4">
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}`, "Cantidad"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="tendencia" className="p-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.lineData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      `${value}`,
                      activeTab === "pagos"
                        ? "Pagos"
                        : activeTab === "prestamos"
                          ? "arrendamientos"
                          : activeTab === "clientes"
                            ? "Clientes"
                            : "Motocicletas",
                    ]}
                  />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="comparativa" className="p-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.barData}>
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) =>
                      activeTab === "prestamos" || activeTab === "pagos"
                        ? `${(value / 1000000).toFixed(0)}M`
                        : `${value}`
                    }
                  />
                  <Tooltip
                    formatter={(value) => [
                      activeTab === "prestamos" || activeTab === "pagos"
                        ? formatCurrency(Number(value)) // <-- Aquí se fuerza a número
                        : value,
                      activeTab === "pagos"
                        ? "Monto Recaudado"
                        : activeTab === "prestamos"
                          ? "Monto Financiado"
                          : activeTab === "clientes"
                            ? "Nuevos Clientes"
                            : "Cantidad",
                    ]}
                  />

                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
