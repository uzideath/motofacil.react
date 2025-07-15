import { TableRow, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export function ExpenseTableSkeleton() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, index) => (
                <TableRow
                    key={`skeleton-${index}`}
                    className="border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                >
                    <TableCell>
                        <Skeleton className="h-5 w-[60px] bg-blue-100/50 dark:bg-blue-900/20" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-5 w-[80px] bg-blue-100/50 dark:bg-blue-900/20" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-6 w-[100px] bg-blue-100/50 dark:bg-blue-900/20 rounded-full" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-6 w-[100px] bg-blue-100/50 dark:bg-blue-900/20 rounded-full mx-auto" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-5 w-[80px] bg-blue-100/50 dark:bg-blue-900/20 ml-auto" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-5 w-[100px] bg-blue-100/50 dark:bg-blue-900/20" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-5 w-[120px] bg-blue-100/50 dark:bg-blue-900/20" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-5 w-[100px] bg-blue-100/50 dark:bg-blue-900/20" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-5 w-[100px] bg-blue-100/50 dark:bg-blue-900/20" />
                    </TableCell>
                    <TableCell>
                        <div className="flex justify-end">
                            <Skeleton className="h-8 w-8 bg-blue-100/50 dark:bg-blue-900/20 rounded-md" />
                        </div>
                    </TableCell>
                </TableRow>
            ))}
        </>
    )
}
