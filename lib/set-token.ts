"use server"

import { createToken } from "./auth"
import { cookies } from "next/headers"
import { RefreshTokenPayload, TokenPayload } from "./types"
import { prisma } from "./prisma"

export default async function setToken(tokenName: string, tokenPayload: TokenPayload | RefreshTokenPayload) {
    const token = await createToken(tokenPayload as TokenPayload)
    const cookiesStore = await cookies()
    const oneDayExpiry = new Date(Date.now() + 60 * 60 * 24 * 1000)
    const longTermExpiry = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000)
    const isRememberMe = (tokenPayload as RefreshTokenPayload).rememberMe
    const isTypeRefresh = (tokenPayload as RefreshTokenPayload).type === "refresh"
    cookiesStore.set(tokenName, token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        ...(isTypeRefresh
            ? { expires: isRememberMe ? longTermExpiry : undefined }
            : { maxAge: 60 * 15 }
        )
    })
    if (isTypeRefresh) {
        await prisma.refreshToken.create({
            data: {
                token: token,
                userId: tokenPayload.userId,
                deviceName: (tokenPayload as RefreshTokenPayload).deviceName,
                expiresAt: isRememberMe ? longTermExpiry : oneDayExpiry
            }
        })
    }
}