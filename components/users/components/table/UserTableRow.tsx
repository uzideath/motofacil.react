"use client"

import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Edit, Trash2, User, Phone, Home, Hash, Calendar, MapPin } from "lucide-react"
import type { User as UserType } from "@/lib/types"
import { UserForm } from "../../UserForm"

interface UserTableRowProps {
    user: UserType
    index: number
    onEdit: (user?: UserType) => void
    onDelete: (id: string) => void
}

export function UserTableRow({ user, index, onEdit, onDelete }: UserTableRowProps) {
    return (
        <TableRow
            key={`user-row-${user.id}-${index}`}
            className="border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-950/20"
        >
            <TableCell>
                <div className="font-medium flex items-center gap-1.5">
                    <User className="h-4 w-4 text-blue-500" />
                    {user.name}
                </div>
                <div className="md:hidden text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Hash className="h-3 w-3 text-gray-400" />
                    {user.identification}
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <Badge
                    variant="outline"
                    className="font-mono text-xs bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                >
                    {user.identification}
                </Badge>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                    {user.idIssuedAt || "—"}
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">{user.age}</span>
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                    <Phone className="h-4 w-4 text-green-500" />
                    {user.phone}
                </div>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                    <Home className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <span className="truncate">{user.address}</span>
                </div>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 truncate max-w-[150px]">
                    <MapPin className="h-4 w-4 text-teal-500 flex-shrink-0" />
                    <span className="truncate">{user.city || "—"}</span>
                </div>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div key={`edit-wrapper-${user.id}-${index}`}>
                                    <UserForm userId={user.id} userData={user} onCreated={onEdit}>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 dark:hover:text-blue-300"
                                        >
                                            <Edit className="h-4 w-4" />
                                            <span className="sr-only">Editar</span>
                                        </Button>
                                    </UserForm>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Editar usuario</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onDelete(user.id)}
                                    className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-300"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Eliminar</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Eliminar usuario</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </TableCell>
        </TableRow>
    )
}
