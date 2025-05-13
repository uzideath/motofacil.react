import type { NextApiRequest } from "next"
import { cookies as nextCookies } from "next/headers"

// CLIENTE: desde document.cookie
export function getClientAuthToken(): string | null {
    if (typeof document === "undefined") return null
    const match = document.cookie.match(/(^|;) ?authToken=([^;]*)/)
    return match ? decodeURIComponent(match[2]) : null
}

// SSR: desde contexto de Next.js API o middleware
export async function getServerAuthToken(req?: NextApiRequest): Promise<string | null> {
    if (req?.headers?.cookie) {
        const match = req.headers.cookie.match(/(^|;) ?authToken=([^;]*)/)
        return match ? decodeURIComponent(match[2]) : null
    }

    // Middleware o appDir:
    try {
        const cookieStore = nextCookies()
        return (await cookieStore).get("authToken")?.value || null
    } catch {
        return null
    }
}
