export type User = {
    id: string
    name: string
    username: string
    role: "ADMIN" | "USER" | "MANAGER"
    status: "ACTIVE" | "INACTIVE"
    lastLogin: string
    createdAt: string
}
