"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type Loan = {
  id: string
  contractNumber: string | null
  user: {
    name: string
    identification: string
  }
  vehicle: {
    model: string
    plate: string
    brand: string
  }
}

interface CalendarHeaderProps {
  currentDate: Date
  selectedLoan: string | null
  loans: Loan[]
  loading: boolean
  searchTerm: string
  onSearchChange: (value: string) => void
  onLoanSelect: (loanId: string | null) => void
  onPreviousMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

export function CalendarHeader({
  currentDate,
  selectedLoan,
  loans,
  loading,
  searchTerm,
  onSearchChange,
  onLoanSelect,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Search and Filter Section */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por placa, modelo, marca, cliente o identificación..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
          <div className="lg:w-80">
            <Select
              value={selectedLoan || "all"}
              onValueChange={(value) => onLoanSelect(value === "all" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar préstamo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los préstamos</SelectItem>
                {loans.map((loan) => (
                  <SelectItem key={loan.id} value={loan.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{loan.vehicle.plate}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-sm">{loan.vehicle.brand} {loan.vehicle.model}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-sm text-muted-foreground">{loan.user.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={onPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={onToday} className="ml-2">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Hoy
            </Button>
          </div>
          <h3 className="text-xl font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
        </div>

        {/* Selected Loan Info */}
        {selectedLoan && !loading && (
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            {loans.find((l) => l.id === selectedLoan) && (
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {loans.find((l) => l.id === selectedLoan)?.vehicle.brand}{" "}
                    {loans.find((l) => l.id === selectedLoan)?.vehicle.model}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Placa: {loans.find((l) => l.id === selectedLoan)?.vehicle.plate} | Cliente:{" "}
                    {loans.find((l) => l.id === selectedLoan)?.user.name}
                  </p>
                  {loans.find((l) => l.id === selectedLoan)?.contractNumber && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Contrato: {loans.find((l) => l.id === selectedLoan)?.contractNumber}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => onLoanSelect(null)}>
                  Limpiar
                </Button>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}
      </div>
    </Card>
  )
}
