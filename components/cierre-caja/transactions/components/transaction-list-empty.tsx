import { TableCell, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"

export function TransactionListEmpty() {
    return (
        <TableRow>
            <TableCell colSpan={9} className="text-center py-10">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Search className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-lg font-medium">No se encontraron transacciones</p>
                    <p className="text-sm">Intenta con otros criterios de búsqueda o limpia los filtros</p>
                </div>
            </TableCell>
        </TableRow>
    )
}
