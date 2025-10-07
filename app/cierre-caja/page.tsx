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
    const [selectedTransactions, setSelectedTransactions] = useState<SelectedTransaction[]>([])
    const [token, setToken] = useState<string>("")
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())

    useEffect(() => {
        const localToken = localStorage.getItem("token")
        if (localToken) {
            setToken(localToken)
        }
    }, [])

    return (
        <div className="flex-1 w-full">
            <div className="gradient-bg text-white p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Cierre de Caja Diario</h1>
                        <p className="text-white/80 mt-1">Gestión de ingresos y cierre diario</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <Tabs defaultValue="summary" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="summary">Resumen del Día</TabsTrigger>
                        <TabsTrigger value="transactions">Transacciones</TabsTrigger>
                        <TabsTrigger value="register">Cierre de Caja</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-6">
                        <DailySummary />

                        <Card className="card-hover-effect">
                            <CardHeader>
                                <CardTitle>Historial de Cierres</CardTitle>
                                <CardDescription>Visualice todos los cierres realizados previamente</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CashRegisterHistory />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="transactions" className="space-y-6">
                        <Card className="card-hover-effect">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Transacciones del Día</CardTitle>
                                    <CardDescription>Detalle de todos los ingresos y egresos del día</CardDescription>
                                </div>
                                <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">
                                        <Printer className="mr-2 h-4 w-4" />
                                        Imprimir
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        Exportar
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <TransactionTable
                                    token={token}
                                    onSelect={(selected) => setSelectedTransactions(selected)}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="register" className="space-y-6">
                        <Card className="card-hover-effect">
                            <CardHeader>
                                <CardTitle>Cierre de Caja</CardTitle>
                                <CardDescription>Registre el cierre de caja del día</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Date Selector */}
                                <div className="bg-slate-50 dark:bg-slate-900 border rounded-lg p-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Fecha del Cierre</Label>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Seleccione la fecha a la que pertenecen las transacciones de este cierre
                                        </p>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
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
                                    <h3 className="text-lg font-semibold mb-3">
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
