"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Edit,
  Trash2,
  Search,
  Plus,
  RefreshCw,
  MoreHorizontal,
  FileSpreadsheet,
  Users,
  User,
  Phone,
  Home,
  Hash,
  Calendar,
  MapPin,
  AlertTriangle,
  Filter,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { UserForm } from "./user-form"
import { Skeleton } from "@/components/ui/skeleton"
import { HttpService } from "@/lib/http"
import type { Client } from "@/lib/types"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

export function UserTable() {
  const [users, setUsers] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [refreshKey, setRefreshKey] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("authToken="))
        ?.split("=")[1]

      const response = await HttpService.get<Client[]>("/api/v1/users", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      setUsers(response.data)
    } catch (error) {
      console.error("Error al obtener usuarios:", error)
      toast({
        variant: "destructive",
        title: "Error al cargar usuarios",
        description: "No se pudieron obtener los usuarios del servidor",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [refreshKey])

  const handleUserCreated = (newUser?: Client) => {
    if (newUser) {
      setUsers((prev) => {
        const exists = prev.some((user) => user.id === newUser.id)
        return exists ? prev.map((u) => (u.id === newUser.id ? newUser : u)) : [newUser, ...prev]
      })
    } else {
      fetchUsers()
    }
  }

  const handleDelete = async (id: string) => {
    setUserToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return

    try {
      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("authToken="))
        ?.split("=")[1]

      await HttpService.delete(`/api/v1/users/${userToDelete}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      setUsers((prev) => prev.filter((user) => user.id !== userToDelete))
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el usuario",
      })
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.identification.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.idIssuedAt && user.idIssuedAt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.city && user.city.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const totalItems = filteredUsers.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const currentItems = filteredUsers.slice(startIndex, endIndex)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 3) endPage = Math.min(totalPages - 1, 4)
      else if (currentPage >= totalPages - 2) startPage = Math.max(2, totalPages - 3)

      if (startPage > 2) pages.push("ellipsis-start")
      for (let i = startPage; i <= endPage; i++) pages.push(i)
      if (endPage < totalPages - 1) pages.push("ellipsis-end")
      pages.push(totalPages)
    }

    return pages
  }

  const refreshData = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const exportToCSV = () => {
    const headers = [
      "Nombre",
      "Identificación",
      "Lugar de Expedición",
      "Edad",
      "Teléfono",
      "Dirección",
      "Ciudad",
      "Referente",
      "ID Referente",
      "Teléfono Referente",
    ]

    const csvRows = [
      headers.join(","),
      ...filteredUsers.map((user) =>
        [
          user.name,
          user.identification,
          user.idIssuedAt || "",
          user.age,
          user.phone,
          user.address,
          user.city || "",
          user.refName,
          user.refID,
          user.refPhone,
        ].join(","),
      ),
    ]

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "usuarios.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="bg-white dark:bg-gray-950 border border-blue-100 dark:border-blue-900/30 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-sky-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Gestión de Usuarios</CardTitle>
              <CardDescription className="text-blue-100">Administra la información de clientes</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={refreshData}
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Actualizar datos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportToCSV}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar a CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros avanzados
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-500/70" />
              <Input
                type="search"
                placeholder="Buscar por nombre, identificación, lugar o ciudad..."
                className="pl-9 border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[130px] border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700">
                  <SelectValue placeholder="Mostrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 por página</SelectItem>
                  <SelectItem value="10">10 por página</SelectItem>
                  <SelectItem value="20">20 por página</SelectItem>
                  <SelectItem value="50">50 por página</SelectItem>
                </SelectContent>
              </Select>
              <UserForm onCreated={handleUserCreated}>
                <Button className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white shadow-sm hover:shadow-md transition-all">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Usuario
                </Button>
              </UserForm>
            </div>
          </div>

          <div className="rounded-lg border border-blue-100 dark:border-blue-900/30 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50">
                    <TableHead className="text-blue-700 dark:text-blue-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        <span>Nombre</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-blue-700 dark:text-blue-300 font-medium hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Hash className="h-4 w-4" />
                        <span>Identificación</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-blue-700 dark:text-blue-300 font-medium hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>Lugar de expedición</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-blue-700 dark:text-blue-300 font-medium hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>Edad</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-blue-700 dark:text-blue-300 font-medium hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-4 w-4" />
                        <span>Teléfono</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-blue-700 dark:text-blue-300 font-medium hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Home className="h-4 w-4" />
                        <span>Dirección</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-blue-700 dark:text-blue-300 font-medium hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>Ciudad</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right text-blue-700 dark:text-blue-300 font-medium">
                      <div className="flex items-center justify-end gap-1.5">
                        <Edit className="h-4 w-4" />
                        <span>Acciones</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <TableRow
                        key={`skeleton-${index}`}
                        className="border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      >
                        <TableCell>
                          <Skeleton className="h-5 w-[150px] bg-blue-100/50 dark:bg-blue-900/20" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-5 w-[100px] bg-blue-100/50 dark:bg-blue-900/20" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Skeleton className="h-5 w-[100px] bg-blue-100/50 dark:bg-blue-900/20" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-5 w-[40px] bg-blue-100/50 dark:bg-blue-900/20" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-5 w-[100px] bg-blue-100/50 dark:bg-blue-900/20" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Skeleton className="h-5 w-[200px] bg-blue-100/50 dark:bg-blue-900/20" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Skeleton className="h-5 w-[120px] bg-blue-100/50 dark:bg-blue-900/20" />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Skeleton className="h-8 w-8 rounded-md bg-blue-100/50 dark:bg-blue-900/20" />
                            <Skeleton className="h-8 w-8 rounded-md bg-blue-100/50 dark:bg-blue-900/20" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : currentItems.length === 0 ? (
                    <TableRow className="border-blue-100 dark:border-blue-900/30">
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users className="h-10 w-10 text-blue-300/50 dark:text-blue-700/30" />
                          <p className="text-sm">No se encontraron usuarios</p>
                          {searchTerm && (
                            <Button
                              variant="link"
                              onClick={() => setSearchTerm("")}
                              className="text-blue-500 dark:text-blue-400"
                            >
                              Limpiar búsqueda
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map((user, index) => (
                      <TableRow
                        key={`user-row-${user.id}-${index}`}
                        className="border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      >
                        <TableCell>
                          <div className="font-medium flex items-center gap-1.5">
                            <User className="h-4 w-4 text-blue-500" />
                            {user.name}
                          </div>
                          <div className="md:hidden text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Hash className="h-3 w-3 text-gray-400" />
                            {user.identification}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                          >
                            {user.identification}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                            <MapPin className="h-4 w-4 text-indigo-500" />
                            {user.idIssuedAt || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-purple-500" />
                            <span className="font-medium">{user.age}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                            <Phone className="h-4 w-4 text-green-500" />
                            {user.phone}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                            <Home className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            <span className="truncate">{user.address}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 truncate max-w-[150px]">
                            <MapPin className="h-4 w-4 text-teal-500 flex-shrink-0" />
                            <span className="truncate">{user.city || "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div key={`edit-wrapper-${user.id}-${index}`}>
                                    <UserForm userId={user.id} userData={user} onCreated={handleUserCreated}>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 dark:hover:text-blue-300"
                                      >
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">Editar</span>
                                      </Button>
                                    </UserForm>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Editar usuario</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDelete(user.id)}
                                    className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Eliminar</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Eliminar usuario</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
              Mostrando {totalItems > 0 ? startIndex + 1 : 0}-{endIndex} de {totalItems} usuarios
            </div>

            <Pagination className="order-1 sm:order-2">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {getPageNumbers().map((page, i) =>
                  page === "ellipsis-start" || page === "ellipsis-end" ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={`page-${page}-${i}`}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(page as number)
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </CardContent>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar eliminación
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea eliminar este usuario? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
