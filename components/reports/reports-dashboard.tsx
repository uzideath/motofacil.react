"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { DownloadIcon, FileTextIcon, PieChartIcon, BarChart3Icon, TrendingUpIcon } from "lucide-react"
import { LoanReportTable } from "./loan-report-table"
import { PaymentReportTable } from "./payment-report-table"
import { ClientReportTable } from "./client-report-table"
import { MotorcycleReportTable } from "./motorcycle-report-table"
import { ReportSummary } from "./report-summary"
import { ReportCharts } from "./report-charts"
import { useReports, type ReportFilters } from "@/hooks/useReports"
import type { DateRange } from "react-day-picker"

export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState("prestamos")
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const {
    loading,
    loanReport,
    paymentReport,
    clientReport,
    vehicleReport,
    fetchLoanReport,
    fetchPaymentReport,
    fetchClientReport,
    fetchVehicleReport,
    fetchAllReports,
    exportReport,
  } = useReports()

  // Build filters object
  const getFilters = (): ReportFilters => ({
    startDate: dateRange?.from?.toISOString().split("T")[0],
    endDate: dateRange?.to?.toISOString().split("T")[0],
    status: filterStatus,
    search: searchTerm || undefined,
  })

  // Initial load
  useEffect(() => {
    fetchAllReports(getFilters())
  }, [])

  // Fetch report based on active tab
  const handleApplyFilters = () => {
    const filters = getFilters()
    
    switch (activeTab) {
      case "prestamos":
        fetchLoanReport(filters)
        break
      case "pagos":
        fetchPaymentReport(filters)
        break
      case "clientes":
        fetchClientReport(filters)
        break
      case "motocicletas":
        fetchVehicleReport(filters)
        break
    }
  }

  // Export handler
  const handleExport = (format: "excel" | "pdf" | "csv") => {
    const typeMap = {
      prestamos: "loans" as const,
      pagos: "payments" as const,
      clientes: "clients" as const,
      motocicletas: "vehicles" as const,
    }
    
    exportReport(typeMap[activeTab as keyof typeof typeMap], format, getFilters())
  }

  // Aggregate report data for summary
  const reportData = {
    loans: loanReport || { total: 0, active: 0, completed: 0, defaulted: 0, totalAmount: 0, totalInterest: 0, items: [] },
    payments: paymentReport || { total: 0, onTime: 0, late: 0, totalCollected: 0, pendingCollection: 0, items: [] },
    clients: clientReport || { total: 0, active: 0, inactive: 0, withDefaultedLoans: 0, items: [] },
    motorcycles: vehicleReport || { total: 0, financed: 0, available: 0, totalValue: 0, items: [] },
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-3">
      {/* Compact Top Bar with Filters and Stats */}
      <div className="flex gap-3">
        {/* Left: Filters */}
        <Card className="flex-1">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-[220px] max-w-[280px]">
                <DatePickerWithRange 
                  className="w-full h-9" 
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9 w-[120px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Activos</SelectItem>
                  <SelectItem value="COMPLETED">Completados</SelectItem>
                  <SelectItem value="DEFAULTED">En mora</SelectItem>
                </SelectContent>
              </Select>

              <Input 
                placeholder="Buscar..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                className="h-9 w-[180px]"
              />

              <Button 
                onClick={handleApplyFilters} 
                disabled={loading}
                size="sm"
                className="h-9 px-4"
              >
                Aplicar
              </Button>

              <div className="h-6 w-px bg-border mx-1" />

              <Button
                variant="outline"
                size="sm"
                className="h-9 px-2.5"
                onClick={() => handleExport("excel")}
                disabled={loading}
                title="Excel"
              >
                <FileTextIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-2.5"
                onClick={() => handleExport("pdf")}
                disabled={loading}
                title="PDF"
              >
                <DownloadIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-2.5"
                onClick={() => handleExport("csv")}
                disabled={loading}
                title="CSV"
              >
                <FileTextIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Quick Stats Summary */}
        {loading ? (
          <Card className="w-[320px]">
            <CardContent className="p-3">
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ) : (
          <Card className="w-[320px]">
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-2">
                {activeTab === "prestamos" && (
                  <>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Total</div>
                      <div className="text-lg font-bold">{reportData.loans.total}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Activos</div>
                      <div className="text-lg font-bold text-blue-500">{reportData.loans.active}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Financiado</div>
                      <div className="text-sm font-semibold">
                        {new Intl.NumberFormat("es-CO", { 
                          style: "currency", 
                          currency: "COP", 
                          notation: "compact",
                          maximumFractionDigits: 1 
                        }).format(reportData.loans.totalAmount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Mora</div>
                      <div className="text-lg font-bold text-red-500">{reportData.loans.defaulted}</div>
                    </div>
                  </>
                )}
                {activeTab === "pagos" && (
                  <>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Total</div>
                      <div className="text-lg font-bold">{reportData.payments.total}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">A Tiempo</div>
                      <div className="text-lg font-bold text-green-500">{reportData.payments.onTime}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Recaudado</div>
                      <div className="text-sm font-semibold">
                        {new Intl.NumberFormat("es-CO", { 
                          style: "currency", 
                          currency: "COP", 
                          notation: "compact",
                          maximumFractionDigits: 1 
                        }).format(reportData.payments.totalCollected)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Tardíos</div>
                      <div className="text-lg font-bold text-orange-500">{reportData.payments.late}</div>
                    </div>
                  </>
                )}
                {activeTab === "clientes" && (
                  <>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Total</div>
                      <div className="text-lg font-bold">{reportData.clients.total}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Activos</div>
                      <div className="text-lg font-bold text-green-500">{reportData.clients.active}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Inactivos</div>
                      <div className="text-lg font-bold text-gray-500">{reportData.clients.inactive}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">En Mora</div>
                      <div className="text-lg font-bold text-red-500">{reportData.clients.withDefaultedLoans}</div>
                    </div>
                  </>
                )}
                {activeTab === "motocicletas" && (
                  <>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Total</div>
                      <div className="text-lg font-bold">{reportData.motorcycles.total}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Financiadas</div>
                      <div className="text-lg font-bold text-blue-500">{reportData.motorcycles.financed}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Valor Total</div>
                      <div className="text-sm font-semibold">
                        {new Intl.NumberFormat("es-CO", { 
                          style: "currency", 
                          currency: "COP", 
                          notation: "compact",
                          maximumFractionDigits: 1 
                        }).format(reportData.motorcycles.totalValue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Disponibles</div>
                      <div className="text-lg font-bold text-green-500">{reportData.motorcycles.available}</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content Area with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full grid grid-cols-4 h-9 shrink-0">
          <TabsTrigger value="prestamos" className="flex items-center gap-1.5 text-xs">
            <BarChart3Icon className="h-3.5 w-3.5" />
            <span>Arrendamientos</span>
          </TabsTrigger>
          <TabsTrigger value="pagos" className="flex items-center gap-1.5 text-xs">
            <TrendingUpIcon className="h-3.5 w-3.5" />
            <span>Pagos</span>
          </TabsTrigger>
          <TabsTrigger value="clientes" className="flex items-center gap-1.5 text-xs">
            <PieChartIcon className="h-3.5 w-3.5" />
            <span>Clientes</span>
          </TabsTrigger>
          <TabsTrigger value="motocicletas" className="flex items-center gap-1.5 text-xs">
            <BarChart3Icon className="h-3.5 w-3.5" />
            <span>Motocicletas</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-3 mt-3 min-h-0">
          {/* Main Table Area - Takes 3 columns */}
          <div className="lg:col-span-3 min-h-0">
            <TabsContent value="prestamos" className="mt-0 h-full">
              {loading ? (
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <Skeleton className="h-full w-full" />
                  </CardContent>
                </Card>
              ) : (
                <LoanReportTable data={reportData?.loans.items || []} />
              )}
            </TabsContent>

            <TabsContent value="pagos" className="mt-0 h-full">
              {loading ? (
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <Skeleton className="h-full w-full" />
                  </CardContent>
                </Card>
              ) : (
                <PaymentReportTable data={reportData?.payments.items || []} />
              )}
            </TabsContent>

            <TabsContent value="clientes" className="mt-0 h-full">
              {loading ? (
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <Skeleton className="h-full w-full" />
                  </CardContent>
                </Card>
              ) : (
                <ClientReportTable data={reportData?.clients.items || []} />
              )}
            </TabsContent>

            <TabsContent value="motocicletas" className="mt-0 h-full">
              {loading ? (
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <Skeleton className="h-full w-full" />
                  </CardContent>
                </Card>
              ) : (
                <MotorcycleReportTable data={reportData?.motorcycles.items || []} />
              )}
            </TabsContent>
          </div>

          {/* Charts Sidebar - Takes 1 column */}
          <div className="lg:col-span-1 min-h-0">
            {loading ? (
              <Card className="h-full">
                <CardContent className="pt-6 h-full">
                  <Skeleton className="h-full w-full" />
                </CardContent>
              </Card>
            ) : (
              <ReportCharts data={reportData} activeTab={activeTab} />
            )}
          </div>
        </div>
      </Tabs>
    </div>
  )
}
