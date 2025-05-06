"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Search, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { UserForm } from "./user-form"
import { Skeleton } from "@/components/ui/skeleton"
import { HttpService } from "@/lib/http"
import { Client } from "@/lib/types"


export function UserTable() {
  const [users, setUsers] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

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
  }, [])

  const handleUserCreated = (newUser?: Client) => {
    if (newUser) {
      setUsers((prev) => {
        const exists = prev.some((user) => user.id === newUser.id)
        return exists
          ? prev.map((u) => (u.id === newUser.id ? newUser : u))
          : [newUser, ...prev]
      })
    } else {
      fetchUsers()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro que desea eliminar este usuario?")) {
      try {
        const token = document.cookie
          .split("; ")
          .find((c) => c.startsWith("authToken="))
          ?.split("=")[1]

        await HttpService.delete(`/api/v1/users/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        })

        setUsers((prev) => prev.filter((user) => user.id !== id))
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
      }
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.identification.includes(searchTerm),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-300/70" />
          <Input
            type="search"
            placeholder="Buscar por nombre o identificación..."
            className="pl-8 glass-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <UserForm onCreated={handleUserCreated}>
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </UserForm>
      </div>

      <div className="glass-table border border-dark-blue-800/30">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
                <TableHead className="text-blue-200">Nombre</TableHead>
                <TableHead className="text-blue-200 hidden md:table-cell">Identificación</TableHead>
                <TableHead className="text-blue-200 hidden md:table-cell">Edad</TableHead>
                <TableHead className="text-blue-200 hidden md:table-cell">Teléfono</TableHead>
                <TableHead className="text-blue-200 hidden lg:table-cell">Dirección</TableHead>
                <TableHead className="text-right text-blue-200">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index} className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
                    <TableCell>
                      <Skeleton className="h-5 w-[150px] bg-dark-blue-800/50" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-5 w-[100px] bg-dark-blue-800/50" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-5 w-[40px] bg-dark-blue-800/50" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-5 w-[100px] bg-dark-blue-800/50" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-5 w-[200px] bg-dark-blue-800/50" />
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
                    <TableCell className="text-white">{user.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-blue-200">{user.identification}</TableCell>
                    <TableCell className="hidden md:table-cell text-blue-200">{user.age}</TableCell>
                    <TableCell className="hidden md:table-cell text-blue-200">{user.phone}</TableCell>
                    <TableCell className="hidden lg:table-cell text-blue-200">{user.address}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <UserForm userId={user.id} userData={user} onCreated={handleUserCreated}>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-dark-blue-700 bg-dark-blue-800/30 text-blue-300 hover:bg-dark-blue-700/50 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                        </UserForm>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(user.id)}
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
