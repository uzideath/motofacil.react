import { TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function VehicleTableHeaders() {
    return (
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
    )
}

