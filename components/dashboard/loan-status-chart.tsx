"use client"

import { useEffect, useState } from "react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useDashboardContext } from "./dashboard-provider"
import { Skeleton } from "@/components/ui/skeleton"

const COLORS = {
  ACTIVE: "hsl(var(--primary))",
  COMPLETED: "hsl(var(--accent))",
  DEFAULTED: "hsl(var(--destructive))",
  PENDING: "hsl(var(--muted-foreground))",
}

export function LoanStatusChart() {
  const [isMounted, setIsMounted] = useState(false)
  const { data, loading } = useDashboardContext()
  const statusData = data?.loanStatusDistribution || []

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <div className="space-y-3 w-full max-w-[200px]">
          <Skeleton className="h-[200px] w-[200px] rounded-full mx-auto" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    )
  }

  if (loading || statusData.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <div className="space-y-3 w-full max-w-[200px]">
          <Skeleton className="h-[200px] w-[200px] rounded-full mx-auto" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={statusData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {statusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS] || COLORS.PENDING} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value} arrendamientos`, ""]} contentStyle={{ borderRadius: "8px" }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}