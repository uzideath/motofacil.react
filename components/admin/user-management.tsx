"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Edit, Trash2, UserCog, Shield, UserX, UserCheck, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { UserForm } from "./user-form"

type User = {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "manager"
  status: "active" | "inactive"
  lastLogin: string
  createdAt: string
}

export function UserManagement({ filter = "all" }: { filter?: "all" | "active" | "inactive" }) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Simulación de carga de datos
    const timer = setTimeout(() => {
      const mockUsers: User[] = [
        {
          id: "1",
          name: "Admin Usuario",
          email: "admin@motocredit.com",
          role: "admin",
          status: "active",
          lastLogin: "2023-06-15T10:30:00",
          createdAt: "2023-01-10T08:00:00",
        },
        {
          id: "2",
          name: "Carlos Rodríguez",
          email: "carlos@ejemplo.com",
          role: "manager",
          status: "active",
          lastLogin: "2023-06-14T14:20:00",
          createdAt: "2023-02-15T09:30:00",
        },
        {
          id: "3",
          name: "María López",
          email: "maria@ejemplo.com",
          role: "user",
          status: "active",
          lastLogin: "2023-06-10T11:45:00",
          createdAt: "2023-03-05T10:15:00",
        },
        {
          id: "4",
          name: "Juan Pérez",
          email: "juan@ejemplo.com",
          role: "user",
          status: "inactive",
          lastLogin: "2023-05-20T16:30:00",
          createdAt: "2023-03-10T14:00:00",
        },
        {
          id: "5",
          name: "Ana Gómez",
          email: "ana@ejemplo.com",
          role: "manager",
          status: "active",
          lastLogin: "2023-06-12T09:15:00",
          createdAt: "2023-04-01T11:30:00",
        },
        {
          id: "6",
          name: "Pedro Martínez",
          email: "pedro@ejemplo.com",
          role: "user",
          status: "inactive",
          lastLogin: "2023-05-05T13:45:00",
          createdAt: "2023-04-15T08:45:00",
        },
      ]

      setUsers(mockUsers)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredUsers = users
    .filter((user) => {
      if (filter === "active") return user.status === "active"
      if (filter === "inactive") return user.status === "inactive"
      return true
    })
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  const handleDeleteUser = () => {
    if (!selectedUser) return

    // Simulación de eliminación
    setUsers(users.filter((user) => user.id !== selectedUser.id))

    toast({
      title: "Usuario eliminado",
      description: `El usuario ${selectedUser.name} ha sido eliminado correctamente.`,
    })

    setIsDeleteDialogOpen(false)
    setSelectedUser(null)
  }

  const handleStatusChange = (userId: string, newStatus: "active" | "inactive") => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: newStatus,
            }
          : user,
      ),
    )

    toast({
      title: `Usuario ${newStatus === "active" ? "activado" : "desactivado"}`,
      description: `El estado del usuario ha sido actualizado correctamente.`,
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500/80 hover:bg-red-500/70 text-white">Administrador</Badge>
      case "manager":
        return <Badge className="bg-blue-500/80 hover:bg-blue-500/70 text-white">Gerente</Badge>
      case "user":
        return <Badge className="bg-green-500/80 hover:bg-green-500/70 text-white">Usuario</Badge>
      default:
        return <Badge>{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/80 hover:bg-green-500/70 text-white">Activo</Badge>
      case "inactive":
        return (
          <Badge variant="outline" className="text-gray-400 border-dark-blue-700">
            Inactivo
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-300/70" />
          <Input
            type="search"
            placeholder="Buscar por nombre, email o rol..."
            className="pl-8 glass-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          onClick={() => {
            setSelectedUser(null)
            setIsFormOpen(true)
          }}
          className="bg-blue-600/80 hover:bg-blue-600 text-white"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="glass-table border border-dark-blue-800/30">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
                <TableHead className="text-blue-200">Usuario</TableHead>
                <TableHead className="text-blue-200">Rol</TableHead>
                <TableHead className="text-blue-200">Estado</TableHead>
                <TableHead className="hidden md:table-cell text-blue-200">Último Acceso</TableHead>
                <TableHead className="hidden md:table-cell text-blue-200">Fecha Creación</TableHead>
                <TableHead className="text-right text-blue-200">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full bg-dark-blue-800/50" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-[150px] bg-dark-blue-800/50" />
                          <Skeleton className="h-3 w-[120px] bg-dark-blue-800/50" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[100px] bg-dark-blue-800/50" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[80px] bg-dark-blue-800/50" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-[120px] bg-dark-blue-800/50" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-[120px] bg-dark-blue-800/50" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-md bg-dark-blue-800/50" />
                        <Skeleton className="h-8 w-8 rounded-md bg-dark-blue-800/50" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow className="border-dark-blue-800/30">
                  <TableCell colSpan={6} className="text-center text-blue-200/70">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
                    <TableCell className="text-white">
                      <div className="flex items-center space-x-3">
                        <Avatar className="border border-dark-blue-700 bg-dark-blue-800/50">
                          <AvatarImage
                            src={`/abstract-geometric-shapes.png?height=40&width=40&query=${user.name}`}
                            alt={user.name}
                          />
                          <AvatarFallback className="bg-dark-blue-800/80 text-blue-200">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-sm text-blue-200/70">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="hidden md:table-cell text-blue-200/70">
                      {formatDateTime(user.lastLogin)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-blue-200/70">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-300/70 hover:text-white hover:bg-dark-blue-800/50"
                          >
                            <UserCog className="h-4 w-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-dark-blue-800/90 backdrop-blur-md border-dark-blue-700 text-blue-200"
                        >
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-dark-blue-700" />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setIsFormOpen(true)
                            }}
                            className="hover:bg-dark-blue-700/50 cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          {user.status === "active" ? (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(user.id, "inactive")}
                              className="hover:bg-dark-blue-700/50 cursor-pointer"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Desactivar
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(user.id, "active")}
                              className="hover:bg-dark-blue-700/50 cursor-pointer"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="hover:bg-dark-blue-700/50 cursor-pointer text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-dark-blue-700" />
                          <DropdownMenuItem className="hover:bg-dark-blue-700/50 cursor-pointer">
                            <Shield className="mr-2 h-4 w-4" />
                            Cambiar rol
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Diálogo de confirmación para eliminar usuario */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="glass-effect border-dark-blue-700 text-white">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription className="text-blue-200/70">
              ¿Estás seguro de que deseas eliminar al usuario {selectedUser?.name}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-dark-blue-700 bg-dark-blue-800/30 text-blue-200 hover:bg-dark-blue-700/50 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              className="bg-red-500/80 hover:bg-red-500 text-white"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Formulario de usuario */}
      <UserForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        user={selectedUser}
        onSave={(updatedUser) => {
          if (selectedUser) {
            // Actualizar usuario existente
            setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
            toast({
              title: "Usuario actualizado",
              description: "El usuario ha sido actualizado correctamente.",
            })
          } else {
            // Crear nuevo usuario
            setUsers([...users, { ...updatedUser, id: String(users.length + 1) }])
            toast({
              title: "Usuario creado",
              description: "El usuario ha sido creado correctamente.",
            })
          }
          setIsFormOpen(false)
        }}
      />
    </div>
  )
}
