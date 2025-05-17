"use client"

import { useEffect, useState } from "react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "Activos", value: 56, color: "hsl(var(--primary))" },
  { name: "Completados", value: 32, color: "hsl(var(--accent))" },
  { name: "Incumplidos", value: 8, color: "hsl(var(--destructive))" },
  { name: "En Proceso", value: 12, color: "hsl(var(--muted-foreground))" },
]

export function LoanStatusChart() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="h-[250px] flex items-center justify-center">Cargando gráfico...</div>
  }

  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value} arrendamientos`, ""]} contentStyle={{ borderRadius: "8px" }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
