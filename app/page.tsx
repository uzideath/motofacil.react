import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { Role } from "@/hooks/use-auth"

function parseJwt(token: string): any {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, "base64")
        .toString("binary")
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export default async function Page() {
  const cookieStore = cookies()
  const token = (await cookieStore).get("authToken")?.value

  if (!token) {
    redirect("/login")
  }

  const decoded = parseJwt(token)
  const roles: Role[] = decoded?.roles || []

  if (roles.includes("ADMIN")) {
    redirect("/usuarios")
  } else {
    redirect("/prestamos")
  }
}
