"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Search, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { MotorcycleForm } from "./motorcycle-form"
import { Skeleton } from "@/components/ui/skeleton"
import { HttpService } from "@/lib/http"
import type { Motorcycle } from "@/lib/types"
import { DeleteConfirmationDialog } from "./delete-dialog"

export function MotorcycleTable() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [motorcycleToDelete, setMotorcycleToDelete] = useState<string | null>(null)

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
  }, [])

  // Handle new motorcycle creation
  const handleMotorcycleCreated = (newMotorcycle?: Motorcycle) => {
    if (newMotorcycle) {
      // Add the new motorcycle to the state directly
      setMotorcycles((prev) => [newMotorcycle, ...prev])
    } else {
      // If no motorcycle data is provided, fetch all motorcycles
      fetchMotorcycles()
    }
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

  const filteredMotorcycles = motorcycles.filter(
    (moto) =>
      moto.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moto.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moto.plate.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-300/70" />
          <Input
            type="search"
            placeholder="Buscar por marca, modelo o placa..."
            className="pl-8 glass-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <MotorcycleForm onCreated={handleMotorcycleCreated}>
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Motocicleta
          </Button>
        </MotorcycleForm>
      </div>

      <div className="glass-table border border-dark-blue-800/30">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
                <TableHead className="text-blue-200">Marca</TableHead>
                <TableHead className="text-blue-200">Modelo</TableHead>
                <TableHead className="text-blue-200">Placa</TableHead>
                <TableHead className="text-blue-200">Color</TableHead>
                <TableHead className="text-blue-200">Cilindraje (cc)</TableHead>
                <TableHead className="text-blue-200">GPS</TableHead>
                <TableHead className="text-right text-blue-200">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index} className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <TableCell key={i}>
                        <Skeleton className="h-5 w-full bg-dark-blue-800/50" />
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-md bg-dark-blue-800/50" />
                        <Skeleton className="h-8 w-8 rounded-md bg-dark-blue-800/50" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredMotorcycles.length === 0 ? (
                <TableRow className="border-dark-blue-800/30">
                  <TableCell colSpan={7} className="text-center text-blue-200/70">
                    No se encontraron motocicletas
                  </TableCell>
                </TableRow>
              ) : (
                filteredMotorcycles.map((moto) => (
                  <TableRow key={moto.id} className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
                    <TableCell className="text-white">{moto.brand}</TableCell>
                    <TableCell className="text-blue-200">{moto.model}</TableCell>
                    <TableCell className="text-blue-200">{moto.plate}</TableCell>
                    <TableCell className="text-blue-200">{moto.color ?? "No encontrado"}</TableCell>
                    <TableCell className="text-blue-200">{moto.cc?.toString() ?? "No encontrado"}</TableCell>
                    <TableCell className="text-blue-200">{moto.gps ?? "No encontrado"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <MotorcycleForm
                          motorcycleId={moto.id}
                          motorcycleData={moto}
                          onCreated={handleMotorcycleCreated}
                        >
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-dark-blue-700 bg-dark-blue-800/30 text-blue-300 hover:bg-dark-blue-700/50 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                        </MotorcycleForm>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(moto.id)}
                          className="border-dark-blue-700 bg-dark-blue-800/30 text-blue-300 hover:bg-dark-blue-700/50 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar eliminación"
        description="¿Está seguro que desea eliminar esta motocicleta? Esta acción no se puede deshacer."
      />
    </div>
  )
}
