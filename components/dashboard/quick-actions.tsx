"use client"
import { Card } from "@/components/ui/card"
import { CreditCard, DollarSign, FileText, Plus, Printer, User } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      icon: <User className="h-5 w-5" />,
      label: "Nuevo Usuario",
      href: "/usuarios",
      color: "bg-blue-500",
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: "Nuevo Préstamo",
      href: "/prestamos",
      color: "bg-green-500",
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      label: "Registrar Pago",
      href: "/cuotas",
      color: "bg-amber-500",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Generar Reporte",
      href: "/reportes",
      color: "bg-purple-500",
    },
    {
      icon: <Printer className="h-5 w-5" />,
      label: "Imprimir Recibo",
      href: "#",
      color: "bg-indigo-500",
    },
    {
      icon: <Plus className="h-5 w-5" />,
      label: "Más Acciones",
      href: "#",
      color: "bg-gray-500",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, index) => (
        <Link href={action.href} key={index}>
          <Card className="p-4 flex flex-col items-center justify-center h-[100px] text-center hover:shadow-md transition-all cursor-pointer card-hover-effect">
            <div className={`${action.color} text-white p-2 rounded-full mb-2`}>{action.icon}</div>
            <span className="text-sm font-medium">{action.label}</span>
          </Card>
        </Link>
      ))}
    </div>
  )
}
