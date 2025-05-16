import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { hasAccess } from "./lib/services/route-access"
import { Role } from "./hooks/use-auth"



const publicRoutes = ["/login"]

export function parseJwt(token: string): any {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  const token = request.cookies.get("authToken")?.value

  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (!isPublicRoute && !token && !pathname.includes("/_next")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (token) {
    const decoded = parseJwt(token)
    const userRoles: Role[] = decoded?.roles || []

    if (!hasAccess(pathname, userRoles)) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
