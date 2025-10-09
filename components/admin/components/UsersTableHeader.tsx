import { TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function UsersTableHeader() {
  return (
    <TableHeader>
      <TableRow className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
        <TableHead className="text-blue-200">Usuario</TableHead>
        <TableHead className="text-blue-200">Rol</TableHead>
        <TableHead className="text-blue-200">Estado</TableHead>
        <TableHead className="hidden lg:table-cell text-blue-200">
          Permisos
        </TableHead>
        <TableHead className="hidden md:table-cell text-blue-200">
          Último Acceso
        </TableHead>
        <TableHead className="hidden md:table-cell text-blue-200">
          Fecha Creación
        </TableHead>
        <TableHead className="text-right text-blue-200">Acciones</TableHead>
      </TableRow>
    </TableHeader>
  )
}
