import ReportsDashboard from "@/components/reports/reports-dashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reportes | Sistema de Gestión de Préstamos",
  description: "Visualiza y exporta reportes detallados sobre préstamos, pagos, clientes y motocicletas.",
}

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
      </div>
      <ReportsDashboard />
    </div>
  )
}
