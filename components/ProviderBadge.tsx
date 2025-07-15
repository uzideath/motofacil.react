import React from "react"
import { Badge } from "@/components/ui/badge"
import { Bike } from "lucide-react"
import { formatProviderName } from "@/lib/utils"

interface ProviderBadgeProps {
    provider: string // nombre técnico o raw (ej: "MOTOFACIL", "OBRASOCIAL", etc.)
}

// Generador de colores únicos basados en el nombre del proveedor
function stringToColor(str: string) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const color = Math.floor(
        Math.abs((Math.sin(hash) * 10000) % 1) * 16777215
    ).toString(16)
    return `#${color.padStart(6, "0")}`
}

export const ProviderBadge: React.FC<ProviderBadgeProps> = ({ provider }) => {
    const color = stringToColor(provider)
    const formatted = formatProviderName(provider)

    return (
        <Badge
            variant="outline"
            className="px-3 py-1 text-sm flex items-center justify-center gap-1"
            style={{
                backgroundColor: `${color}22`, // 13% opacidad
                color: color,
                borderColor: color,
            }}
            title={formatted}
        >
            <Bike className="h-4 w-4" />
            {formatted}
        </Badge>
    )
}
