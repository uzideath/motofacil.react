"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { HttpService } from "@/lib/http"
import type { DateRange } from "react-day-picker"
import { Installment } from "../utils/types"

export function useInstallments(onRefreshCallback?: (refreshFn: () => void) => void) {
    const [installments, setInstallments] = useState<Installment[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const { toast } = useToast()

    const fetchInstallments = async (dateRange?: DateRange) => {
        try {
            setLoading(true)

            // Construir la URL con los parámetros de fecha si existen
            let url = "/api/v1/installments"
            const params = new URLSearchParams()

            if (dateRange?.from) {
                params.append("startDate", dateRange.from.toISOString().split("T")[0])
            }
            if (dateRange?.to) {
                params.append("endDate", dateRange.to.toISOString().split("T")[0])
            }

            if (params.toString()) {
                url += `?${params.toString()}`
            }

            const res = await HttpService.get(url)
            const rawData = res.data

            const mapped: Installment[] = rawData.map((item: any) => ({
                id: item.id,
                loanId: item.loanId,
                userName: item.loan?.user?.name ?? "Desconocido",
                motorcycleModel: item.loan?.motorcycle?.model ?? "Desconocido",
                amount: item.amount,
                gps: item.gps,
                date: item.paymentDate,
                isLate: item.isLate,
                latePaymentDate: item.latePaymentDate,
                paymentMethod: item.paymentMethod ?? "CASH",
                createdBy: item.createdBy ?? null,
                attachmentUrl: item.attachmentUrl ?? null,
                loan: item.loan,
                motorcycle: item.loan?.motorcycle,
            }))

            // Sort by date descending by default
            const sortedData = [...mapped].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

            setInstallments(sortedData)
        } catch (error) {
            console.error("Error al obtener cuotas:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron obtener las cuotas del servidor",
            })
        } finally {
            setLoading(false)
        }
    }

    const refreshInstallments = () => {
        setRefreshTrigger((prev) => prev + 1)
    }

    useEffect(() => {
        fetchInstallments()
    }, [refreshTrigger])

    useEffect(() => {
        if (onRefreshCallback) {
            onRefreshCallback(refreshInstallments)
        }
    }, [onRefreshCallback])

    return {
        installments,
        setInstallments,
        loading,
        fetchInstallments,
        refreshInstallments,
    }
}
