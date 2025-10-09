"use client"

import { Table, TableBody } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { useUserTable } from "./hooks/useUserTable"
import { UserTableHeader } from "./components/table/UserTableHeader"
import { UserTableControls } from "./components/table/UserTableControls"
import { UserTableHeaders } from "./components/table/UserTableHeaders"
import { UserTableSkeleton } from "./components/table/UserTableSkeleton"
import { UserTableEmptyState } from "./components/table/UserTableEmptyState"
import { UserTableRow } from "./components/table/UserTableRow"
import { UserTablePagination } from "./components/table/UserTablePagination"
import { UserDeleteConfirmDialog } from "./components/table/UserDeleteConfirmDialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export function UserTable() {
  const {
    users,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleUserCreated,
    handleDelete,
    confirmDelete,
    refreshData,
    exportToCSV,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    getPageNumbers,
  } = useUserTable()

  return (
    <Card className="bg-card border-border shadow-md rounded-lg md:rounded-xl">
      <UserTableHeader onRefresh={refreshData} onExport={exportToCSV} />

      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          <UserTableControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            setCurrentPage={setCurrentPage}
            onUserCreated={handleUserCreated}
          />

          <div className="rounded-lg border border-border overflow-hidden">
            <ScrollArea className="h-[50vh] md:h-[55vh] lg:h-[60vh] max-h-[600px] min-h-[300px] w-full">
              <div className="overflow-x-auto pr-2 md:pr-3 lg:pr-4">
                <Table>
                  <UserTableHeaders />
                  <TableBody>
                    {loading ? (
                      <UserTableSkeleton />
                    ) : users.length === 0 ? (
                      <UserTableEmptyState searchTerm={searchTerm} onClearSearch={() => setSearchTerm("")} />
                    ) : (
                      users.map((user, index) => (
                        <UserTableRow
                          key={`user-row-${user.id}-${index}`}
                          user={user}
                          index={index}
                          onEdit={handleUserCreated}
                          onDelete={handleDelete}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>

          <UserTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setCurrentPage}
            getPageNumbers={getPageNumbers}
          />
        </div>
      </CardContent>

      <UserDeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={confirmDelete} />
    </Card>
  )
}
