import { InstallmentForm } from "@/components/installments/installment-form"

export default function NewInstallmentPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const loanId = searchParams.loanId as string | undefined

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Registrar Pago de Cuota</h2>
      <InstallmentForm loanId={loanId} />
    </div>
  )
}
