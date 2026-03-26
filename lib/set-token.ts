"use server"

import { createAccessToken, createRefreshToken } from "./auth"
import { cookies } from "next/headers"
import { RefreshTokenPayload, TokenPayload } from "./types"
import { prisma } from "./prisma"
import { hashToken } from "./utils"

export default async function setToken(
    tokenName: string,
    tokenPayload: TokenPayload | RefreshTokenPayload
) {
    const isRefresh = (tokenPayload as RefreshTokenPayload).type === "refresh"

    const token = isRefresh
        ? await createRefreshToken(tokenPayload as RefreshTokenPayload)
        : await createAccessToken(tokenPayload as TokenPayload)

    const cookiesStore = await cookies()

    cookiesStore.set(tokenName, token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        ...(isRefresh
            ? { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
            : { maxAge: 60 * 15 } // 15 min
        )
    })

    if (isRefresh) {
        const tokenHash = await hashToken(token) // 🔥 important

        await prisma.refreshToken.create({
            data: {
                token: tokenHash,
                userId: tokenPayload.userId,
                deviceName: (tokenPayload as RefreshTokenPayload).deviceName,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        })
    }
}