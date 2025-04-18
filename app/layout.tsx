import type React from "react"
import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthProvider } from "@/hooks/use-auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MotoFácil Atlántico - Sistema de Préstamos",
  description: "Sistema de gestión de préstamos para motocicletas",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <body className={`${inter.className} bg-dark-blue-950 dot-pattern text-gray-100`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            <SidebarProvider>
              <div className="flex h-screen w-full overflow-hidden">
                <AppSidebar />
                <div className="flex-1 overflow-auto w-full p-4 md:p-6">
                  <div className="glass-effect rounded-xl p-4 md:p-6 min-h-[calc(100vh-3rem)]">{children}</div>
                </div>
              </div>
              <Toaster />
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
