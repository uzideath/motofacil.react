import { TableRow, TableCell } from "@/components/ui/table"
import { Search } from "lucide-react"

export function EmptyState() {
  return (
    <TableRow className="border-dark-blue-800/30">
      <TableCell colSpan={10} className="text-center py-8 text-blue-200/70">
        <div className="flex flex-col items-center justify-center">
          <Search className="h-8 w-8 mb-2 text-blue-300/50" />
          <p className="text-lg">No se encontraron cuotas</p>
          <p className="text-sm text-blue-300/50">Intenta con otros criterios de búsqueda</p>
        </div>
      </TableCell>
    </TableRow>
  )
}
