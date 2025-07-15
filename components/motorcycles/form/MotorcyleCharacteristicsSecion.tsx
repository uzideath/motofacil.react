import { Card, CardContent } from "@/components/ui/card"

import type { Control } from "react-hook-form"
import { MotorcycleFormValues } from "../hooks/useMotorcycleForm"
import { MotorcycleFormField } from "./MotorcycleFormField"

interface CharacteristicsSectionProps {
    control: Control<MotorcycleFormValues>
}

export function CharacteristicsSection({ control }: CharacteristicsSectionProps) {
    return (
        <Card className="border border-blue-100 dark:border-blue-900/30 shadow-sm">
            <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    Características
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <MotorcycleFormField
                        control={control}
                        name="color"
                        label="Color"
                        placeholder="Color de la motocicleta"
                        description="Ej: Rojo, Negro, Azul"
                    />

                    <MotorcycleFormField
                        control={control}
                        name="cc"
                        label="Cilindraje (cc)"
                        placeholder="Ej: 150"
                        description="Capacidad del motor en centímetros cúbicos"
                        type="number"
                    />

                    <MotorcycleFormField
                        control={control}
                        name="engine"
                        label="Número de Motor"
                        placeholder="Ej: HA11EPR9M01101"
                        description="Número de identificación único del motor"
                        className="font-mono uppercase"
                    />
                </div>
            </CardContent>
        </Card>
    )
}
