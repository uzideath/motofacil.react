import ReportsDashboard from "@/components/reports/reports-dashboard"
import { MobileSidebar } from "@/components/mobile-sidebar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reportes | Sistema de Gestión de arrendamientos",
  description: "Visualiza y exporta reportes detallados sobre arrendamientos, pagos, clientes y motocicletas.",
}

export default function ReportsPage() {
  return (
    <div className="flex-1 w-full h-screen overflow-hidden flex flex-col">
      <div className="bg-primary text-primary-foreground p-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reportes</h1>
            <p className="text-primary-foreground/80 text-sm">Visualiza y exporta reportes detallados</p>
          </div>
          <div className="flex items-center space-x-2">
            <MobileSidebar />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <ReportsDashboard />
      </div>
    </div>
  )
}
