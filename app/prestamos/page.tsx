import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { LoanTable } from "@/components/loans/loan-table"
import { LoanForm } from "@/components/loans/loan-form"
import { MobileSidebar } from "@/components/mobile-sidebar"

export default function LoansPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Préstamos</h2>
        <div className="flex items-center space-x-2">
          <LoanForm>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline-block">Nuevo Préstamo</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          </LoanForm>
          <MobileSidebar />
        </div>
      </div>
      <LoanTable />
    </div>
  )
}
