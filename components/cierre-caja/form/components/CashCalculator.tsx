"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Calculator, CheckCircle2, Banknote, Coins } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DenominationCount {
  bills_100000: number
  bills_50000: number
  bills_20000: number
  bills_10000: number
  bills_5000: number
  bills_2000: number
  bills_1000: number
  coins_500: number
  coins_200: number
  coins_100: number
}

interface CashCalculatorProps {
  expectedCash: number
  onCashCountChange: (totalCounted: number, isValid: boolean, counts: DenominationCount) => void
}

export function CashCalculator({ expectedCash, onCashCountChange }: CashCalculatorProps) {
  const [counts, setCounts] = useState<DenominationCount>({
    bills_100000: 0,
    bills_50000: 0,
    bills_20000: 0,
    bills_10000: 0,
    bills_5000: 0,
    bills_2000: 0,
    bills_1000: 0,
    coins_500: 0,
    coins_200: 0,
    coins_100: 0,
  })

  const denominations = [
    { key: 'bills_100000' as keyof DenominationCount, value: 100000, label: '$100.000', type: 'bill' },
    { key: 'bills_50000' as keyof DenominationCount, value: 50000, label: '$50.000', type: 'bill' },
    { key: 'bills_20000' as keyof DenominationCount, value: 20000, label: '$20.000', type: 'bill' },
    { key: 'bills_10000' as keyof DenominationCount, value: 10000, label: '$10.000', type: 'bill' },
    { key: 'bills_5000' as keyof DenominationCount, value: 5000, label: '$5.000', type: 'bill' },
    { key: 'bills_2000' as keyof DenominationCount, value: 2000, label: '$2.000', type: 'bill' },
    { key: 'bills_1000' as keyof DenominationCount, value: 1000, label: '$1.000', type: 'bill' },
    { key: 'coins_500' as keyof DenominationCount, value: 500, label: '$500', type: 'coin' },
    { key: 'coins_200' as keyof DenominationCount, value: 200, label: '$200', type: 'coin' },
    { key: 'coins_100' as keyof DenominationCount, value: 100, label: '$100', type: 'coin' },
  ]

  const calculateTotal = () => {
    return denominations.reduce((total, denom) => {
      return total + (counts[denom.key] * denom.value)
    }, 0)
  }

  const totalCounted = calculateTotal()
  const difference = totalCounted - expectedCash
  const isValid = Math.abs(difference) < 1 // Allow small rounding differences

  useEffect(() => {
    onCashCountChange(totalCounted, isValid, counts)
  }, [totalCounted, isValid, counts])

  const handleCountChange = (key: keyof DenominationCount, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0
    setCounts(prev => ({
      ...prev,
      [key]: Math.max(0, numValue)
    }))
  }

  const bills = denominations.filter(d => d.type === 'bill')
  const coins = denominations.filter(d => d.type === 'coin')

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-primary" />
          Calculadora de Efectivo
        </CardTitle>
        <CardDescription>
          Cuenta facil: Ingrese la cantidad de billetes y monedas
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Expected Cash */}
        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium text-muted-foreground">Efectivo esperado:</span>
          <span className="text-lg font-bold text-foreground">{formatCurrency(expectedCash)}</span>
        </div>

        {/* Bills Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Banknote className="h-4 w-4" />
            <span>Billetes</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {bills.map(denom => {
              const subtotal = counts[denom.key] * denom.value
              return (
                <div key={denom.key} className="space-y-1.5">
                  <Label htmlFor={denom.key} className="text-xs font-medium flex justify-between">
                    <span>{denom.label}</span>
                    {counts[denom.key] > 0 && (
                      <span className="text-muted-foreground">{formatCurrency(subtotal)}</span>
                    )}
                  </Label>
                  <Input
                    id={denom.key}
                    type="number"
                    min="0"
                    value={counts[denom.key] || ''}
                    onChange={(e) => handleCountChange(denom.key, e.target.value)}
                    className="h-9 text-sm"
                    placeholder="0"
                  />
                </div>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Coins Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Coins className="h-4 w-4" />
            <span>Monedas</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {coins.map(denom => {
              const subtotal = counts[denom.key] * denom.value
              return (
                <div key={denom.key} className="space-y-1.5">
                  <Label htmlFor={denom.key} className="text-xs font-medium flex justify-between">
                    <span>{denom.label}</span>
                    {counts[denom.key] > 0 && (
                      <span className="text-muted-foreground">{formatCurrency(subtotal)}</span>
                    )}
                  </Label>
                  <Input
                    id={denom.key}
                    type="number"
                    min="0"
                    value={counts[denom.key] || ''}
                    onChange={(e) => handleCountChange(denom.key, e.target.value)}
                    className="h-9 text-sm"
                    placeholder="0"
                  />
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-col space-y-3 pt-3 border-t border-border">
        {/* Total Counted */}
        <div className="w-full flex justify-between items-center p-3 bg-primary/10 rounded-lg">
          <span className="text-sm font-semibold text-foreground">Total contado:</span>
          <span className="text-xl font-bold text-primary">{formatCurrency(totalCounted)}</span>
        </div>

        {/* Difference Alert */}
        {totalCounted > 0 && (
          <Alert variant={isValid ? "default" : "destructive"} className="py-3">
            <div className="flex items-center gap-2">
              {isValid ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Diferencia:</span>
                  <span className={cn(
                    "text-lg font-bold",
                    difference === 0 ? "text-green-600" :
                    difference > 0 ? "text-blue-600" :
                    "text-destructive"
                  )}>
                    {formatCurrency(Math.abs(difference))}
                    {difference > 0 ? " (sobra)" : difference < 0 ? " (falta)" : ""}
                  </span>
                </div>
                {isValid && difference === 0 && (
                  <p className="text-xs text-green-600 mt-1">¡Perfecto! El conteo coincide con el esperado.</p>
                )}
                {!isValid && (
                  <p className="text-xs mt-1">
                    El efectivo contado no coincide con las transacciones registradas.
                  </p>
                )}
              </div>
            </div>
          </Alert>
        )}

        {totalCounted === 0 && expectedCash > 0 && (
          <Alert className="py-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Por favor, cuente el efectivo físico e ingrese las cantidades arriba.
            </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  )
}
