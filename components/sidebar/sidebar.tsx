"use client"

import type * as React from "react"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { useStore } from "@/contexts/StoreContext"
import { usePathname, useRouter } from "next/navigation"
import { useNavigationStore } from "@/lib/nav"
import { useState, useEffect } from "react"
import {
    LayoutDashboard,
    User2,
    Bike,
    HandCoins,
    BadgeDollarSign,
    FileDown,
    LogOut,
    Banknote,
    Calculator,
    FileBarChart,
    Settings,
    HelpCircle,
    Users2Icon,
    Smartphone,
    BadgeCheck,
    Calendar,
    TrendingUp,
    Wallet,
    Building2,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarSeparator,
    useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { NavFinance } from "./finance"
import { NavMain } from "./nav"
import { NavOperations } from "./operations"
import { NavSecondary } from "./secondary"
import { NavUser } from "./user"
import { hasAccess } from "@/lib/services/route-access"
import { StoreSwitcher, StoreBadge } from "@/components/common/StoreSwitcher"

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user, logout } = useAuth()
    const { isAdmin, isEmployee, currentStore } = useStore()
    const pathname = usePathname()
    const router = useRouter()
    const { isPageLoaded, isNavigatingFromLogin, resetNavigation } = useNavigationStore()
    const [shouldRender, setShouldRender] = useState(false)
    const { open } = useSidebar()

    // Control sidebar rendering based on navigation state
    useEffect(() => {
        // Don't render on login page
        if (pathname.startsWith("/login")) {
            setShouldRender(false)
            return
        }

        // If we have a user, render immediately
        if (user) {
            setShouldRender(true)
            return
        }

        // If we're not navigating from login, render sidebar immediately
        if (!isNavigatingFromLogin && user) {
            setShouldRender(true)
            return
        }

        // If we're navigating from login, wait for the page to be fully loaded
        if (isNavigatingFromLogin && isPageLoaded && user) {
            setShouldRender(true)
            // Reset navigation state after rendering
            setTimeout(() => {
                resetNavigation()
            }, 100)
        }
    }, [isNavigatingFromLogin, isPageLoaded, user, resetNavigation, pathname])

    // Don't render if conditions aren't met
    if (!user || pathname.startsWith("/login")) {
        return null
    }

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    // Main navigation items
    const mainItems = [
        { path: "/dashboard", label: "Vista General", icon: LayoutDashboard },
        { path: "/usuarios", label: "Usuarios", icon: User2 },
        { path: "/vehiculos", label: "Vehículos", icon: Bike },
        { path: "/proveedores", label: "Proveedores", icon: BadgeCheck },
    ]

    // Finance items - Core financial operations
    const financeItems = [
        { path: "/arrendamientos", label: "Arrendamientos", icon: HandCoins },
        { path: "/cuotas", label: "Cuotas", icon: BadgeDollarSign },
        { path: "/egresos", label: "Egresos", icon: FileDown },
        { path: "/cierre-caja", label: "Cierre de Caja", icon: Wallet },
        { path: "/calendario-pagos", label: "Calendario", icon: Calendar },
    ]

    // Operations items - Analytics & Tools
    const operationsItems = [
        { path: "/flujo-efectivo", label: "Flujo de Efectivo", icon: TrendingUp },
        // { path: "/calculadora", label: "Calculadora", icon: Calculator },
        { path: "/reportes", label: "Reportes", icon: FileBarChart },
    ]

    // // Secondary navigation items

    // const secondaryItems = [
    //     { path: "/config/whatsapp", label: "WhatsApp", icon: Smartphone },
    //     // { path: "/settings", label: "Configuración", icon: Settings },
    //     // { path: "/help", label: "Ayuda", icon: HelpCircle },
    // ]

    // Admin items (only shown if user has access)
    const adminItems = [
        {
            path: "/admin/stores",
            label: "Tiendas",
            icon: Building2,
        },
        {
            path: "/admin/usuarios",
            label: "Empleados",
            icon: Users2Icon,
        },
    ]

    return (
        <Sidebar collapsible="offcanvas" className={cn("border-r", className)} {...props}>
            <SidebarHeader className="border-b py-6 bg-gradient-to-br from-background to-muted/20">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-center">
                        <a href="/dashboard" className="flex items-center justify-center transition-transform hover:scale-105">
                            {open ? (
                                <div className="relative h-12 w-40">
                                    <Image src="/motofacil.png" alt="MotoFácil Logo" fill className="object-contain" priority />
                                </div>
                            ) : (
                                <div className="relative h-10 w-10">
                                    <Image src="/motofacil.png" alt="MotoFácil Icon" fill className="object-contain" priority />
                                </div>
                            )}
                        </a>
                    </div>
                    
                    {/* Store Switcher for Admin or Store Badge for Employee */}
                    {open && (
                        <div className="px-2">
                            {isAdmin ? <StoreSwitcher /> : <StoreBadge />}
                        </div>
                    )}
                </div>
            </SidebarHeader>
            <SidebarContent className="px-2 py-3 space-y-1">
                <NavMain 
                    items={mainItems} 
                    pathname={pathname} 
                    hasAccess={(path) => hasAccess(path, user?.roles || [])} 
                />
                
                <SidebarSeparator className="my-2" />
                
                <NavFinance 
                    items={financeItems} 
                    pathname={pathname} 
                    hasAccess={(path) => hasAccess(path, user?.roles || [])} 
                />
                
                <SidebarSeparator className="my-2" />
                
                <NavOperations
                    items={operationsItems}
                    pathname={pathname}
                    hasAccess={(path) => hasAccess(path, user?.roles || [])}
                />

                {/* {secondaryItems.length > 0 && (
                    <>
                        <SidebarSeparator className="my-2" />
                        <NavSecondary
                            items={secondaryItems}
                            pathname={pathname}
                            hasAccess={(path) => hasAccess(path, user?.roles || [])}
                            title="Utilidades"
                        />
                    </>
                )}
                 */}
                {user && adminItems.some(item => hasAccess(item.path, user.roles)) && (
                    <>
                        <SidebarSeparator className="my-2" />
                        <NavSecondary
                            items={adminItems}
                            pathname={pathname}
                            hasAccess={(path) => hasAccess(path, user?.roles || [])}
                            title="Administración"
                        />
                    </>
                )}
            </SidebarContent>
            <SidebarFooter className="border-t p-2 bg-muted/30">
                <NavUser user={user} onLogout={handleLogout} />
            </SidebarFooter>
        </Sidebar>
    )
}
