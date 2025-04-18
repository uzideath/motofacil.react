"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

type PaymentEvent = {
  date: Date
  amount: number
  client: string
  status: "pending" | "paid" | "late"
}

export function PaymentCalendar() {
  const [isMounted, setIsMounted] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState<PaymentEvent[]>([])

  useEffect(() => {
    setIsMounted(true)

    // Generar eventos de ejemplo para los próximos 7 días
    const today = new Date()
    const sampleEvents: PaymentEvent[] = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      // Generar entre 0 y 3 eventos por día
      const numEvents = Math.floor(Math.random() * 4)

      for (let j = 0; j < numEvents; j++) {
        const clients = ["Carlos Rodríguez", "María López", "Juan Pérez", "Ana Gómez", "Pedro Martínez"]
        const statuses: ("pending" | "paid" | "late")[] = ["pending", "paid", "late"]

        sampleEvents.push({
          date: new Date(date),
          amount: Math.floor(Math.random() * 500000) + 300000,
          client: clients[Math.floor(Math.random() * clients.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
        })
      }
    }

    setEvents(sampleEvents)
  }, [])

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )
  }

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : []

  // Función para determinar si una fecha tiene eventos
  const hasEvents = (date: Date) => {
    return events.some(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )
  }

  // Función para obtener el color del badge según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500"
      case "paid":
        return "bg-green-500"
      case "late":
        return "bg-red-500"
      default:
        return ""
    }
  }

  // Función para obtener el texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "paid":
        return "Pagado"
      case "late":
        return "Atrasado"
      default:
        return status
    }
  }

  if (!isMounted) {
    return <div className="h-[250px] flex items-center justify-center">Cargando calendario...</div>
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="md:w-1/2">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
          modifiers={{
            hasEvent: (date) => hasEvents(date),
          }}
          modifiersClassNames={{
            hasEvent:
              "font-bold text-primary relative before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-1 before:h-1 before:bg-primary before:rounded-full",
          }}
        />
      </div>
      <div className="md:w-1/2">
        <h3 className="font-medium mb-2">
          {selectedDate ? (
            <>Pagos para {selectedDate.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}</>
          ) : (
            "Seleccione una fecha"
          )}
        </h3>

        {selectedEvents.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay pagos programados para esta fecha.</p>
        ) : (
          <div className="space-y-2">
            {selectedEvents.map((event, index) => (
              <Card key={index} className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{event.client}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(event.amount)}</p>
                  </div>
                  <Badge className={getStatusColor(event.status)}>{getStatusText(event.status)}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
