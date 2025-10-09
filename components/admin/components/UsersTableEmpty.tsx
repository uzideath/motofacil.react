import { TableCell, TableRow } from "@/components/ui/table"

export function UsersTableEmpty() {
  return (
    <TableRow className="border-dark-blue-800/30">
      <TableCell colSpan={7} className="text-center text-blue-200/70">
        No se encontraron usuarios
      </TableCell>
    </TableRow>
  )
}
