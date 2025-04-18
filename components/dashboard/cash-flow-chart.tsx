"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Ene",
    ingresos: 25000000,
    egresos: 18000000,
  },
  {
    name: "Feb",
    ingresos: 28000000,
    egresos: 19500000,
  },
  {
    name: "Mar",
    ingresos: 32000000,
    egresos: 22000000,
  },
  {
    name: "Abr",
    ingresos: 30000000,
    egresos: 21000000,
  },
  {
    name: "May",
    ingresos: 35000000,
    egresos: 23500000,
  },
  {
    name: "Jun",
    ingresos: 38000000,
    egresos: 25000000,
  },
]

export function CashFlowChart() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value)
  }

  if (!isMounted) {
    return <div className="h-[300px] flex items-center justify-center">Cargando gráfico...</div>
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value / 1000000}M`}
          />
          <Tooltip formatter={(value: number) => [formatCurrency(value), ""]} contentStyle={{ borderRadius: "8px" }} />
          <Legend />
          <Area
            type="monotone"
            dataKey="ingresos"
            name="Ingresos"
            stroke="hsl(var(--primary))"
            fillOpacity={1}
            fill="url(#colorIngresos)"
          />
          <Area
            type="monotone"
            dataKey="egresos"
            name="Egresos"
            stroke="hsl(var(--destructive))"
            fillOpacity={1}
            fill="url(#colorEgresos)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
