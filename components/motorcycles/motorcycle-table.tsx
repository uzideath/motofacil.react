"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { MotorcycleForm } from "./motorcycle-form"
import { Skeleton } from "@/components/ui/skeleton"

type Motorcycle = {
  id: string
  brand: string
  model: string
  plate: string
}

export function MotorcycleTable() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // Simulación de carga de datos
    const timer = setTimeout(() => {
      setMotorcycles([
        {
          id: "1",
          brand: "Honda",
          model: "CB 125F",
          plate: "ABC123",
        },
        {
          id: "2",
          brand: "Yamaha",
          model: "FZ 150",
          plate: "DEF456",
        },
        {
          id: "3",
          brand: "Suzuki",
          model: "Gixxer 250",
          plate: "GHI789",
        },
        {
          id: "4",
          brand: "Bajaj",
          model: "Pulsar NS 200",
          plate: "JKL012",
        },
      ])
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro que desea eliminar esta motocicleta?")) {
      try {
        // Simulación de eliminación
        setMotorcycles(motorcycles.filter((moto) => moto.id !== id))
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
  }

  const filteredMotorcycles = motorcycles.filter(
    (moto) =>
      moto.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moto.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moto.plate.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center">
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
      </div>

      <div className="glass-table border border-dark-blue-800/30">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
                <TableHead className="text-blue-200">Marca</TableHead>
                <TableHead className="text-blue-200">Modelo</TableHead>
                <TableHead className="text-blue-200">Placa</TableHead>
                <TableHead className="text-right text-blue-200">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index} className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
                    <TableCell>
                      <Skeleton className="h-5 w-[100px] bg-dark-blue-800/50" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[120px] bg-dark-blue-800/50" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[80px] bg-dark-blue-800/50" />
                    </TableCell>
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
                  <TableCell colSpan={4} className="text-center text-blue-200/70">
                    No se encontraron motocicletas
                  </TableCell>
                </TableRow>
              ) : (
                filteredMotorcycles.map((moto) => (
                  <TableRow key={moto.id} className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
                    <TableCell className="font-medium text-white">{moto.brand}</TableCell>
                    <TableCell className="text-blue-200">{moto.model}</TableCell>
                    <TableCell className="text-blue-200">{moto.plate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <MotorcycleForm motorcycleId={moto.id} motorcycleData={moto}>
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
    </div>
  )
}
