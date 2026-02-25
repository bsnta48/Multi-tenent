"server-only"

import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { SessionPayload } from "./schema"

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encodedKey)
}

export async function decrypt(session: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ['HS256']
        })
        return payload as SessionPayload
    } catch (error) {
        console.log("Failed to verify session", error)
        return null
    }
}

export async function createSession(payload: SessionPayload){
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    const session = await encrypt(payload)
    const cookiesStore = await cookies()

    cookiesStore.set("session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: expiresAt,
        path: "/",
    })
}

export async function destroySession() {
    const cookiesStore = await cookies()
    cookiesStore.delete("session")
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookiesStore = await cookies()
    const session = cookiesStore.get("session")
    if (!session) return null
    return decrypt(session.value)
}
