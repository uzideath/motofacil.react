import { Card, CardContent } from "@/components/ui/card"
import type { Control } from "react-hook-form"
import { MotorcycleFormValues } from "../hooks/useMotorcycleForm"
import { MotorcycleFormField } from "./MotorcycleFormField"


interface BasicInfoSectionProps {
    control: Control<MotorcycleFormValues>
}

export function BasicInfoSection({ control }: BasicInfoSectionProps) {
    return (
        <Card className="border border-blue-100 dark:border-blue-900/30 shadow-sm">
            <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    Información básica
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <MotorcycleFormField
                        control={control}
                        name="brand"
                        label="Marca"
                        placeholder="Marca de la motocicleta"
                        description="Ej: Honda, Yamaha, Suzuki"
                    />

                    <MotorcycleFormField
                        control={control}
                        name="model"
                        label="Modelo"
                        placeholder="Modelo de la motocicleta"
                        description="Ej: CBR 600, YZF-R6"
                    />

                    <MotorcycleFormField
                        control={control}
                        name="plate"
                        label="Placa"
                        placeholder="Placa de la motocicleta"
                        description="Formato: ABC123"
                        className="uppercase"
                    />
                </div>
            </CardContent>
        </Card>
    )
}
