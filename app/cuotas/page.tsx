import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { InstallmentTable } from "@/components/installments/installment-table"
import { InstallmentForm } from "@/components/installments/installment-form"
import { MobileSidebar } from "@/components/mobile-sidebar"

export default function InstallmentsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Cuotas</h2>
        <div className="flex items-center space-x-2">
          <InstallmentForm>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline-block">Nueva Cuota</span>
              <span className="sm:hidden">Nueva</span>
            </Button>
          </InstallmentForm>
          <MobileSidebar />
        </div>
      </div>
      <InstallmentTable />
    </div>
  )
}
