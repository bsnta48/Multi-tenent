"server-only"

import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { SessionPayload } from "./schema"

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

// encrypt session
export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encodedKey)
}

// decrypt session
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

// create session
export async function createSession(payload: SessionPayload) {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
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

// update session
export async function updateSession() {
    const cookiesStore = await cookies()
    const session = cookiesStore.get("session")?.value
    const payload = await decrypt(session || "")
    if (!session || !payload) return null
    const expires = new Date(Date.now() + 10 * 60 * 1000)
    cookiesStore.set("session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires,
        path: "/",
    })
}

// destroy session
export async function destroySession() {
    const cookiesStore = await cookies()
    cookiesStore.delete("session")
}

// get session
export async function getSession(): Promise<SessionPayload | null> {
    const cookiesStore = await cookies()
    const session = cookiesStore.get("session")?.value
    if (!session) return null
    return decrypt(session)
}
