"use client"

import type React from "react"
import { useState } from "react"
import { Form, FormItem, FormLabel, FormDescription, FormMessage, FormField } from "@/components/ui/form"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DialogTitle } from "@/components/ui/dialog"
import { X, Building, Loader2, Save } from "lucide-react"
import type { Provider } from "@/lib/types"
import { useProviderForm } from "../hooks/useProviderForm"

type Props = {
    children: React.ReactNode
    providerId?: string
    providerData?: Provider
    onCreated?: (provider: Provider) => void
    createProvider: (name: string) => Promise<Provider>
    updateProvider: (id: string, name: string) => Promise<Provider>
}

export function ProviderForm({ children, providerId, providerData, onCreated, createProvider, updateProvider }: Props) {
    const [open, setOpen] = useState(false)

    const { form, loading, onSubmit, resetForm, isEditing } = useProviderForm({
        providerId,
        providerData,
        onCreated,
        createProvider,
        updateProvider,
        onClose: () => {
            setOpen(false)
            resetForm()
        },
    })

    const handleClose = () => {
        setOpen(false)
        resetForm()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
                <div className="relative">
                    <div className="absolute top-4 right-4 z-10">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="rounded-full h-8 w-8 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Cerrar</span>
                        </Button>
                    </div>

                    <div className="bg-gradient-to-r from-blue-600 to-sky-500 p-6 flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                            <Building className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-white">
                                {isEditing ? "Editar Proveedor" : "Nuevo Proveedor"}
                            </DialogTitle>
                            <p className="text-blue-100 text-sm">
                                {isEditing ? "Actualiza los datos del proveedor" : "Ingresa los datos del nuevo proveedor"}
                            </p>
                        </div>
                    </div>

                    <div className="p-6">
                        <Form {...form}>
                            <form onSubmit={onSubmit} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1.5 after:content-['*'] after:text-red-500 after:ml-0.5">
                                                <Building className="h-4 w-4 text-blue-500" />
                                                Nombre del Proveedor
                                            </FormLabel>
                                            <Input
                                                placeholder="Nombre del proveedor"
                                                {...field}
                                                className="border-blue-100 focus:border-blue-300 dark:border-blue-900/50 dark:focus:border-blue-700"
                                            />
                                            <FormDescription className="text-xs">Ingrese el nombre del proveedor</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end gap-4 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleClose}
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
                            </form>
                        </Form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
