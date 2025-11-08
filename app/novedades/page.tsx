"use client"

import { useState, useEffect } from "react"
import { Plus, Newspaper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { NewsService } from "@/lib/services/news.service"
import { News } from "@/lib/types"
import { useStore } from "@/contexts/StoreContext"
import { NewsTable } from "@/components/news/NewsTable"
import { NewsForm } from "@/components/news/NewsForm"

export default function NewsPage() {
    const [news, setNews] = useState<News[]>([])
    const [loading, setLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedNews, setSelectedNews] = useState<News | null>(null)
    const { currentStore } = useStore()
    const { toast } = useToast()

    const loadNews = async () => {
        if (!currentStore) return

        try {
            setLoading(true)
            const response = await NewsService.findAll({
                storeId: currentStore.id,
                page: 1,
                limit: 100,
            })
            setNews(response.data)
        } catch (error) {
            console.error("Error loading news:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron cargar las novedades",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadNews()
    }, [currentStore])

    const handleCreate = () => {
        setSelectedNews(null)
        setIsFormOpen(true)
    }

    const handleEdit = (newsItem: News) => {
        setSelectedNews(newsItem)
        setIsFormOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await NewsService.delete(id)
            toast({
                title: "Novedad eliminada",
                description: "La novedad ha sido eliminada correctamente",
            })
            loadNews()
        } catch (error) {
            console.error("Error deleting news:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo eliminar la novedad",
            })
        }
    }

    const handleFormSuccess = () => {
        setIsFormOpen(false)
        setSelectedNews(null)
        loadNews()
    }

    if (!currentStore) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Selecciona una tienda para continuar</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Newspaper className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">Novedades</h1>
                        <p className="text-muted-foreground">
                            Gestiona novedades generales y específicas de préstamos
                        </p>
                    </div>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Novedad
                </Button>
            </div>

            <NewsTable
                news={news}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <NewsForm
                open={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false)
                    setSelectedNews(null)
                }}
                onSuccess={handleFormSuccess}
                news={selectedNews}
            />
        </div>
    )
}
