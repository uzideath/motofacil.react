import React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { getPageNumbers } from "../utils"

interface PaginationControlsProps {
    currentPage: number
    totalPages: number
    itemsPerPage: string
    totalItems: number
    onPageChange: (page: number) => void
    onItemsPerPageChange: (value: string) => void
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    onPageChange,
    onItemsPerPageChange,
}) => {
    const itemsPerPageNumber = Number.parseInt(itemsPerPage)
    const indexOfLastItem = currentPage * itemsPerPageNumber
    const indexOfFirstItem = indexOfLastItem - itemsPerPageNumber

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                    Mostrando {totalItems > 0 ? indexOfFirstItem + 1 : 0}-
                    {Math.min(indexOfLastItem, totalItems)} de {totalItems} registros
                </p>
                <Select value={itemsPerPage} onValueChange={onItemsPerPageChange}>
                    <SelectTrigger className="w-[70px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">por página</p>
            </div>

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                    {getPageNumbers(currentPage, totalPages).map((n, idx) =>
                        typeof n === "string" ? (
                            <PaginationItem key={idx}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        ) : (
                            <PaginationItem key={n}>
                                <PaginationLink isActive={currentPage === n} onClick={() => onPageChange(n)}>
                                    {n}
                                </PaginationLink>
                            </PaginationItem>
                        )
                    )}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                            className={currentPage === totalPages || totalPages === 0 ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}
