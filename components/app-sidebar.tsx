"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Home,
  Users,
  Bike,
  CreditCard,
  Receipt,
  LogOut,
  BarChart4,
  DollarSign,
  Settings,
  HelpCircle,
  UserCog,
  Bell,
  Search,
  Calculator,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"

export function AppSidebar() {
  const { open } = useSidebar()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState(3)
  const [searchValue, setSearchValue] = useState("")

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  // Si no hay usuario autenticado y no estamos en una ruta de autenticación, no mostrar la barra lateral
  if (!user && !pathname.startsWith("/(auth)")) {
    return null
  }

  const mainMenuItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/usuarios", label: "Usuarios", icon: Users },
    { path: "/motocicletas", label: "Motocicletas", icon: Bike },
    { path: "/prestamos", label: "Préstamos", icon: CreditCard, badge: 2 },
    { path: "/cuotas", label: "Cuotas", icon: Receipt },
    { path: "/flujo-caja", label: "Flujo de Caja", icon: DollarSign },
    { path: "/reportes", label: "Reportes", icon: BarChart4 },
    { path: "/calculadora", label: "Calculadora", icon: Calculator },
  ]

  const adminMenuItem = {
    path: "/admin/usuarios",
    label: "Administración",
    icon: UserCog,
  }

  const footerMenuItems = [
    { path: "/configuracion", label: "Configuración", icon: Settings },
    { path: "/ayuda", label: "Ayuda", icon: HelpCircle },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-gradient-to-br from-[#1a2c4e] to-[#0f172a]">
      <SidebarHeader className="flex flex-col p-4 border-b border-sky-900/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="relative overflow-hidden rounded-lg bg-opacity-60 bg-[#0f172a] backdrop-blur-md border border-blue-500/20 p-2 group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-transparent rounded-lg animate-pulse"></div>
              <CreditCard className="h-6 w-6 text-primary relative z-10" />
            </div>
            {open && (
              <div className="flex flex-col">
                <span className="font-bold text-lg text-white">MotoFácil</span>
                <span className="text-xs text-blue-300/80">Atlántico</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {open && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative text-white hover:bg-slate-800/50 h-8 w-8"
                      onClick={() => setNotifications(0)}
                    >
                      <Bell className="h-5 w-5" />
                      {notifications > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-primary text-[10px]">
                          {notifications}
                        </Badge>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notificaciones</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <SidebarTrigger className="text-white hover:bg-slate-800/50 h-8 w-8" />
          </div>
        </div>

        {open && (
          <div className="relative mt-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-9 pl-9 bg-slate-800/40 border-slate-700/50 text-white placeholder:text-slate-400 focus-visible:ring-primary/30 focus-visible:ring-offset-0 focus-visible:border-primary/50"
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          {open && (
            <SidebarGroupLabel className="text-[0.7rem] uppercase tracking-wider text-slate-400/80 mt-6 mb-2 ml-4">
              Principal
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.path}
                    tooltip={item.label}
                    className="group relative text-white hover:bg-transparent hover:text-white data-[active=true]:bg-slate-800/60 data-[active=true]:font-medium rounded-lg my-1 h-10 overflow-hidden"
                  >
                    <Link href={item.path} className="relative">
                      <div
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-blue-500 transition-all duration-200 ${pathname === item.path ? "h-[70%]" : "h-0"}`}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <item.icon className="h-5 w-5 mr-3" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <Badge className="ml-auto bg-primary/90 hover:bg-primary text-xs font-normal">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.role === "admin" && (
          <SidebarGroup className="relative pt-2 pb-2 mt-2">
            <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-blue-500/10 via-blue-500/20 to-blue-500/10"></div>
            {open && (
              <SidebarGroupLabel className="text-[0.7rem] uppercase tracking-wider text-slate-400/80 mt-4 mb-2 ml-4">
                Administración
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/admin")}
                    tooltip="Administración"
                    className="group relative text-white hover:bg-transparent hover:text-white data-[active=true]:bg-slate-800/60 data-[active=true]:font-medium rounded-lg my-1 h-10 overflow-hidden"
                  >
                    <Link href={adminMenuItem.path} className="relative">
                      <div
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-blue-500 transition-all duration-200 ${pathname.startsWith("/admin") ? "h-[70%]" : "h-0"}`}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <adminMenuItem.icon className="h-5 w-5 mr-3" />
                      <span>{adminMenuItem.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sky-900/30">
        {user && (
          <div className={`${open ? "mb-4" : "mb-4 flex justify-center"}`}>
            {open ? (
              <div className="flex items-center p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <Avatar className="border border-primary/30 bg-slate-800/80 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  <AvatarImage src="/abstract-geometric-shapes.png" alt="Avatar" />
                  <AvatarFallback className="bg-slate-800/80 text-white">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user.username}</p>
                  <p className="text-xs text-blue-200/70">{user.username}</p>
                </div>
              </div>
            ) : (
              <Avatar className="border border-primary/30 bg-slate-800/80 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <AvatarImage src="/abstract-geometric-shapes.png" alt="Avatar" />
                <AvatarFallback className="bg-slate-800/80 text-white">
                  {user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        )}

        <SidebarMenu>
          {footerMenuItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                tooltip={item.label}
                className="text-white hover:bg-slate-800/50 hover:text-white rounded-lg transition-transform duration-200 hover:-translate-y-0.5"
              >
                <Link href={item.path}>
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Cerrar Sesión"
              className="text-white hover:bg-slate-800/50 hover:text-white rounded-lg transition-transform duration-200 hover:-translate-y-0.5"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
