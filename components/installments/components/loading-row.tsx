import { TableRow, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export function LoadingRow() {
    return (
        <TableRow className="border-dark-blue-800/30 hover:bg-dark-blue-800/20">
            <TableCell>
                <Skeleton className="h-6 w-[150px] bg-dark-blue-800/50" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <Skeleton className="h-6 w-[120px] bg-dark-blue-800/50" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <Skeleton className="h-6 w-[120px] bg-dark-blue-800/50" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-6 w-[100px] bg-dark-blue-800/50" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-6 w-[100px] bg-dark-blue-800/50" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <Skeleton className="h-6 w-[100px] bg-dark-blue-800/50" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-6 w-[100px] bg-dark-blue-800/50" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-6 w-[80px] bg-dark-blue-800/50" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-6 w-[80px] bg-dark-blue-800/50" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-6 w-[50px] bg-dark-blue-800/50" />
            </TableCell>
        </TableRow>
    )
}
