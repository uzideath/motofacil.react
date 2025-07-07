"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { UserIcon, Bike, ChevronsUpDownIcon as ChevronUpDown } from "lucide-react"
import type { Control } from "react-hook-form"

type User = {
    id: string
    name: string
    identification: string
    phone: string
    address: string
    city: string
}

type Motorcycle = {
    id: string
    brand: string
    model: string
    plate: string
    price: number
}

interface LoanFormClientVehicleCardProps {
    control: Control<any>
    availableUsers: User[]
    availableMotorcycles: Motorcycle[]
    onMotorcycleChange: (motorcycleId: string) => void
    formatCurrency: (amount: number) => string
}

export function LoanFormClientVehicleCard({
    control,
    availableUsers,
    availableMotorcycles,
    onMotorcycleChange,
    formatCurrency,
}: LoanFormClientVehicleCardProps) {
    return (
        <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-primary" />
                    Información del Cliente y Vehículo
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={control}
                        name="userId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cliente</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between bg-background hover:bg-background/80 transition-colors h-10"
                                            >
                                                {field.value
                                                    ? availableUsers.find((user) => user.id === field.value)?.name || "Seleccionar cliente"
                                                    : "Seleccionar cliente"}
                                                <ChevronUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Buscar cliente por nombre..." />
                                            <CommandList>
                                                <CommandEmpty>
                                                    {availableUsers.length === 0
                                                        ? "No hay clientes disponibles. Todos están asignados a préstamos activos."
                                                        : "No se encontraron clientes."}
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {availableUsers.map((user) => (
                                                        <CommandItem key={user.id} value={user.name} onSelect={() => field.onChange(user.id)}>
                                                            <UserIcon className="mr-2 h-4 w-4" />
                                                            <div className="flex flex-col">
                                                                <span className={user.id === field.value ? "font-medium" : ""}>{user.name}</span>
                                                                <span className="text-xs text-muted-foreground">ID: {user.identification}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="motorcycleId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Motocicleta</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between bg-background hover:bg-background/80 transition-colors h-10"
                                            >
                                                {field.value
                                                    ? (() => {
                                                        const moto = availableMotorcycles.find((m) => m.id === field.value)
                                                        return moto ? `${moto.brand} ${moto.model} (${moto.plate})` : "Seleccionar motocicleta"
                                                    })()
                                                    : "Seleccionar motocicleta"}
                                                <ChevronUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[350px] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Buscar por marca, modelo o placa..." />
                                            <CommandList>
                                                <CommandEmpty>
                                                    {availableMotorcycles.length === 0
                                                        ? "No hay motocicletas disponibles. Todas están asignadas a préstamos activos."
                                                        : "No se encontraron motocicletas."}
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {availableMotorcycles.map((moto) => (
                                                        <CommandItem
                                                            key={moto.id}
                                                            value={`${moto.brand} ${moto.model} ${moto.plate}`}
                                                            onSelect={() => {
                                                                field.onChange(moto.id)
                                                                onMotorcycleChange(moto.id)
                                                            }}
                                                        >
                                                            <Bike className="mr-2 h-4 w-4" />
                                                            <div className="flex flex-col">
                                                                <span className={moto.id === field.value ? "font-medium" : ""}>
                                                                    {moto.brand} {moto.model} ({moto.plate})
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">{formatCurrency(moto.price)}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
