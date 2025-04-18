import { LoanDetails } from "@/components/loans/loan-details"

export default function LoanDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Detalles del Préstamo</h2>
      <LoanDetails loanId={params.id} />
    </div>
  )
}
