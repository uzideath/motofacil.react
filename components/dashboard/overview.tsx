"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
} from "recharts"
import { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

const monthlyData = [
  {
    name: "Ene",
    total: 1800000,
    pagos: 1500000,
  },
  {
    name: "Feb",
    total: 2200000,
    pagos: 1900000,
  },
  {
    name: "Mar",
    total: 2800000,
    pagos: 2500000,
  },
  {
    name: "Abr",
    total: 2400000,
    pagos: 2200000,
  },
  {
    name: "May",
    total: 2900000,
    pagos: 2700000,
  },
  {
    name: "Jun",
    total: 3300000,
    pagos: 3000000,
  },
  {
    name: "Jul",
    total: 3500000,
    pagos: 3200000,
  },
]

const weeklyData = [
  { name: "Lun", total: 450000, pagos: 400000 },
  { name: "Mar", total: 520000, pagos: 480000 },
  { name: "Mié", total: 480000, pagos: 450000 },
  { name: "Jue", total: 600000, pagos: 550000 },
  { name: "Vie", total: 750000, pagos: 700000 },
  { name: "Sáb", total: 350000, pagos: 320000 },
  { name: "Dom", total: 250000, pagos: 230000 },
]

export function Overview() {
  const [isMounted, setIsMounted] = useState(false)
  const [view, setView] = useState<"bar" | "line">("bar")
  const [timeframe, setTimeframe] = useState<"monthly" | "weekly">("monthly")

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (!isMounted) {
    return <div className="h-[350px] flex items-center justify-center">Cargando gráfico...</div>
  }

  const data = timeframe === "monthly" ? monthlyData : weeklyData

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <Tabs
          value={timeframe}
          onValueChange={(value) => setTimeframe(value as "monthly" | "weekly")}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full sm:w-[200px] grid-cols-2">
            <TabsTrigger value="monthly">Mensual</TabsTrigger>
            <TabsTrigger value="weekly">Semanal</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex space-x-2 self-end sm:self-auto">
          <Button
            size="sm"
            variant={view === "bar" ? "default" : "outline"}
            onClick={() => setView("bar")}
            className="h-9 px-3"
          >
            Barras
          </Button>
          <Button
            size="sm"
            variant={view === "line" ? "default" : "outline"}
            onClick={() => setView("line")}
            className="h-9 px-3"
          >
            Líneas
          </Button>
        </div>
      </div>

      <div className="w-full h-[350px] mt-4">
        {view === "bar" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value / 1000000}M`}
                width={50}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), "Total"]}
                labelFormatter={(label) => `${timeframe === "monthly" ? "Mes" : "Día"}: ${label}`}
                contentStyle={{ borderRadius: "8px" }}
                cursor={{ fill: "rgba(30, 50, 100, 0.1)" }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: "10px" }}
              />
              <Bar
                dataKey="total"
                name="arrendamientos"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                barSize={timeframe === "monthly" ? 20 : 12}
              />
              <Bar
                dataKey="pagos"
                name="Pagos Recibidos"
                fill="hsl(var(--accent))"
                radius={[4, 4, 0, 0]}
                barSize={timeframe === "monthly" ? 20 : 12}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value / 1000000}M`}
                width={50}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), "Total"]}
                labelFormatter={(label) => `${timeframe === "monthly" ? "Mes" : "Día"}: ${label}`}
                contentStyle={{ borderRadius: "8px" }}
                cursor={{ stroke: "rgba(30, 50, 100, 0.5)", strokeWidth: 1 }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: "10px" }}
              />
              <Line
                type="monotone"
                dataKey="total"
                name="arrendamientos"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="pagos"
                name="Pagos Recibidos"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
