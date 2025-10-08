import { InstallmentTable } from "@/components/installments/installment-table"
import { MobileSidebar } from "@/components/mobile-sidebar"

export default function InstallmentsPage() {
  return (
    <div className="flex-1 w-full h-screen overflow-hidden flex flex-col">
      <div className="bg-primary text-primary-foreground p-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cuotas</h1>
            <p className="text-primary-foreground/80 text-sm">Gestión de cuotas de préstamos</p>
          </div>
          <div className="flex items-center space-x-2">
            <MobileSidebar />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <InstallmentTable />
      </div>
    </div>
  )
}
