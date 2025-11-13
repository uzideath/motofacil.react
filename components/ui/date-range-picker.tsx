"use client"

import * as React from "react"
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({ className, date: controlledDate, onDateChange }: DatePickerWithRangeProps) {
  const [internalDate, setInternalDate] = React.useState<DateRange | undefined>(undefined)
  const [isOpen, setIsOpen] = React.useState(false)

  // Use controlled date if provided, otherwise use internal state
  const date = controlledDate !== undefined ? controlledDate : internalDate
  const setDate = (newDate: DateRange | undefined) => {
    if (onDateChange) {
      onDateChange(newDate)
    } else {
      setInternalDate(newDate)
    }
  }

  // Quick preset handlers
  const handlePreset = (preset: 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'thisYear') => {
    const today = new Date()
    let range: DateRange | undefined

    switch (preset) {
      case 'today':
        range = { from: today, to: today }
        break
      case 'yesterday':
        const yesterday = subDays(today, 1)
        range = { from: yesterday, to: yesterday }
        break
      case 'last7':
        range = { from: subDays(today, 6), to: today }
        break
      case 'last30':
        range = { from: subDays(today, 29), to: today }
        break
      case 'thisMonth':
        range = { from: startOfMonth(today), to: endOfMonth(today) }
        break
      case 'thisYear':
        range = { from: startOfYear(today), to: endOfYear(today) }
        break
    }

    setDate(range)
    setIsOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd 'de' MMM, yyyy", { locale: es })} - {format(date.to, "dd 'de' MMM, yyyy", { locale: es })}
                </>
              ) : (
                format(date.from, "dd 'de' MMM, yyyy", { locale: es })
              )
            ) : (
              <span>Seleccionar rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Quick Presets Sidebar */}
            <div className="flex flex-col gap-1 p-3 border-r border-border bg-muted/30">
              <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">Accesos rápidos</div>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-xs h-8"
                onClick={() => handlePreset('today')}
              >
                Hoy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-xs h-8"
                onClick={() => handlePreset('yesterday')}
              >
                Ayer
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-xs h-8"
                onClick={() => handlePreset('last7')}
              >
                Últimos 7 días
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-xs h-8"
                onClick={() => handlePreset('last30')}
              >
                Últimos 30 días
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-xs h-8"
                onClick={() => handlePreset('thisMonth')}
              >
                Este mes
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-xs h-8"
                onClick={() => handlePreset('thisYear')}
              >
                Este año
              </Button>
            </div>
            
            {/* Calendar */}
            <div className="p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from || new Date()}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                disabled={(date) => date > new Date()}
                locale={es}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
