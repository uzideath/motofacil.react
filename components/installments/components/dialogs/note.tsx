"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, X } from "lucide-react"

interface NotesDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    notes: string
    title?: string
}

export function NotesDialog({ isOpen, onOpenChange, notes, title = "Notas" }: NotesDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-dark-blue-950 border-dark-blue-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-400" />
                        {title}
                    </DialogTitle>
                    <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Cerrar</span>
                    </DialogClose>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-blue-200">{notes}</div>
                <div className="flex justify-end">
                    <DialogClose asChild>
                        <Button variant="outline" className="border-dark-blue-700 hover:bg-dark-blue-800">
                            Cerrar
                        </Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    )
}
