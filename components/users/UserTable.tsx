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
    <Card className="bg-white dark:bg-gray-950 border border-blue-100 dark:border-blue-900/30 shadow-md">
      <UserTableHeader onRefresh={refreshData} onExport={exportToCSV} />

      <CardContent className="p-6">
        <div className="space-y-6">
          <UserTableControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            setCurrentPage={setCurrentPage}
            onUserCreated={handleUserCreated}
          />

          <div className="rounded-lg border border-blue-100 dark:border-blue-900/30 overflow-hidden">
            <div className="overflow-x-auto">
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
