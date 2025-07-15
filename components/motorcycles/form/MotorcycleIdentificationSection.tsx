import { Card, CardContent } from "@/components/ui/card"

import type { Control } from "react-hook-form"
import { MotorcycleFormValues } from "../hooks/useMotorcycleForm"
import { MotorcycleFormField } from "./MotorcycleFormField"
import { ProviderSelectField } from "./ProviderSelectField"


interface IdentificationSectionProps {
    control: Control<MotorcycleFormValues>
}

export function IdentificationSection({ control }: IdentificationSectionProps) {
    return (
        <Card className="border border-blue-100 dark:border-blue-900/30 shadow-sm">
            <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    Identificación y seguimiento
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <MotorcycleFormField
                        control={control}
                        name="chassis"
                        label="Número de Chasis"
                        placeholder="Chasis"
                        description="Número de identificación único del chasis"
                        className="font-mono uppercase"
                    />

                    <MotorcycleFormField
                        control={control}
                        name="gps"
                        label="GPS"
                        placeholder="Código GPS"
                        description="Código del dispositivo GPS instalado"
                        type="number"
                    />
                </div>
                <div className="mt-6">
                    <ProviderSelectField control={control} name="providerId" />
                </div>
            </CardContent>
        </Card>
    )
}
