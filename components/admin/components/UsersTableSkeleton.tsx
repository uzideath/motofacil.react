import { TableCell, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export function UsersTableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow
          key={index}
          className="border-dark-blue-800/30 hover:bg-dark-blue-800/20"
        >
          <TableCell>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full bg-dark-blue-800/50" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-[150px] bg-dark-blue-800/50" />
                <Skeleton className="h-3 w-[120px] bg-dark-blue-800/50" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-[100px] bg-dark-blue-800/50" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-[80px] bg-dark-blue-800/50" />
          </TableCell>
          <TableCell className="hidden lg:table-cell">
            <Skeleton className="h-5 w-[100px] bg-dark-blue-800/50" />
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Skeleton className="h-4 w-[120px] bg-dark-blue-800/50" />
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Skeleton className="h-4 w-[120px] bg-dark-blue-800/50" />
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-8 rounded-md bg-dark-blue-800/50" />
              <Skeleton className="h-8 w-8 rounded-md bg-dark-blue-800/50" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}
