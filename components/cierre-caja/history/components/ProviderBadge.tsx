import React from "react"
import { Badge } from "@/components/ui/badge"
import { Bike, Building, Percent, FileText } from 'lucide-react'
import { Providers } from "../types";
import { formatProviderName } from "../utils";


const providerMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    [Providers.MOTOFACIL]: {
        label: "Moto Facil",
        color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/30",
        icon: <Bike className="h-3 w-3" />,
    },
    [Providers.OBRASOCIAL]: {
        label: "Obra Social",
        color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30",
        icon: <Building className="h-3 w-3" />,
    },
    [Providers.PORCENTAJETITO]: {
        label: "Porcentaje Tito",
        color: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800/30",
        icon: <Percent className="h-3 w-3" />,
    },
}

interface ProviderBadgeProps {
    provider?: string
}

export const ProviderBadge: React.FC<ProviderBadgeProps> = ({ provider }) => {
    if (!provider) {
        return <span className="text-muted-foreground text-sm">—</span>
    }

    return (
        <Badge
            className={`flex items-center justify-center gap-1.5 text-sm px-3 py-1 rounded-full ${providerMap[provider]?.color || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                }`}
            variant="outline"
        >
            {providerMap[provider]?.icon || <FileText className="h-3 w-3" />}
            <span>{formatProviderName(provider)}</span>
        </Badge>
    )
}
