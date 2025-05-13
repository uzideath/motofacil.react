"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { HttpService } from "@/lib/http"

type Installment = {
    id: string
    amount: number
}

type Props = {
    token: string
    selectedInstallments: Installment[]
}

export function CashRegisterForm({ token, selectedInstallments }: Props) {
    const [formState, setFormState] = useState({
        cashInRegister: "",
        cashFromTransfers: "",
        cashFromCards: "",
        notes: "",
        submitting: false,
        success: false,
        error: false,
    })

    const handleInputChange = (field: string, value: string) => {
        setFormState({
            ...formState,
            [field]: value,
            success: false,
            error: false,
        })
    }

    const totalExpected = useMemo(
        () => selectedInstallments.reduce((acc, item) => acc + item.amount, 0),
        [selectedInstallments]
    )

    const cashInRegister = parseFloat(formState.cashInRegister) || 0
    const cashFromTransfers = parseFloat(formState.cashFromTransfers) || 0
    const cashFromCards = parseFloat(formState.cashFromCards) || 0
    const totalRegistered = cashInRegister + cashFromTransfers + cashFromCards
    const totalDifference = totalRegistered - totalExpected

    const hasAnyValue =
        cashInRegister > 0 || cashFromTransfers > 0 || cashFromCards > 0

    const isFormValid = useMemo(() => {
        return (
            !formState.submitting &&
            selectedInstallments.length > 0 &&
            hasAnyValue
        )
    }, [formState, selectedInstallments, hasAnyValue])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormState((prev) => ({ ...prev, submitting: true, success: false, error: false }))

        try {
            await HttpService.post(
                "/api/v1/closing",
                {
                    cashInRegister,
                    cashFromTransfers,
                    cashFromCards,
                    notes: formState.notes,
                    installmentIds: selectedInstallments.map((i) => i.id),
                },
                {
                    headers: { Authorization: token ? `Bearer ${token}` : "" },
                }
            )

            setFormState((prev) => ({ ...prev, submitting: false, success: true }))
        } catch (err) {
            console.error("Error registrando cierre:", err)
            setFormState((prev) => ({ ...prev, submitting: false, error: true }))
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {formState.success && (
                <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Cierre registrado con éxito</AlertTitle>
                    <AlertDescription className="text-green-700">
                        El cierre de caja ha sido registrado correctamente en el sistema.
                    </AlertDescription>
                </Alert>
            )}

            {formState.error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Hubo un problema al registrar el cierre de caja. Por favor, intente nuevamente.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Campos de entrada */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <Label htmlFor="cashInRegister">Efectivo en Caja</Label>
                        <Input
                            id="cashInRegister"
                            type="number"
                            placeholder="0"
                            value={formState.cashInRegister}
                            onChange={(e) => handleInputChange("cashInRegister", e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="cashFromTransfers">Transferencias</Label>
                        <Input
                            id="cashFromTransfers"
                            type="number"
                            placeholder="0"
                            value={formState.cashFromTransfers}
                            onChange={(e) => handleInputChange("cashFromTransfers", e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="cashFromCards">Tarjetas</Label>
                        <Input
                            id="cashFromCards"
                            type="number"
                            placeholder="0"
                            value={formState.cashFromCards}
                            onChange={(e) => handleInputChange("cashFromCards", e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Resumen */}
                <div className="space-y-6">
                    <Card className="border-dashed">
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-4">Resumen del Cierre</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total de cuotas seleccionadas:</span>
                                    <span>{selectedInstallments.length}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                    <span>Total esperado:</span>
                                    <span>{formatCurrency(totalExpected)}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                    <span>Total registrado:</span>
                                    <span>{formatCurrency(totalRegistered)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold">
                                    <span>Diferencia:</span>
                                    <span
                                        className={
                                            totalDifference === 0
                                                ? "text-green-500"
                                                : totalDifference > 0
                                                    ? "text-green-500"
                                                    : "text-red-500"
                                        }
                                    >
                                        {formatCurrency(totalDifference)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <Label htmlFor="notes">Notas y Observaciones</Label>
                        <Textarea
                            id="notes"
                            placeholder="Ingrese cualquier observación relevante para el cierre de caja..."
                            value={formState.notes}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={!isFormValid}
                    className="w-full md:w-auto"
                >
                    {formState.submitting ? "Registrando..." : "Registrar Cierre de Caja"}
                </Button>
            </div>
        </form>
    )
}
