"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/hooks/use-auth"
import { HttpService } from "@/lib/http"
import type { FormState, SelectedTransaction } from "../types"
import {
    getProviderFromTransactions,
    calculateFormValues,
    calculateTransactionTotals,
    calculateAutoFillValues,
} from "../utils"

const initialFormState: FormState = {
    cashInRegister: "",
    cashFromTransfers: "",
    cashFromCards: "",
    notes: "",
    submitting: false,
    success: false,
    error: false,
    errorMessage: "",
}

export const useCashRegisterForm = (selectedTransactions: SelectedTransaction[]) => {
    const [formState, setFormState] = useState<FormState>(initialFormState)
    const [currentProvider, setCurrentProvider] = useState<string | undefined>(undefined)
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const { user } = useAuth()

    const { incomes, expenses, totalExpected, totalExpenses } = useMemo(
        () => calculateTransactionTotals(selectedTransactions),
        [selectedTransactions],
    )

    const calculations = useMemo(() => {
        const formCalcs = calculateFormValues(formState)
        const totalDifference = formCalcs.totalRegistered - totalExpected

        return {
            ...formCalcs,
            totalExpected,
            totalExpenses,
            totalDifference,
        }
    }, [formState, totalExpected, totalExpenses])

    const isFormValid = useMemo(() => {
        return !formState.submitting && incomes.length > 0 && calculations.hasAnyValue
    }, [formState.submitting, incomes.length, calculations.hasAnyValue])

    const isReadOnly = incomes.length > 0

    // Auto-fill form when transactions change
    useEffect(() => {
        if (incomes.length > 0) {
            const provider = getProviderFromTransactions(selectedTransactions)
            setCurrentProvider(provider)

            const { cash, transfers, cards } = calculateAutoFillValues(incomes)

            setFormState((prev) => ({
                ...prev,
                cashInRegister: cash.toString(),
                cashFromTransfers: transfers.toString(),
                cashFromCards: cards.toString(),
                success: false,
                error: false,
            }))
        } else {
            setCurrentProvider(undefined)
        }
    }, [incomes, selectedTransactions])

    const handleInputChange = (field: keyof FormState, value: string) => {
        setFormState((prev) => ({
            ...prev,
            [field]: value,
            success: false,
            error: false,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormState((prev) => ({ ...prev, submitting: true, success: false, error: false }))

        try {
            await HttpService.post("/api/v1/closing", {
                cashInRegister: calculations.cashInRegister,
                cashFromTransfers: calculations.cashFromTransfers,
                cashFromCards: calculations.cashFromCards,
                notes: formState.notes,
                installmentIds: incomes.map((i) => i.id),
                expenseIds: expenses.map((e) => e.id),
                createdById: user?.id,
                provider: currentProvider,
            })

            setFormState((prev) => ({
                ...prev,
                submitting: false,
                success: true,
            }))
            setShowSuccessDialog(true)
        } catch (err) {
            console.error("Error registrando cierre:", err)
            setFormState((prev) => ({
                ...prev,
                submitting: false,
                error: true,
                errorMessage: err instanceof Error ? err.message : "Error desconocido",
            }))
        }
    }

    const resetForm = () => {
        setFormState(initialFormState)
        setShowSuccessDialog(false)
    }

    return {
        formState,
        currentProvider,
        showSuccessDialog,
        incomes,
        expenses,
        calculations,
        isFormValid,
        isReadOnly,
        handleInputChange,
        handleSubmit,
        resetForm,
        setShowSuccessDialog,
    }
}
