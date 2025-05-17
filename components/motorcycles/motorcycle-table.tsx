"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Edit,
  Trash2,
  Search,
  Plus,
  MoreHorizontal,
  RefreshCw,
  Bike,
  FileSpreadsheet,
  SlidersHorizontal,
  Filter,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { MotorcycleForm } from "./motorcycle-form"
import { Skeleton } from "@/components/ui/skeleton"
import { HttpService } from "@/lib/http"
import type { Motorcycle } from "@/lib/types"
import { DeleteConfirmationDialog } from "./delete-dialog"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Provider mapping for display
const providerLabels: Record<string, string> = {
  MOTOFACIL: "Moto Facil",
  OBRASOCIAL: "Obra Social",
  PORCENTAJETITO: "Porcentaje Tito",
}

export function MotorcycleTable() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [providerFilter, setProviderFilter] = useState<string>("all") // Updated default value to "all"
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [motorcycleToDelete, setMotorcycleToDelete] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchMotorcycles = async () => {
    try {
      setLoading(true)
      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("authToken="))
        ?.split("=")[1]

      const response = await HttpService.get<Motorcycle[]>("/api/v1/motorcycles", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      setMotorcycles(response.data)
    } catch (error) {
      console.error("Error al obtener motocicletas:", error)
      toast({
        variant: "destructive",
        title: "Error al cargar datos",
        description: "No se pudieron obtener las motocicletas del servidor",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMotorcycles()
  }, [refreshKey])

  // Handle motorcycle creation or update
  const handleMotorcycleCreated = (updatedMotorcycle?: Motorcycle) => {
    if (!updatedMotorcycle) {
      // If no motorcycle data is provided, fetch all motorcycles
      fetchMotorcycles()
      return
    }

    // Check if this is an update (edit) or a new motorcycle
    setMotorcycles((prev) => {
      // Check if the motorcycle already exists in our list
      const existingIndex = prev.findIndex((moto) => moto.id === updatedMotorcycle.id)

      if (existingIndex >= 0) {
        // This is an update - replace the existing motorcycle
        const updatedList = [...prev]
        updatedList[existingIndex] = updatedMotorcycle
        return updatedList
      } else {
        // This is a new motorcycle - add it to the beginning of the list
        return [updatedMotorcycle, ...prev]
      }
    })
  }

  const handleDelete = async (id: string) => {
    setMotorcycleToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!motorcycleToDelete) return

    try {
      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("authToken="))
        ?.split("=")[1]

      await HttpService.delete(`/api/v1/motorcycles/${motorcycleToDelete}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      setMotorcycles((prev) => prev.filter((moto) => moto.id !== motorcycleToDelete))

      toast({
        title: "Motocicleta eliminada",
        description: "La motocicleta ha sido eliminada correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar motocicleta:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la motocicleta",
      })
    }
  }

  // Apply both search and provider filters
  const filteredMotorcycles = motorcycles.filter((moto) => {
    // Apply text search filter
    const matchesSearch =
      moto.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moto.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moto.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (moto.chassis && moto.chassis.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (moto.engine && moto.engine.toLowerCase().includes(searchTerm.toLowerCase()))

    // Apply provider filter if one is selected
    const matchesProvider = providerFilter === "all" || moto.provider === providerFilter

    return matchesSearch && matchesProvider
  })

  const totalItems = filteredMotorcycles.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const currentItems = filteredMotorcycles.slice(startIndex, endIndex)

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
    // Simple CSV export function
    const headers = ["Marca", "Modelo", "Placa", "Color", "Cilindraje", "GPS", "Motor", "Chasis", "Proveedor"]

    const csvRows = [
      headers.join(","),
      ...filteredMotorcycles.map((moto) =>
        [
          moto.brand,
          moto.model,
          moto.plate,
          moto.color || "",
          moto.cc || "",
          moto.gps || "",
          moto.engine || "",
          moto.chassis || "",
          providerLabels[moto.provider as keyof typeof providerLabels] || "",
        ].join(","),
      ),
    ]

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "motocicletas.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Get unique providers from the data
  const uniqueProviders = Array.from(new Set(motorcycles.map((moto) => moto.provider).filter(Boolean))) as string[]

  return (
    <Card className="bg-white dark:bg-gray-950 border border-blue-100 dark:border-blue-900/30 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-sky-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
              <Bike className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Gestión de Motocicletas</CardTitle>
              <CardDescription className="text-blue-100">Administra el inventario de motocicletas</CardDescription>
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
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-500/70" />
                <Input
                  type="search"
                  placeholder="Buscar por marca, modelo, placa, motor o chasis..."
                  className="pl-9 border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-500/70" />
                <Select
                  value={providerFilter}
                  onValueChange={(value) => {
                    setProviderFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[180px] border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700">
                    <SelectValue placeholder="Todos los proveedores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los proveedores</SelectItem>
                    {uniqueProviders.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {providerLabels[provider as keyof typeof providerLabels] || provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              <MotorcycleForm onCreated={handleMotorcycleCreated}>
                <Button className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white shadow-sm hover:shadow-md transition-all">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Motocicleta
                </Button>
              </MotorcycleForm>
            </div>
          </div>

          <div className="rounded-lg border border-blue-100 dark:border-blue-900/30 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50">
                    <TableHead className="text-blue-700 dark:text-blue-300 font-medium">Marca</TableHead>
                    <TableHead className="text-blue-700 dark:text-blue-300 font-medium">Modelo</TableHead>
                    <TableHead className="text-blue-700 dark:text-blue-300 font-medium">Placa</TableHead>
                    <TableHead className="text-blue-700 dark:text-blue-300 font-medium">Color</TableHead>
                    <TableHead className="text-blue-700 dark:text-blue-300 font-medium">Cilindraje</TableHead>
                    <TableHead className="text-blue-700 dark:text-blue-300 font-medium">Motor</TableHead>
                    <TableHead className="text-blue-700 dark:text-blue-300 font-medium">Chasis</TableHead>
                    <TableHead className="text-blue-700 dark:text-blue-300 font-medium">GPS</TableHead>
                    <TableHead className="text-blue-700 dark:text-blue-300 font-medium">Proveedor</TableHead>
                    <TableHead className="text-right text-blue-700 dark:text-blue-300 font-medium">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <TableRow
                        key={`skeleton-${index}`}
                        className="border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      >
                        {Array.from({ length: 10 }).map((_, i) => (
                          <TableCell key={`skeleton-cell-${index}-${i}`}>
                            <Skeleton className="h-5 w-full bg-blue-100/50 dark:bg-blue-900/20" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : currentItems.length === 0 ? (
                    <TableRow className="border-blue-100 dark:border-blue-900/30">
                      <TableCell colSpan={10} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Bike className="h-10 w-10 text-blue-300/50 dark:text-blue-700/30" />
                          <p className="text-sm">No se encontraron motocicletas</p>
                          {(searchTerm || providerFilter !== "all") && (
                            <Button
                              variant="link"
                              onClick={() => {
                                setSearchTerm("")
                                setProviderFilter("all")
                              }}
                              className="text-blue-500 dark:text-blue-400"
                            >
                              Limpiar filtros
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map((moto, index) => (
                      <TableRow
                        key={`moto-row-${moto.id}-${index}`}
                        className="border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      >
                        <TableCell className="font-medium">{moto.brand}</TableCell>
                        <TableCell>{moto.model}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          >
                            {moto.plate}
                          </Badge>
                        </TableCell>
                        <TableCell>{moto.color ?? "—"}</TableCell>
                        <TableCell>{moto.cc ? `${moto.cc} cc` : "—"}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {moto.engine ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="cursor-default">
                                  <span className="bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded border border-blue-100 dark:border-blue-900/30">
                                    {moto.engine}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Número de motor</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {moto.chassis ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="cursor-default">
                                  <span className="bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded border border-blue-100 dark:border-blue-900/30">
                                    {moto.chassis}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Número de chasis</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {moto.gps ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50">
                              {moto.gps}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500 dark:text-gray-400">
                              No asignado
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {moto.provider ? (
                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50">
                              {providerLabels[moto.provider as keyof typeof providerLabels] || moto.provider}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500 dark:text-gray-400">
                              No asignado
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* Usar un ID único para cada botón de editar */}
                            <div key={`edit-wrapper-${moto.id}-${index}`}>
                              <MotorcycleForm
                                motorcycleId={moto.id}
                                motorcycleData={moto}
                                onCreated={handleMotorcycleCreated}
                              >
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 dark:hover:text-blue-300"
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                              </MotorcycleForm>
                            </div>

                            <TooltipProvider key={`delete-tooltip-${moto.id}-${index}`}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDelete(moto.id)}
                                    className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Eliminar</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Eliminar motocicleta</p>
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
              Mostrando {totalItems > 0 ? startIndex + 1 : 0}-{endIndex} de {totalItems} motocicletas
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

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar eliminación"
        description="¿Está seguro que desea eliminar esta motocicleta? Esta acción no se puede deshacer."
      />
    </Card>
  )
}
