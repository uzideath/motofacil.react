import { Role } from "@/hooks/use-auth";
import { HttpService } from "../http"
import { LoginPayload, LoginResponse } from "../types";


export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
    try {
        const response = await HttpService.post<LoginResponse>("/api/v1/auth/login", payload);
        return response.data;
    } catch (error: any) {
        throw new Error(`Error al iniciar sesión: ${error?.response?.data?.message || error.message || "Error desconocido al iniciar sesión"}`);
    }
}

export function getRequiredRole(pathname: string): Role | null {
    const match = Object.entries(routeRoleMap).find(([prefix]) => pathname.startsWith(prefix))
    return match ? match[1] : null
}


export const routeRoleMap: Record<string, Role> = {
    "/admin": "admin",
}

export function hasAccess(pathname: string, userRoles: string[]): boolean {
    const requiredRole = getRequiredRole(pathname)
    if (!requiredRole) return true
    return userRoles.includes(requiredRole)
}