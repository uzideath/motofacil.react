"use client"

import { Table, TableBody } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { ProviderSummaryCards } from "./components/ProviderSummaryCards"
import { useProviders } from "./hooks/useProviders"
import { useProviderTable } from "./hooks/useProviderTable"
import { ProviderDeleteDialog } from "./ProviderDeleteDialog"
import { ProviderTableControls } from "./table/ProviderTableControls"
import { ProviderTableEmptyState } from "./table/ProviderTableEmptyState"
import { ProviderTableHeader } from "./table/ProviderTableHeader"
import { ProviderTableHeaders } from "./table/ProviderTableHeaders"
import { ProviderTablePagination } from "./table/ProviderTablePagination"
import { ProviderTableRow } from "./table/ProviderTableRow"
import { ProviderTableSkeleton } from "./table/ProviderTableSkeleton"
export function ProviderTable() {
    const { providers: allProviders, loading: allProvidersLoading } = useProviders()

    const {
        providers,
        loading,
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        deleteDialogOpen,
        setDeleteDialogOpen,
        handleProviderCreated,
        handleDelete,
        confirmDelete,
        refreshProviders,
        exportToCSV,
        createProvider,
        updateProvider,
        totalItems,
        totalPages,
        startIndex,
        endIndex,
        getPageNumbers,
    } = useProviderTable()

    return (
        <div className="space-y-6">


            <Card className="bg-white dark:bg-gray-950 border border-blue-100 dark:border-blue-900/30 shadow-md">

                <ProviderTableHeader onRefresh={refreshProviders} onExport={exportToCSV} />

                <CardContent className="p-6">
                    <div className="space-y-6">
                        <ProviderTableControls
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            itemsPerPage={itemsPerPage}
                            setItemsPerPage={setItemsPerPage}
                            setCurrentPage={setCurrentPage}
                            onProviderCreated={handleProviderCreated}
                            createProvider={createProvider}
                            updateProvider={updateProvider}
                        />

                        <div className="rounded-lg border border-blue-100 dark:border-blue-900/30 overflow-hidden">
                            <div className="overflow-x-auto">
                                {/* <ProviderSummaryCards providers={allProviders} loading={allProvidersLoading} /> */}
                                <Table>
                                    <ProviderTableHeaders />
                                    <TableBody>
                                        {loading ? (
                                            <ProviderTableSkeleton />
                                        ) : providers.length === 0 ? (
                                            <ProviderTableEmptyState searchTerm={searchTerm} onClearSearch={() => setSearchTerm("")} />
                                        ) : (
                                            providers.map((provider, index) => (
                                                <ProviderTableRow
                                                    key={`provider-row-${provider.id}-${index}`}
                                                    provider={provider}
                                                    index={index}
                                                    onEdit={handleProviderCreated}
                                                    onDelete={handleDelete}
                                                    createProvider={createProvider}
                                                    updateProvider={updateProvider}
                                                />
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <ProviderTablePagination
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

                <ProviderDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={confirmDelete} />
            </Card>
        </div>
    )
}
