import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { UserTable } from "@/components/users/user-table"
import { UserForm } from "@/components/users/user-form"
import { MobileSidebar } from "@/components/mobile-sidebar"

export default function UsersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Usuarios</h2>
        <div className="flex items-center space-x-2">
          <MobileSidebar />
        </div>
      </div>
      <UserTable />
    </div>
  )
}
