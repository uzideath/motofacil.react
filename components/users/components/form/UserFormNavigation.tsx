"use client"

import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"

interface FormNavigationProps {
    activeTab: string
    loading: boolean
    isEditing: boolean
    onNext: () => void
    onPrevious: () => void
}

export function FormNavigation({ activeTab, loading, isEditing, onNext, onPrevious }: FormNavigationProps) {
    if (activeTab === "personal") {
        return (
            <div className="flex justify-between mt-6">
                <div></div>
                <Button
                    type="button"
                    onClick={onNext}
                    className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white"
                >
                    Siguiente
                </Button>
            </div>
        )
    }

    return (
        <div className="flex justify-between mt-6">
            <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/30 bg-transparent"
            >
                Anterior
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
