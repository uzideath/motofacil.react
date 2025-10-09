import { TableCell, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  UserCog,
  Edit,
  Trash2,
  UserX,
  UserCheck,
  ShieldCheck,
} from "lucide-react"
import { Owner } from "@/lib/types"
import { RoleBadge } from "./RoleBadge"
import { StatusBadge } from "./StatusBadge"
import { PermissionsBadge } from "./PermissionsBadge"
import { formatDate, formatDateTime, getInitials } from "@/lib/utils/format"

interface UserTableRowProps {
  user: Owner
  onEdit: (user: Owner) => void
  onDelete: (user: Owner) => void
  onStatusChange: (userId: string, status: "ACTIVE" | "INACTIVE") => void
  onManagePermissions: (user: Owner) => void
}

export function UserTableRow({
  user,
  onEdit,
  onDelete,
  onStatusChange,
  onManagePermissions,
}: UserTableRowProps) {
  return (
    <TableRow className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
      <TableCell className="text-white">
        <div className="flex items-center space-x-3">
          <Avatar className="border border-dark-blue-700 bg-dark-blue-800/50">
            <AvatarImage
              src={`/abstract-geometric-shapes.png?height=40&width=40&query=${user.name}`}
              alt={user.name}
            />
            <AvatarFallback className="bg-dark-blue-800/80 text-blue-200">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-white">{user.name}</div>
            <div className="text-sm text-blue-200/70">{user.username}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <RoleBadge role={user.role} />
      </TableCell>
      <TableCell>
        <StatusBadge status={user.status} />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <PermissionsBadge
          permissions={user.permissions}
          isAdmin={user.role === "ADMIN"}
        />
      </TableCell>
      <TableCell className="hidden md:table-cell text-blue-200/70">
        {formatDateTime(user.lastLogin)}
      </TableCell>
      <TableCell className="hidden md:table-cell text-blue-200/70">
        {formatDate(user.createdAt)}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-300/70 hover:text-white hover:bg-dark-blue-800/50"
            >
              <UserCog className="h-4 w-4" />
              <span className="sr-only">Acciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-dark-blue-800/90 backdrop-blur-md border-dark-blue-700 text-blue-200"
          >
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-dark-blue-700" />
            <DropdownMenuItem
              onClick={() => onManagePermissions(user)}
              className="hover:bg-dark-blue-700/50 cursor-pointer"
            >
              <ShieldCheck className="mr-2 h-4 w-4 text-blue-400" />
              Gestionar Permisos
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-dark-blue-700" />
            <DropdownMenuItem
              onClick={() => onEdit(user)}
              className="hover:bg-dark-blue-700/50 cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            {user.status === "ACTIVE" ? (
              <DropdownMenuItem
                onClick={() => onStatusChange(user.id, "INACTIVE")}
                className="hover:bg-dark-blue-700/50 cursor-pointer"
              >
                <UserX className="mr-2 h-4 w-4" />
                Desactivar
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => onStatusChange(user.id, "ACTIVE")}
                className="hover:bg-dark-blue-700/50 cursor-pointer"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Activar
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDelete(user)}
              className="hover:bg-dark-blue-700/50 cursor-pointer text-red-400 hover:text-red-300"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
