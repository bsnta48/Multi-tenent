"use server"

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { refreshService } from "../refresh/refresh.service";
import { Token } from "./auth.types";
import { hashToken } from "./auth.utils";
import { userService } from "../user/user.service";

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function createAccessToken(payload: Token.Access) {
    return new SignJWT({ ...payload, type: "access" })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('15m') // ✅ short-lived
        .sign(encodedKey)
}

export async function createRefreshToken(payload: Token.Refresh) {
    const isRememberMe = payload.rememberMe
    return new SignJWT({ ...payload, type: "refresh" })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(isRememberMe ? '7d' : '1d')
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

export async function setToken(
    tokenName: string,
    tokenPayload: Token.Access | Token.Refresh
) {
    const isRefresh = (tokenPayload as Token.Refresh).type === "refresh"
    const isRememberMe = (tokenPayload as Token.Refresh).rememberMe

    const token = isRefresh
        ? await createRefreshToken(tokenPayload as Token.Refresh)
        : await createAccessToken(tokenPayload as Token.Access)

    const cookiesStore = await cookies()

    cookiesStore.set(tokenName, token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        ...(isRefresh && isRememberMe
            ? { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
            : { maxAge: 60 * 15 } // 15 min
        )
    })

    if (isRefresh) {
        const tokenHash = await hashToken(token) // 🔥 important

        await refreshService.create({
            token: tokenHash,
            userId: tokenPayload.userId,
            deviceName: (tokenPayload as Token.Refresh).deviceName,
            expiresAt: isRememberMe ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
        })
    }
}

export async function getToken(tokenName: string) {
    const cookieStore = await cookies()
    const name = tokenName === "access" ? "accessToken" : tokenName === "refresh" ? "refreshToken" : null
    if (!name) throw new Error("Invalid token name")
    const token = cookieStore.get(name)?.value
    if (!token) throw new Error("Token not found")
    return token
}

export async function deleteToken(type: string) {
    const cookieStore = await cookies()
    if (type === "access") {
        cookieStore.delete("accessToken")
    }
    if (type === "refresh") {
        const token = cookieStore.get("refreshToken")?.value
        if (!token) {
            throw new Error("Refresh token not found")
        }
        const hashedToken = await hashToken(token)
        cookieStore.delete("refreshToken")
        await refreshService.drop(hashedToken)
    }
}

export async function refreshAccessToken() {
    const token = await getToken("refresh")
    const isValidToken = await verifyToken(token, "refresh")
    if (!isValidToken) throw new Error("Invalid refresh token")
    const hashedToken = await hashToken(token)
    const refresh = await refreshService.get(hashedToken)
    if (!refresh) throw new Error("Invalid refresh token")
    const user = await userService.get(isValidToken.id)
    await setToken("accessToken", {
        userId: user?.id,
        tenentId: user?.tenentId,
        tokenVersion: user?.tokenVersion
    } as Token.Access)
}