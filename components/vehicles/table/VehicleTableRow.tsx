"use client"

import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Edit, Trash2 } from "lucide-react"
import type { Vehicle } from "@/lib/types"
import { VehicleForm } from "../VehicleForm"

interface VehicleTableRowProps {
    vehicle: Vehicle
    index: number
    getProviderLabel: (providerName: string) => string
    getVehicleTypeLabel: (type: any) => string
    onEdit: (vehicle?: Vehicle) => void
    onDelete: (id: string) => void
}

export function VehicleTableRow({
    vehicle: moto,
    index,
    getProviderLabel,
    getVehicleTypeLabel,
    onEdit,
    onDelete,
}: VehicleTableRowProps) {
    return (
        <TableRow
            key={`moto-row-${moto.id}-${index}`}
            className="border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-950/20"
        >
            <TableCell className="font-medium">{moto.brand}</TableCell>
            <TableCell>{moto.model}</TableCell>
            <TableCell>
                <Badge
                    variant="outline"
                    className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                >
                    {moto.plate}
                </Badge>
            </TableCell>
            <TableCell>{moto.color ?? "—"}</TableCell>
            <TableCell>{moto.cc ? `${moto.cc} cc` : "—"}</TableCell>
            <TableCell className="font-mono text-xs">
                {moto.engine ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="cursor-default">
                                <span className="bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded border border-blue-100 dark:border-blue-900/30">
                                    {moto.engine}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Número de motor</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    "—"
                )}
            </TableCell>
            <TableCell className="font-mono text-xs">
                {moto.chassis ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="cursor-default">
                                <span className="bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded border border-blue-100 dark:border-blue-900/30">
                                    {moto.chassis}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Número de chasis</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    "—"
                )}
            </TableCell>
            <TableCell>
                {moto.gps ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50">
                        {moto.gps}
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-gray-500 dark:text-gray-400">
                        No asignado
                    </Badge>
                )}
            </TableCell>
            <TableCell>
                {moto.provider ? (
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50">
                        {getProviderLabel(moto.provider.name)}
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-gray-500 dark:text-gray-400">
                        No asignado
                    </Badge>
                )}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <div key={`edit-wrapper-${moto.id}-${index}`}>
                        <VehicleForm vehicleId={moto.id} vehicleData={moto} onCreated={onEdit}>
                            <Button
                                variant="outline"
                                size="icon"
                                className="border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 dark:hover:text-blue-300"
                            >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                            </Button>
                        </VehicleForm>
                    </div>
                    <TooltipProvider key={`delete-tooltip-${moto.id}-${index}`}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onDelete(moto.id)}
                                    className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-300"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Eliminar</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Eliminar vehículo</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </TableCell>
        </TableRow>
    )
}

