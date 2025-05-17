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
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  const token = request.cookies.get("authToken")?.value

  if (token) {
    const decoded = parseJwt(token)
    const now = Math.floor(Date.now() / 1000)

    if (!decoded || decoded.exp < now) {
      const response = NextResponse.redirect(new URL("/login?expired=true", request.url))
      response.cookies.set("authToken", "", {
        path: "/",
        expires: new Date(0),
      })
      return response
    }

    const userRoles: Role[] = decoded?.roles || []
    if (!hasAccess(pathname, userRoles)) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (isPublicRoute) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  if (!token && !isPublicRoute && !pathname.includes("/_next")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
