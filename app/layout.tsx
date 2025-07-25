"use client"

import type React from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/useAuth'
import { useEffect, Suspense, lazy } from 'react'
import { usePathname } from 'next/navigation'
import { useNavigationStore } from '@/lib/nav'
import { AppSidebar } from '@/components/sidebar/sidebar'
import { WhatsAppProvider } from '@/context/whatsapp'

const ExpiredSessionHandler = lazy(() => import('@/components/SessionHandler'))

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { setPageLoaded, isNavigatingFromLogin } = useNavigationStore()
  const pathname = usePathname()

  useEffect(() => {
    const hasToken = document.cookie.includes('authToken=')
    if (!hasToken) {
      localStorage.removeItem('refreshToken')
    }
  }, [])

  useEffect(() => {
    if (isNavigatingFromLogin && !pathname.includes('/login')) {
      const timer = setTimeout(() => {
        setPageLoaded(true)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [isNavigatingFromLogin, pathname, setPageLoaded])

  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <body className={`${inter.className} bg-dark-blue-950 dot-pattern text-gray-100`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            <SidebarProvider>
              <WhatsAppProvider>
                <div className="flex h-screen w-full overflow-hidden">
                  <AppSidebar />
                  <div className="flex-1 overflow-auto w-full p-4 md:p-6">
                    <div className="glass-effect rounded-xl p-4 md:p-6 min-h-[calc(100vh-3rem)]">
                      {children}
                    </div>
                  </div>
                </div>
                <Suspense fallback={null}>
                  <ExpiredSessionHandler />
                </Suspense>
                <Toaster />
              </WhatsAppProvider>
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
