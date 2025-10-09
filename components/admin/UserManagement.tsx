"use client"

import { useState } from "react"
import { Owner } from "@/lib/types"
import { useUsers, UserFilter } from "@/components/admin/hooks/useUsers"
import { UsersToolbar } from "@/components/admin/components/UsersToolbar"
import { UsersTable } from "@/components/admin/components/UsersTable"
import { DeleteUserDialog } from "@/components/admin/components/DeleteUserDialog"
import { PermissionsDialog } from "@/components/admin/components/PermissionsDialog"
import { useToast } from "@/components/ui/use-toast"
import { UserForm } from "./UserOwnerForm"

export function UserManagement({ filter = "all" }: { filter?: UserFilter }) {
  const {
    filteredUsers,
    loading,
    searchTerm,
    setSearchTerm,
    deleteUser,
    updateUserStatus,
    refreshUsers,
  } = useUsers(filter)

  const [selectedUser, setSelectedUser] = useState<Owner | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleEdit = (user: Owner) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const handleDelete = (user: Owner) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedUser) return

    try {
      await deleteUser(selectedUser.id)
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      // Error already handled in hook
    }
  }

  const handleStatusChange = async (
    userId: string,
    status: "ACTIVE" | "INACTIVE"
  ) => {
    try {
      await updateUserStatus(userId, status)
    } catch (error) {
      // Error already handled in hook
    }
  }

  const handleManagePermissions = (user: Owner) => {
    setSelectedUser(user)
    setIsPermissionsDialogOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedUser(null)
    setIsFormOpen(true)
  }

  const handleFormSave = (updatedUser: Owner) => {
    if (selectedUser) {
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado correctamente.",
      })
    } else {
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado correctamente.",
      })
    }
    setIsFormOpen(false)
    refreshUsers()
  }

  return (
    <div className="space-y-4">
      <UsersToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreateNew={handleCreateNew}
      />

      <UsersTable
        users={filteredUsers}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onManagePermissions={handleManagePermissions}
      />

      <DeleteUserDialog
        open={isDeleteDialogOpen}
        user={selectedUser}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />

      <UserForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        user={selectedUser}
        onSave={handleFormSave}
      />

      {selectedUser && (
        <PermissionsDialog
          open={isPermissionsDialogOpen}
          onOpenChange={setIsPermissionsDialogOpen}
          userId={selectedUser.id}
          userName={selectedUser.name}
          currentRole={selectedUser.role}
          onPermissionsUpdated={refreshUsers}
        />
      )}
    </div>
  )
}
