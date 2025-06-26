import type React from "react"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Bike, Building, Percent } from "lucide-react"
import { Providers } from "../types"
import { formatProviderName } from "../utils"

interface ProviderDisplayProps {
    provider?: string
}

export const ProviderDisplay: React.FC<ProviderDisplayProps> = ({ provider }) => {
    if (!provider) {
        return (
            <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-md">
                <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    No hay proveedor seleccionado. Seleccione transacciones para continuar.
                </p>
            </div>
        )
    }

    return (
        <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">Proveedor seleccionado:</p>
            <Badge
                className={`px-3 py-1 text-sm ${provider === Providers.MOTOFACIL
                        ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300"
                        : provider === Providers.OBRASOCIAL
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            : "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
                    }`}
                variant="outline"
            >
                {provider === Providers.MOTOFACIL && <Bike className="h-4 w-4 mr-1.5" />}
                {provider === Providers.OBRASOCIAL && <Building className="h-4 w-4 mr-1.5" />}
                {provider === Providers.PORCENTAJETITO && <Percent className="h-4 w-4 mr-1.5" />}
                {formatProviderName(provider)}
            </Badge>
        </div>
    )
}
