"server-only"

import { SignJWT, jwtVerify } from "jose"
import { TokenPayload, RefreshTokenPayload } from "./types"
import { cookies } from "next/headers"
import { prisma } from "./prisma"

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function createToken(payload: TokenPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(new Date())
        .setExpirationTime('7d')
        .sign(encodedKey)
}

export async function verifyToken(token: string): Promise<TokenPayload | RefreshTokenPayload> {
    try {
        const { payload } = await jwtVerify(token, encodedKey, {
            algorithms: ['HS256']
        })
        return payload as TokenPayload | RefreshTokenPayload
    } catch {
        throw new Error("Invalid token")
    }
}

export async function verifyUser() {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value
    if (!accessToken) {
        return null
    }
    const user = await verifyToken(accessToken)
    if (!user.userId) {
        return null
    }
    return user as TokenPayload
}

export async function isValidInvite(token: string) {
    const invitedUser = await prisma.invite.findUnique({
        where: {
            token,
            expireAt: {
                gt: new Date()
            },
            used: false
        },
        select: {
            email: true,
            role: true,
            tenentId: true
        }
    })
    if (!invitedUser) {
        return null
    }
    return invitedUser
}