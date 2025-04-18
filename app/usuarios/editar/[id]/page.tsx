import { UserForm } from "@/components/users/user-form"

export default function EditUserPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Editar Usuario</h2>
      <UserForm userId={params.id} />
    </div>
  )
}
