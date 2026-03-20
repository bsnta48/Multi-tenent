"use server"

import { createToken } from "./auth"
import { cookies } from "next/headers"
import { RefreshTokenPayload, TokenPayload } from "./types"
import { prisma } from "./prisma"

export default async function setToken(tokenName: string, tokenPayload: TokenPayload | RefreshTokenPayload, maxAge: number) {
    const token = await createToken(tokenPayload as TokenPayload)
    const cookiesStore = await cookies()
    cookiesStore.set(tokenName, token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: maxAge
    })
    if((tokenPayload as RefreshTokenPayload).type === "refresh") {
        await prisma.refreshToken.create({
            data: {
                token: token,
                userId: tokenPayload.userId,
                deviceName: (tokenPayload as RefreshTokenPayload).deviceName,
                expiresAt: (tokenPayload as RefreshTokenPayload).expiresAt
            }
        })
    }
}