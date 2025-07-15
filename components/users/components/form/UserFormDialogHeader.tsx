import { Button } from "@/components/ui/button"
import { DialogTitle } from "@/components/ui/dialog"
import { X, UserCheck, UserPlus } from 'lucide-react'

interface DialogHeaderProps {
    isEditing: boolean
    onClose: () => void
}

export function DialogHeader({ isEditing, onClose }: DialogHeaderProps) {
    return (
        <>
            <div className="absolute top-4 right-4 z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-full h-8 w-8 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Cerrar</span>
                </Button>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-sky-500 p-6 flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                    {isEditing ? <UserCheck className="h-8 w-8 text-white" /> : <UserPlus className="h-8 w-8 text-white" />}
                </div>
                <div>
                    <DialogTitle className="text-xl font-bold text-white">
                        {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
                    </DialogTitle>
                    <p className="text-blue-100 text-sm">
                        {isEditing ? "Actualiza los datos del usuario" : "Ingresa los datos del nuevo usuario"}
                    </p>
                </div>
            </div>
        </>
    )
}
