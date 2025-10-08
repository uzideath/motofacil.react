import { CalendarPayments } from "@/components/calendar/CalendarPayments"
import { MobileSidebar } from "@/components/mobile-sidebar"

export default function CalendarPage() {
  return (
    <div className="flex-1 w-full h-screen overflow-hidden flex flex-col">
      <div className="bg-primary text-primary-foreground p-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Calendario de Pagos</h1>
            <p className="text-primary-foreground/80 text-sm">Visualiza los pagos de cada préstamo en el calendario</p>
          </div>
          <div className="flex items-center space-x-2">
            <MobileSidebar />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <CalendarPayments />
      </div>
    </div>
  )
}
