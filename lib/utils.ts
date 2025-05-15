import { toast } from "@/components/ui/use-toast";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  console.log(dateString);
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function getInterest(capital: number, tasaAnual: number, numeroPeriodos: number) {
  const tasaPorPeriodo = tasaAnual / numeroPeriodos;
  return (capital * tasaPorPeriodo) / (1 - Math.pow(1 + tasaPorPeriodo, -numeroPeriodos))
}