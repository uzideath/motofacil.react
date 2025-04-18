import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rutas que no requieren autenticación
const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Obtener el token de autenticación de las cookies
  const authToken = request.cookies.get("authToken")?.value

  // Si es una ruta pública y el usuario está autenticado, redirigir al dashboard
  if (isPublicRoute && authToken) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Si no es una ruta pública y el usuario no está autenticado, redirigir al login
  if (!isPublicRoute && !authToken && !pathname.includes("/_next")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
