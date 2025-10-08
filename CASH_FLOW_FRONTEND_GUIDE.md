# Cash Flow Frontend Implementation - Complete Guide

## ✅ Files Created

### Core Types & Services
1. **lib/types/cash-flow.ts** - All TypeScript interfaces and enums
2. **lib/services/cash-flow.service.ts** - HTTP service for API calls
3. **components/cash-flow/utils/index.ts** - Utility functions for formatting and labels

### Pages
4. **app/flujo-efectivo/page.tsx** - Main cash flow page with tabs

### Hooks
5. **components/cash-flow/hooks/useAccounts.tsx** - Accounts data management
6. **components/cash-flow/hooks/useTransactions.tsx** - Transactions data management
7. **components/cash-flow/hooks/useTransfers.tsx** - Transfers data management
8. **components/cash-flow/hooks/useRules.tsx** - Rules data management

### Tab Components
9. **components/cash-flow/tabs/AccountsTab.tsx** - Accounts tab
10. **components/cash-flow/tabs/TransactionsTab.tsx** - Transactions tab
11. **components/cash-flow/tabs/TransfersTab.tsx** - Transfers tab
12. **components/cash-flow/tabs/RulesTab.tsx** - Rules tab
13. **components/cash-flow/tabs/ReportsTab.tsx** - Reports tab

### Tables
14. **components/cash-flow/tables/AccountsTable.tsx** - Accounts table with CRUD

## 📝 Remaining Files Needed

To complete the implementation, you need to create these files following the same patterns as your existing project:

### Forms (create in `components/cash-flow/forms/`)
- **AccountForm.tsx** - Form dialog to create/edit accounts (follow LoanForm.tsx pattern)
- **TransactionForm.tsx** - Form dialog for transactions
- **TransferForm.tsx** - Form dialog for transfers  
- **RuleForm.tsx** - Form dialog for rules

### Tables (create in `components/cash-flow/tables/`)
- **TransactionsTable.tsx** - Similar to VehicleTable.tsx
- **TransfersTable.tsx** - List of transfers
- **RulesTable.tsx** - List of rules with actions

### Filters (create in `components/cash-flow/filters/`)
- **TransactionFilters.tsx** - Date range, category, amount filters

### Stats (create in `components/cash-flow/stats/`)
- **AccountStats.tsx** - Dashboard cards showing total balance, accounts count, etc.

### Reports (create in `components/cash-flow/reports/`)
- **CashFlowStatementReport.tsx** - Generate and download cash flow statements
- **ForecastReport.tsx** - Generate 13-week forecasts

## 🎨 Design Patterns to Follow

### Form Pattern (AccountForm example)
```tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { CashFlowService } from "@/lib/services/cash-flow.service"
import { useToast } from "@/hooks/useToast"
import type { CashFlowAccount, CreateAccountDto } from "@/lib/types/cash-flow"
import { CashFlowAccountType } from "@/lib/types/cash-flow"
import { getAccountTypeLabel } from "../utils"

interface AccountFormProps {
  children: React.ReactNode
  accountData?: CashFlowAccount
  onSuccess?: () => void
}

export function AccountForm({ children, accountData, onSuccess }: AccountFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  const form = useForm<CreateAccountDto>({
    defaultValues: accountData || {
      name: "",
      accountType: CashFlowAccountType.BANK,
      currency: "DOP",
      description: "",
    }
  })

  const onSubmit = async (data: CreateAccountDto) => {
    try {
      setLoading(true)
      if (accountData) {
        await CashFlowService.updateAccount(accountData.id, data)
        toast({ title: "Cuenta actualizada exitosamente" })
      } else {
        await CashFlowService.createAccount(data)
        toast({ title: "Cuenta creada exitosamente" })
      }
      setIsOpen(false)
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Ocurrió un error"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{children}</div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{accountData ? "Editar Cuenta" : "Nueva Cuenta"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: Cuenta Banco Popular" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Cuenta *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CashFlowAccountType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {getAccountTypeLabel(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moneda</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DOP">DOP (Peso Dominicano)</SelectItem>
                        <SelectItem value="USD">USD (Dólar)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Descripción opcional" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : accountData ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

### Table Pattern
Follow the structure of `AccountsTable.tsx` already created - includes:
- Loading skeletons
- Empty states
- Edit/Delete actions
- AlertDialog for confirmations
- Proper formatting with utilities

### Stats Pattern (AccountStats example)
```tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react"
import type { CashFlowAccount } from "@/lib/types/cash-flow"
import { formatCurrency } from "../utils"
import { Skeleton } from "@/components/ui/skeleton"

interface AccountStatsProps {
  accounts: CashFlowAccount[]
  loading: boolean
}

export function AccountStats({ accounts, loading }: AccountStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  const activeAccounts = accounts.filter(a => a.isActive).length
  const positiveAccounts = accounts.filter(a => a.balance > 0).length
  const negativeAccounts = accounts.filter(a => a.balance < 0).length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cuentas Activas</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeAccounts}</div>
          <p className="text-xs text-muted-foreground">de {accounts.length} totales</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Con Balance Positivo</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{positiveAccounts}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Con Balance Negativo</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{negativeAccounts}</div>
        </CardContent>
      </Card>
    </div>
  )
}
```

## 🔧 Key Implementation Notes

1. **API Endpoints**: All endpoints are under `/api/v1/cash-flow/`
2. **Authentication**: Handled automatically by HttpService with JWT tokens
3. **Error Handling**: All services use try-catch with toast notifications
4. **Loading States**: Use `loading` for initial load, `refreshing` for updates
5. **Idempotency**: Use `generateIdempotencyKey()` utility for transactions/transfers

## 📊 Reports Implementation

For reports, generate forms that collect parameters then call:
- `CashFlowService.getCashFlowStatement(params)` 
- `CashFlowService.getForecast(params)`

When format is CSV/PDF, the service returns a Blob - use `downloadFile()` utility:

```tsx
const blob = await CashFlowService.getCashFlowStatement({
  startDate: "2025-01-01",
  endDate: "2025-01-31",
  format: "PDF"
}) as Blob

downloadFile(blob, `cash-flow-statement-${Date.now()}.pdf`)
```

## 🎯 Next Steps

1. Create the remaining form components (AccountForm, TransactionForm, etc.)
2. Create the remaining table components  
3. Create filters, stats, and report components
4. Test all CRUD operations
5. Add navigation link in your sidebar
6. Test export functionality

## 📚 Reference Your Existing Files

- **Forms**: See `components/loans/LoanForm.tsx`, `components/expenses/ExpenseForm.tsx`
- **Tables**: See `components/vehicles/VehicleTable.tsx`
- **Hooks**: See `components/vehicles/hooks/useVehicleTable.tsx`
- **Filters**: See similar patterns in your existing components

All components follow your existing design system and patterns!
