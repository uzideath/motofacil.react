"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import Image from "next/image"
import { useSidebar } from "@/components/ui/sidebar"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Bike, LogOut, Settings, HelpCircle, Calculator, ChevronRight, BadgeDollarSign, Banknote, FileBarChart, FileDown, HandCoins, LayoutDashboard, User2, Users2Icon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { hasAccess } from "@/lib/services/route-access"
import { usePathname, useRouter } from "next/navigation"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState, useEffect } from "react"
import { useNavigationStore } from "@/lib/nav"


type CategoryState = {
  finance: boolean
  operations: boolean
}

export function AppSidebar() {
  const { user, logout } = useAuth()
  const { open } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()
  const { isPageLoaded, isNavigatingFromLogin, resetNavigation } = useNavigationStore()
  const [shouldRender, setShouldRender] = useState(false)

  // Track open states for collapsible categories
  const [openCategories, setOpenCategories] = useState<CategoryState>({
    finance: true,
    operations: true,
  })

  // Control sidebar rendering based on navigation state
  useEffect(() => {
    // If we're not navigating from login, render sidebar immediately
    if (!isNavigatingFromLogin && user) {
      setShouldRender(true)
      return;
    }

    // If we're navigating from login, wait for the page to be fully loaded
    if (isNavigatingFromLogin && isPageLoaded && user) {
      setShouldRender(true);
      // Reset navigation state after rendering
      setTimeout(() => {
        resetNavigation();
      }, 100);
    }
  }, [isNavigatingFromLogin, isPageLoaded, user, resetNavigation]);

  const toggleCategory = (category: keyof CategoryState) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  // Don't render if conditions aren't met
  if (!shouldRender || !user || pathname.startsWith("/login")) {
    return null;
  }

  const dashboardItem = { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard }

  const userItems = [{ path: "/usuarios", label: "Usuarios", icon: User2 }]

  const vehicleItems = [{ path: "/motocicletas", label: "Motocicletas", icon: Bike }]

  const financeItems = [
    { path: "/prestamos", label: "Arrendamientos", icon: HandCoins },
    { path: "/cuotas", label: "Cuotas", icon: BadgeDollarSign },
    { path: "/egresos", label: "Egresos", icon: FileDown },
    { path: "/cierre-caja", label: "Cierre de Caja", icon: LogOut },
  ]

  const operationItems = [
    { path: "/flujo-caja", label: "Flujo de Caja", icon: Banknote },
    { path: "/calculadora", label: "Calculadora", icon: Calculator },
  ]

  const reportItems = [{ path: "/reportes", label: "Reportes", icon: FileBarChart }]

  const adminMenuItem = {
    path: "/admin/usuarios",
    label: "Empleados",
    icon: Users2Icon,
  }

  const footerMenuItems = [
    { path: "/configuracion", label: "Configuración", icon: Settings },
    { path: "/ayuda", label: "Ayuda", icon: HelpCircle },
  ]

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === path
    return pathname.startsWith(path)
  }

  type MenuItem = {
    path: string
    label: string
    icon: React.ElementType
  }

  const renderMenuItem = (item: MenuItem) => (
    <SidebarMenuItem key={item.path}>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton
            asChild
            isActive={isActive(item.path)}
            className="group relative text-white hover:bg-slate-800/60 hover:text-white data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-600/20 data-[active=true]:to-transparent data-[active=true]:font-medium rounded-xl my-1 h-11 overflow-hidden transition-all duration-200"
          >
            <Link href={item.path} className="relative">
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-gradient-to-b from-blue-400 to-blue-600 transition-all duration-300 ${isActive(item.path) ? "h-[70%] shadow-[0_0_10px_rgba(59,130,246,0.6)]" : "h-0"
                  }`}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div
                className={`flex items-center ${isActive(item.path) ? "translate-x-1" : ""} transition-transform duration-300 group-hover:translate-x-1`}
              >
                <div
                  className={`flex items-center justify-center h-8 w-8 rounded-lg mr-3 transition-all duration-300 ${isActive(item.path)
                    ? "bg-gradient-to-br from-blue-500/20 to-blue-600/10 text-blue-300"
                    : "text-slate-300 group-hover:text-blue-300"
                    }`}
                >
                  <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          </SidebarMenuButton>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
          <p>{item.label}</p>
        </TooltipContent>
      </Tooltip>
    </SidebarMenuItem>
  )

  const renderCollapsibleCategory = (title: string, items: MenuItem[], category: keyof CategoryState) => (
    <Collapsible open={openCategories[category]} onOpenChange={() => toggleCategory(category)} className="w-full">
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between px-4 py-2 text-sm font-medium text-blue-300/80 hover:text-blue-300 cursor-pointer group">
          <span className="uppercase tracking-wider text-[0.7rem]">{title}</span>
          <ChevronRight
            className={`h-4 w-4 transition-transform duration-200 ${openCategories[category] ? "rotate-90" : ""}`}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1 pb-2">
        <SidebarMenu>
          {items.filter((item) => user && hasAccess(item.path, user.roles)).map(renderMenuItem)}
        </SidebarMenu>
      </CollapsibleContent>
    </Collapsible>
  )

  return (
    <TooltipProvider>
      <Sidebar collapsible="icon" className="border-r-0 bg-gradient-to-br from-[#0c1322] to-[#070b15] shadow-xl">
        {/* Logo with blue overlay */}
        <div className="relative w-full h-28 overflow-hidden bg-cover bg-center">
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              {open ? (
                <div className="relative w-[140px] h-[70px] overflow-hidden">
                  <Image
                    src="/motofacil2.png"
                    alt="MotoFácil Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="relative w-[50px] h-[50px] overflow-hidden rounded-lg">
                  <Image
                    src="/motofacil2.png"
                    alt="MotoFácil Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <SidebarContent className="px-3 py-4">
          {/* Dashboard - standalone */}
          <SidebarGroup className="mb-3">
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItem(dashboardItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Users Category */}
          <SidebarGroup className="mb-3">
            {open && (
              <SidebarGroupLabel className="text-[0.7rem] uppercase tracking-wider text-blue-300/70 font-semibold mb-2 ml-4 flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
                Usuarios
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {userItems.filter((item) => user && hasAccess(item.path, user.roles)).map(renderMenuItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Vehicles Category */}
          <SidebarGroup className="mb-3">
            {open && (
              <SidebarGroupLabel className="text-[0.7rem] uppercase tracking-wider text-blue-300/70 font-semibold mb-2 ml-4 flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
                Vehículos
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {vehicleItems.filter((item) => user && hasAccess(item.path, user.roles)).map(renderMenuItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Finance Category - Collapsible */}
          <SidebarGroup className="mb-3">
            {open && (
              <SidebarGroupLabel className="text-[0.7rem] uppercase tracking-wider text-blue-300/70 font-semibold mb-2 ml-4 flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
                Finanzas
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              {open ? (
                renderCollapsibleCategory("Gestión Financiera", financeItems, "finance")
              ) : (
                <SidebarMenu>
                  {financeItems.filter((item) => user && hasAccess(item.path, user.roles)).map(renderMenuItem)}
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Operations Category - Collapsible */}
          <SidebarGroup className="mb-3">
            {open && (
              <SidebarGroupLabel className="text-[0.7rem] uppercase tracking-wider text-blue-300/70 font-semibold mb-2 ml-4 flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
                Operaciones
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              {open ? (
                renderCollapsibleCategory("Gestión Operativa", operationItems, "operations")
              ) : (
                <SidebarMenu>
                  {operationItems.filter((item) => user && hasAccess(item.path, user.roles)).map(renderMenuItem)}
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Reports Category */}
          <SidebarGroup className="mb-3">
            {open && (
              <SidebarGroupLabel className="text-[0.7rem] uppercase tracking-wider text-blue-300/70 font-semibold mb-2 ml-4 flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
                Reportes
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {reportItems.filter((item) => user && hasAccess(item.path, user.roles)).map(renderMenuItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Administración */}
          {user && hasAccess(adminMenuItem.path, user.roles) && (
            <SidebarGroup className="relative pt-2 pb-2 mt-2">
              <div className="absolute -top-1 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
              {open && (
                <SidebarGroupLabel className="text-[0.7rem] uppercase tracking-wider text-blue-300/70 font-semibold mb-2 ml-4 flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
                  Administración
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname.startsWith("/admin")}
                          className="group relative text-white hover:bg-slate-800/60 hover:text-white data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-600/20 data-[active=true]:to-transparent data-[active=true]:font-medium rounded-xl my-1 h-11 overflow-hidden transition-all duration-200"
                        >
                          <Link href={adminMenuItem.path} className="relative">
                            <div
                              className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-gradient-to-b from-blue-400 to-blue-600 transition-all duration-300 ${pathname.startsWith("/admin") ? "h-[70%] shadow-[0_0_10px_rgba(59,130,246,0.6)]" : "h-0"
                                }`}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div
                              className={`flex items-center ${pathname.startsWith("/admin") ? "translate-x-1" : ""} transition-transform duration-300 group-hover:translate-x-1`}
                            >
                              <div
                                className={`flex items-center justify-center h-8 w-8 rounded-lg mr-3 transition-all duration-300 ${pathname.startsWith("/admin")
                                  ? "bg-gradient-to-br from-blue-500/20 to-blue-600/10 text-blue-300"
                                  : "text-slate-300 group-hover:text-blue-300"
                                  }`}
                              >
                                <adminMenuItem.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                              </div>
                              <span className="font-medium">{adminMenuItem.label}</span>
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                        <p>{adminMenuItem.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="p-4 border-t border-blue-900/20 bg-gradient-to-b from-transparent to-slate-900/70 mt-auto">
          {user && (
            <div className={`${open ? "mb-4" : "mb-4 flex justify-center"}`}>
              {open ? (
                <div className="flex items-center p-3 rounded-xl bg-gradient-to-r from-slate-800/60 to-slate-800/40 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] group">
                  <Avatar className="border-2 border-blue-500/30 bg-slate-800/80 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 group-hover:border-blue-500/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                    <AvatarImage src="/abstract-geometric-shapes.png" alt="Avatar" />
                    <AvatarFallback className="bg-gradient-to-br from-slate-800 to-slate-900 text-blue-300">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors duration-300">
                      {user.username}
                    </p>
                    <p className="text-xs text-blue-200/70">{user.username}</p>
                  </div>
                </div>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="border-2 border-blue-500/30 bg-slate-800/80 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300">
                      <AvatarImage src="/abstract-geometric-shapes.png" alt="Avatar" />
                      <AvatarFallback className="bg-gradient-to-br from-slate-800 to-slate-900 text-blue-300">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                    <p>{user.username}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}

          <SidebarMenu>
            {footerMenuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      asChild
                      className="text-white hover:bg-slate-800/50 hover:text-blue-300 rounded-xl transition-all duration-200 hover:-translate-y-0.5 group h-10"
                    >
                      <Link href={item.path} className="flex items-center">
                        <div className="flex items-center justify-center h-7 w-7 rounded-lg mr-3 transition-all duration-300 text-slate-300 group-hover:text-blue-300">
                          <item.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    className="text-white hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 hover:-translate-y-0.5 group h-10"
                    onClick={handleLogout}
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-7 w-7 rounded-lg mr-3 transition-all duration-300 text-slate-300 group-hover:text-red-300">
                        <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <span className="text-sm font-medium">Cerrar Sesión</span>
                    </div>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                  <p>Cerrar Sesión</p>
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  )
}
