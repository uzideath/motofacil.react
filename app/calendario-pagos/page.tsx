import { CalendarPayments } from "@/components/calendar/CalendarPayments"
import { MobileSidebar } from "@/components/mobile-sidebar"

export default function CalendarPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Calendario de Pagos</h2>
          <p className="text-muted-foreground">Visualiza los pagos de cada préstamo en el calendario</p>
        </div>
        <div className="flex items-center space-x-2">
          <MobileSidebar />
        </div>
      </div>
      <CalendarPayments />
    </div>
  )
}
