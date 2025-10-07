"use client"

import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"

interface FormActionsProps {
    loading: boolean
    isEditing: boolean
    onCancel: () => void
}

export function FormActions({ loading, isEditing, onCancel }: FormActionsProps) {
    return (
        <div className="flex justify-end gap-4 pt-2">
            <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/30 bg-transparent"
            >
                Cancelar
            </Button>
            <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white shadow-md hover:shadow-lg transition-all"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditing ? "Actualizando..." : "Creando..."}
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditing ? "Actualizar" : "Guardar"}
                    </>
                )}
            </Button>
        </div>
    )
}

