"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import { CashRegisterForm } from "@/components/cierre-caja/CashRegisterForm"
import { DailySummary } from "@/components/cierre-caja/daily-summary"
import { TransactionTable } from "@/components/cierre-caja/transactions/TransactionTable"
import { CashRegisterHistory } from "@/components/cierre-caja/CashRegisterHistory"
import { SelectedTransaction } from "@/components/cierre-caja/transactions/constants/types"

export default function CierreCajaPage() {
    const [selectedTransactions, setSelectedTransactions] = useState<SelectedTransaction[]>([])
    const [token, setToken] = useState<string>("")

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
                            <CardContent>
                                <CashRegisterForm
                                    token={token}
                                    selectedTransactions={selectedTransactions}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
