import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { Button } from "@/components/ui/button"
import { UserManagement } from "@/components/admin/user-management"
import { Download, Filter, UserPlus } from "lucide-react"

export default function AdminUsersPage() {
  return (
    <div className="flex-1 w-full">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
            <p className="text-gray-400 mt-1">Administra los usuarios del sistema</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50">
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
            <Button variant="outline" className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            <Button variant="outline" className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <MobileSidebar />
          </div>
        </div>
      </div>

      <div className="p-6 bg-gray-900">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              Todos los Usuarios
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              Usuarios Activos
            </TabsTrigger>
            <TabsTrigger value="inactive" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              Usuarios Inactivos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Todos los Usuarios</CardTitle>
                <CardDescription className="text-gray-400">
                  Gestiona todos los usuarios registrados en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement filter="all" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Usuarios Activos</CardTitle>
                <CardDescription className="text-gray-400">Gestiona los usuarios activos en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement filter="active" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inactive" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Usuarios Inactivos</CardTitle>
                <CardDescription className="text-gray-400">
                  Gestiona los usuarios inactivos en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement filter="inactive" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
