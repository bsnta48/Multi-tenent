export type TokenPayload = {
    userId: string
    tenentId: string
    role: string
    username: string
    email: string
}

export type RefreshTokenPayload = {
    userId: string,
    type: string,
    expiresAt: Date
}