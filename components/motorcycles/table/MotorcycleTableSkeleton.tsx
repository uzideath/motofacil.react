import { TableRow, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export function MotorcycleTableSkeleton() {
    return (
        <>
            {Array.from({ length: 4 }).map((_, index) => (
                <TableRow
                    key={`skeleton-${index}`}
                    className="border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                >
                    {Array.from({ length: 10 }).map((_, i) => (
                        <TableCell key={`skeleton-cell-${index}-${i}`}>
                            <Skeleton className="h-5 w-full bg-blue-100/50 dark:bg-blue-900/20" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    )
}
