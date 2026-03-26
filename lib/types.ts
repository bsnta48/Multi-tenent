export type TokenPayload = {
    userId: string
    tenentId: string,
    tokenVersion: number
}

export type RefreshTokenPayload = {
    userId: string,
    type: string,
    deviceName: string,
    rememberMe: boolean
}

export const RequestType = ["leave", "expense", "document", "other"] as const

export const RequestStatus = ["pending", "completed", "rejected", "canceled"] as const