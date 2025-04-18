import { LoanForm } from "@/components/loans/loan-form"

export default function NewLoanPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Nuevo Préstamo</h2>
      <LoanForm />
    </div>
  )
}
