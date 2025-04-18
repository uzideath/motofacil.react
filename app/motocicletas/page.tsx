import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { MotorcycleTable } from "@/components/motorcycles/motorcycle-table"
import { MotorcycleForm } from "@/components/motorcycles/motorcycle-form"
import { MobileSidebar } from "@/components/mobile-sidebar"

export default function MotorcyclesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Motocicletas</h2>
        <div className="flex items-center space-x-2">
          <MotorcycleForm>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline-block">Nueva Motocicleta</span>
              <span className="sm:hidden">Nueva</span>
            </Button>
          </MotorcycleForm>
          <MobileSidebar />
        </div>
      </div>
      <MotorcycleTable />
    </div>
  )
}
