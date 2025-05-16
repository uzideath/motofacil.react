type Role = "admin" | "manager" | "user"

export const roleMap: Record<string, Role> = {
    ADMIN: "admin",
    MANAGER: "manager",
    USER: "user",
}

export interface User {
    id: string
    name: string
    username: string
    role: Role
}

export interface LoginPayload {
    username: string
    password: string
}

export interface LoginResponse {
    access_token: string
    user: {
        id: string
        username: string
        roles: string[]
        createdAt: string
        updatedAt: string
    }
}


export type Motorcycle = {
    id: string
    brand: string
    model: string
    plate: string
    engine: string
    chassis: string
    color?: string | null
    cc?: number | null
    gps?: number | null
}

export type Client = {
    id: string
    name: string
    identification: string
    age: number
    phone: string
    address: string
    refName: string
    refID: string
    refPhone: string
}
