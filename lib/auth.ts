"server-only"

import { SignJWT, jwtVerify } from "jose"
import { TokenPayload, RefreshTokenPayload } from "./types"
import { cookies } from "next/headers"
import { prisma } from "./prisma"

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function createAccessToken(payload: TokenPayload) {
    return new SignJWT({ ...payload, type: "access" })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('15m') // ✅ short-lived
        .sign(encodedKey)
}

export async function createRefreshToken(payload: RefreshTokenPayload) {
    return new SignJWT({ ...payload, type: "refresh" })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encodedKey)
}

export async function verifyToken(token: string, type: "access" | "refresh") {
    try {
        const { payload } = await jwtVerify(token, encodedKey)

        if (payload.type !== type) {
            throw new Error("Invalid token type")
        }

        return payload as any
    } catch {
        throw new Error("Invalid token")
    }
}

export async function verifyUser() {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) return null

    let payload: TokenPayload

    try {
        payload = await verifyToken(accessToken, "access")
    } catch {
        return null
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
            id: true,
            tenentId: true,
            role: true,
            tokenVersion: true
        }
    })

    if (!user) return null

    // 🔥 token version check (optional but recommended)
    if (payload.tokenVersion !== user.tokenVersion) {
        return null
    }

    return user
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