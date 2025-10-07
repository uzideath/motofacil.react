"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { HttpService } from "@/lib/http"

type Payment = {
  id: string
  loanId: string
  amount: number
  gps: number
  paymentDate: string
  isLate: boolean
  latePaymentDate: string | null
  notes: string | null
  paymentMethod: string
  loan: {
    id: string
    user: {
      name: string
      identification: string
      phone: string
    }
    vehicle: {
      model: string
      plate: string
      brand: string
    }
    contractNumber: string | null
  }
}

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

export function useCalendarPayments() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null)
  const [loans, setLoans] = useState<Loan[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  // Fetch all loans
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((c) => c.startsWith("authToken="))
          ?.split("=")[1]

        const response = await HttpService.get<any[]>("/api/v1/loans", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        })

        const mappedLoans: Loan[] = response.data.map((loan) => ({
          id: loan.id,
          contractNumber: loan.contractNumber,
          user: {
            name: loan.user?.name ?? "Sin nombre",
            identification: loan.user?.identification ?? "",
          },
          vehicle: {
            model: loan.vehicle?.model ?? "Sin modelo",
            plate: loan.vehicle?.plate ?? "Sin placa",
            brand: loan.vehicle?.brand ?? "Sin marca",
          },
        }))

        setLoans(mappedLoans)
      } catch (error) {
        console.error("Error al obtener préstamos:", error)
        toast({
          variant: "destructive",
          title: "Error al cargar datos",
          description: "No se pudieron obtener los préstamos",
        })
      }
    }

    fetchLoans()
  }, [toast])

  // Fetch payments for selected loan and month
  useEffect(() => {
    const fetchPayments = async () => {
      if (!selectedLoan) {
        setPayments([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const token = document.cookie
          .split("; ")
          .find((c) => c.startsWith("authToken="))
          ?.split("=")[1]

        const response = await HttpService.get<any>(`/api/v1/installments?loanId=${selectedLoan}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        })

        // The API returns { data: [...], pagination: {...} }
        const installments = response.data?.data || response.data || []

        const mappedPayments: Payment[] = installments.map((payment: any) => ({
          id: payment.id,
          loanId: payment.loanId,
          amount: payment.amount,
          gps: payment.gps || 0,
          paymentDate: payment.paymentDate,
          isLate: payment.isLate || false,
          latePaymentDate: payment.latePaymentDate,
          notes: payment.notes,
          paymentMethod: payment.paymentMethod || "CASH",
          loan: {
            id: payment.loan?.id ?? selectedLoan,
            user: {
              name: payment.loan?.user?.name ?? "Sin nombre",
              identification: payment.loan?.user?.identification ?? "",
              phone: payment.loan?.user?.phone ?? "",
            },
            vehicle: {
              model: payment.loan?.vehicle?.model ?? "Sin modelo",
              plate: payment.loan?.vehicle?.plate ?? "Sin placa",
              brand: payment.loan?.vehicle?.brand ?? "Sin marca",
            },
            contractNumber: payment.loan?.contractNumber,
          },
        }))

        setPayments(mappedPayments)
      } catch (error) {
        console.error("Error al obtener pagos:", error)
        toast({
          variant: "destructive",
          title: "Error al cargar pagos",
          description: "No se pudieron obtener los pagos del préstamo",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [selectedLoan, toast])

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleDayClick = (date: Date) => {
    const dayPayments = payments.filter((payment) => {
      const paymentDate = new Date(payment.paymentDate)
      return (
        paymentDate.getDate() === date.getDate() &&
        paymentDate.getMonth() === date.getMonth() &&
        paymentDate.getFullYear() === date.getFullYear()
      )
    })

    if (dayPayments.length > 0) {
      setSelectedPayment(dayPayments[0]) // Show first payment if multiple
      setDialogOpen(true)
    }
  }

  const filteredLoans = loans.filter((loan) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      loan.vehicle.plate.toLowerCase().includes(search) ||
      loan.vehicle.model.toLowerCase().includes(search) ||
      loan.vehicle.brand.toLowerCase().includes(search) ||
      loan.user.name.toLowerCase().includes(search) ||
      loan.user.identification.toLowerCase().includes(search)
    )
  })

  return {
    currentDate,
    selectedLoan,
    loans: filteredLoans,
    payments,
    loading,
    selectedPayment,
    dialogOpen,
    searchTerm,
    setSearchTerm,
    setSelectedLoan,
    setCurrentDate,
    handlePreviousMonth,
    handleNextMonth,
    handleToday,
    handleDayClick,
    setDialogOpen,
  }
}
