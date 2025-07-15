import { TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building, Calendar, Edit, Bike, DollarSign } from "lucide-react"

export function ProviderTableHeaders() {
    return (
        <TableHeader>
            <TableRow className="bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50">
                <TableHead className="text-blue-700 dark:text-blue-300 font-medium">
                    <div className="flex items-center gap-1.5">
                        <Building className="h-4 w-4" />
                        <span>Proveedor</span>
                    </div>
                </TableHead>
                <TableHead className="text-blue-700 dark:text-blue-300 font-medium text-center">
                    <div className="flex items-center justify-center gap-1.5">
                        <Bike className="h-4 w-4" />
                        <span>Motocicletas</span>
                    </div>
                </TableHead>
                <TableHead className="text-blue-700 dark:text-blue-300 font-medium text-center">
                    <div className="flex items-center justify-center gap-1.5">
                        <DollarSign className="h-4 w-4" />
                        <span>Cierres de Caja</span>
                    </div>
                </TableHead>
                <TableHead className="text-blue-700 dark:text-blue-300 font-medium">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>Fecha de Creación</span>
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
    )
}
