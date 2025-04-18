import { MotorcycleForm } from "@/components/motorcycles/motorcycle-form"

export default function NewMotorcyclePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Nueva Motocicleta</h2>
      <MotorcycleForm />
    </div>
  )
}
