"use client"

import { useState } from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Edit, Trash2, Building, Calendar, Bike, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Provider } from "@/lib/types"
import { ProviderCashRegistersDialog } from "../components/ProvidersCashRegistersDialog"
import { ProviderMotorcyclesDialog } from "../components/ProvidersMotorcyclesDialog"
import { ProviderForm } from "../form/ProviderForm"

interface ProviderTableRowProps {
    provider: Provider
    index: number
    onEdit: (provider?: Provider) => void
    onDelete: (id: string) => void
    createProvider: (name: string) => Promise<Provider>
    updateProvider: (id: string, name: string) => Promise<Provider>
}

export function ProviderTableRow({
    provider,
    index,
    onEdit,
    onDelete,
    createProvider,
    updateProvider,
}: ProviderTableRowProps) {
    const [motorcyclesDialogOpen, setMotorcyclesDialogOpen] = useState(false)
    const [cashRegistersDialogOpen, setCashRegistersDialogOpen] = useState(false)

    const motorcycleCount = provider.motorcylces?.length || 0
    const cashRegisterCount = provider.cashRegisters?.length || 0

    return (
        <>
            <TableRow
                key={`provider-row-${provider.id}-${index}`}
                className="border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-950/20"
            >
                <TableCell>
                    <div className="font-medium flex items-center gap-1.5">
                        <Building className="h-4 w-4 text-blue-500" />
                        <Badge
                            variant="outline"
                            className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                        >
                            {provider.name}
                        </Badge>
                    </div>
                </TableCell>

                <TableCell className="text-center">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setMotorcyclesDialogOpen(true)}
                                    className="h-8 px-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-200 dark:hover:bg-blue-900/30"
                                >
                                    <Bike className="h-4 w-4 mr-1" />
                                    <Badge
                                        variant="secondary"
                                        className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                    >
                                        {motorcycleCount}
                                    </Badge>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Ver motocicletas ({motorcycleCount})</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </TableCell>

                <TableCell className="text-center">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCashRegistersDialogOpen(true)}
                                    className="h-8 px-3 text-green-600 hover:text-green-800 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-200 dark:hover:bg-green-900/30"
                                >
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    <Badge
                                        variant="secondary"
                                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    >
                                        {cashRegisterCount}
                                    </Badge>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Ver cierres de caja ({cashRegisterCount})</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </TableCell>

                <TableCell>
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span>{format(new Date(provider.createdAt), "dd/MM/yyyy", { locale: es })}</span>
                    </div>
                </TableCell>

                <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div key={`edit-wrapper-${provider.id}-${index}`}>
                                        <ProviderForm
                                            providerId={provider.id}
                                            providerData={provider}
                                            onCreated={onEdit}
                                            createProvider={createProvider}
                                            updateProvider={updateProvider}
                                        >
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 dark:hover:text-blue-300"
                                            >
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">Editar</span>
                                            </Button>
                                        </ProviderForm>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Editar proveedor</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => onDelete(provider.id)}
                                        className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-300"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Eliminar</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Eliminar proveedor</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </TableCell>
            </TableRow>

            {/* Dialogs */}
            <ProviderMotorcyclesDialog
                open={motorcyclesDialogOpen}
                onOpenChange={setMotorcyclesDialogOpen}
                provider={provider}
            />

            <ProviderCashRegistersDialog
                open={cashRegistersDialogOpen}
                onOpenChange={setCashRegistersDialogOpen}
                provider={provider}
            />
        </>
    )
}
