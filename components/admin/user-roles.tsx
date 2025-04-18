"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Save } from "lucide-react"

type Role = {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

type Permission = {
  id: string
  name: string
  description: string
  module: string
}

export function UserRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [isNewRoleDialogOpen, setIsNewRoleDialogOpen] = useState(false)
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleDescription, setNewRoleDescription] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Simulación de carga de datos
    const timer = setTimeout(() => {
      const mockPermissions: Permission[] = [
        { id: "1", name: "users.view", description: "Ver usuarios", module: "Usuarios" },
        { id: "2", name: "users.create", description: "Crear usuarios", module: "Usuarios" },
        { id: "3", name: "users.edit", description: "Editar usuarios", module: "Usuarios" },
        { id: "4", name: "users.delete", description: "Eliminar usuarios", module: "Usuarios" },
        { id: "5", name: "loans.view", description: "Ver préstamos", module: "Préstamos" },
        { id: "6", name: "loans.create", description: "Crear préstamos", module: "Préstamos" },
        { id: "7", name: "loans.edit", description: "Editar préstamos", module: "Préstamos" },
        { id: "8", name: "loans.delete", description: "Eliminar préstamos", module: "Préstamos" },
        { id: "9", name: "reports.view", description: "Ver reportes", module: "Reportes" },
        { id: "10", name: "reports.export", description: "Exportar reportes", module: "Reportes" },
        { id: "11", name: "settings.view", description: "Ver configuración", module: "Configuración" },
        { id: "12", name: "settings.edit", description: "Editar configuración", module: "Configuración" },
      ]

      const mockRoles: Role[] = [
        {
          id: "1",
          name: "Administrador",
          description: "Acceso completo al sistema",
          permissions: mockPermissions,
        },
        {
          id: "2",
          name: "Gerente",
          description: "Gestión de préstamos y reportes",
          permissions: mockPermissions.filter(
            (p) => p.module === "Préstamos" || p.module === "Reportes" || p.name === "users.view",
          ),
        },
        {
          id: "3",
          name: "Usuario",
          description: "Acceso básico al sistema",
          permissions: mockPermissions.filter((p) => p.name.includes(".view") && p.module !== "Configuración"),
        },
      ]

      setPermissions(mockPermissions)
      setRoles(mockRoles)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleCreateRole = () => {
    if (!newRoleName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El nombre del rol es obligatorio.",
      })
      return
    }

    const newRole: Role = {
      id: `${roles.length + 1}`,
      name: newRoleName,
      description: newRoleDescription,
      permissions: permissions.filter((p) => selectedPermissions.includes(p.id)),
    }

    setRoles([...roles, newRole])

    toast({
      title: "Rol creado",
      description: `El rol ${newRoleName} ha sido creado correctamente.`,
    })

    // Resetear el formulario
    setNewRoleName("")
    setNewRoleDescription("")
    setSelectedPermissions([])
    setIsNewRoleDialogOpen(false)
  }

  const handleTogglePermission = (roleId: string, permissionId: string) => {
    setRoles(
      roles.map((role) => {
        if (role.id === roleId) {
          const hasPermission = role.permissions.some((p) => p.id === permissionId)

          if (hasPermission) {
            // Remover permiso
            return {
              ...role,
              permissions: role.permissions.filter((p) => p.id !== permissionId),
            }
          } else {
            // Añadir permiso
            const permissionToAdd = permissions.find((p) => p.id === permissionId)
            if (permissionToAdd) {
              return {
                ...role,
                permissions: [...role.permissions, permissionToAdd],
              }
            }
          }
        }
        return role
      }),
    )
  }

  const handleSaveChanges = () => {
    toast({
      title: "Cambios guardados",
      description: "Los cambios en los roles y permisos han sido guardados correctamente.",
    })
  }

  // Agrupar permisos por módulo
  const permissionsByModule = permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = []
      }
      acc[permission.module].push(permission)
      return acc
    },
    {} as Record<string, Permission[]>,
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Roles del Sistema</h3>
        <div className="flex space-x-2">
          <Button onClick={() => setIsNewRoleDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Rol
          </Button>
          <Button onClick={handleSaveChanges}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {roles.map((role) => (
            <div key={role.id} className="space-y-2">
              <div className="flex items-center space-x-2">
                <h4 className="text-md font-medium">{role.name}</h4>
                <Badge variant="outline">{role.permissions.length} permisos</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{role.description}</p>

              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Módulo</TableHead>
                      <TableHead>Permiso</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-center">Acceso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
                      <React.Fragment key={module}>
                        {modulePermissions.map((permission, index) => (
                          <TableRow key={permission.id}>
                            {index === 0 && (
                              <TableCell rowSpan={modulePermissions.length} className="align-middle">
                                <Badge>{module}</Badge>
                              </TableCell>
                            )}
                            <TableCell className="font-medium">{permission.name}</TableCell>
                            <TableCell>{permission.description}</TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={role.permissions.some((p) => p.id === permission.id)}
                                onCheckedChange={() => handleTogglePermission(role.id, permission.id)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Diálogo para crear nuevo rol */}
      <Dialog open={isNewRoleDialogOpen} onOpenChange={setIsNewRoleDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Rol</DialogTitle>
            <DialogDescription>Define un nuevo rol y asigna los permisos correspondientes.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Rol</Label>
              <Input
                id="name"
                placeholder="Ej: Supervisor"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                placeholder="Ej: Supervisa operaciones diarias"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Permisos</Label>
              <div className="border rounded-md p-4 space-y-4">
                {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
                  <div key={module} className="space-y-2">
                    <h4 className="font-medium">{module}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {modulePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPermissions([...selectedPermissions, permission.id])
                              } else {
                                setSelectedPermissions(selectedPermissions.filter((id) => id !== permission.id))
                              }
                            }}
                          />
                          <Label htmlFor={`permission-${permission.id}`} className="text-sm">
                            {permission.description}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewRoleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateRole}>Crear Rol</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
