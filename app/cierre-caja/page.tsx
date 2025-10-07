"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Download, Printer, CalendarIcon } from "lucide-react"
import { CashRegisterForm } from "@/components/cierre-caja/CashRegisterForm"
import { DailySummary } from "@/components/cierre-caja/daily-summary"
import { TransactionTable } from "@/components/cierre-caja/transactions/TransactionTable"
import { CashRegisterHistory } from "@/components/cierre-caja/CashRegisterHistory"
import { SelectedTransaction } from "@/components/cierre-caja/transactions/constants/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function CierreCajaPage() {
    // Single shared state for transaction selections across all tabs
    const [selectedTransactions, setSelectedTransactions] = useState<SelectedTransaction[]>([])
    const [token, setToken] = useState<string>("")
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [activeTab, setActiveTab] = useState<string>("summary")

    useEffect(() => {
        const localToken = localStorage.getItem("token")
        if (localToken) {
            setToken(localToken)
        }
    }, [])

    return (
        <div className="flex-1 w-full h-screen flex flex-col overflow-hidden">
            <div className="bg-primary text-primary-foreground px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Cierre de Caja Diario</h1>
                        <p className="text-primary-foreground/80 text-sm">Gestión de ingresos y cierre diario</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
                <Tabs 
                    defaultValue="summary" 
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="h-full flex flex-col space-y-3"
                >
                    <TabsList className="grid w-full grid-cols-2 shrink-0">
                        <TabsTrigger value="summary">Resumen del Día</TabsTrigger>
                        <TabsTrigger value="register">Cierre de Caja</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="flex-1 space-y-4 overflow-auto mt-0">
                        <DailySummary />

                        <Card className="bg-card border-border">
                            <CardHeader className="py-3">
                                <CardTitle className="text-lg">Historial de Cierres</CardTitle>
                                <CardDescription>Visualice todos los cierres realizados previamente</CardDescription>
                            </CardHeader>
                            <CardContent className="py-3">
                                <CashRegisterHistory />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="register" className="flex-1 overflow-auto mt-0">
                        <Card className="bg-card border-border h-full flex flex-col">
                            <CardHeader className="py-3 shrink-0">
                                <CardTitle className="text-lg">Cierre de Caja</CardTitle>
                                <CardDescription>Registre el cierre de caja del día</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-auto space-y-4 py-3">
                                {/* Date Selector */}
                                <div className="bg-muted border-border border rounded-lg p-3">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Fecha del Cierre</Label>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            Seleccione la fecha a la que pertenecen las transacciones de este cierre
                                        </p>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !selectedDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={selectedDate}
                                                    onSelect={(date) => date && setSelectedDate(date)}
                                                    initialFocus
                                                    locale={es}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                {/* Transactions for Selected Date */}
                                <div>
                                    <h3 className="text-base font-semibold mb-2">
                                        Transacciones disponibles para {format(selectedDate, "PPP", { locale: es })}
                                    </h3>
                                    <TransactionTable
                                        token={token}
                                        onSelect={(selected) => setSelectedTransactions(selected)}
                                        filterByDate={selectedDate}
                                    />
                                </div>

                                {/* Cash Register Form */}
                                <CashRegisterForm
                                    token={token}
                                    selectedTransactions={selectedTransactions}
                                    closingDate={selectedDate}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
