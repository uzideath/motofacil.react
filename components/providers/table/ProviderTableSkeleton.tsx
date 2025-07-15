import { TableRow, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export function ProviderTableSkeleton() {
    return (
        <>
            {Array.from({ length: 4 }).map((_, index) => (
                <TableRow
                    key={`skeleton-${index}`}
                    className="border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                >
                    <TableCell>
                        <Skeleton className="h-5 w-[150px] bg-blue-100/50 dark:bg-blue-900/20" />
                    </TableCell>
                    <TableCell className="text-center">
                        <Skeleton className="h-5 w-[80px] bg-blue-100/50 dark:bg-blue-900/20 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                        <Skeleton className="h-5 w-[80px] bg-blue-100/50 dark:bg-blue-900/20 mx-auto" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-5 w-[120px] bg-blue-100/50 dark:bg-blue-900/20" />
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Skeleton className="h-8 w-8 rounded-md bg-blue-100/50 dark:bg-blue-900/20" />
                            <Skeleton className="h-8 w-8 rounded-md bg-blue-100/50 dark:bg-blue-900/20" />
                        </div>
                    </TableCell>
                </TableRow>
            ))}
        </>
    )
}
