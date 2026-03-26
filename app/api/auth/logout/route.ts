import { errorResponse, successResponse } from "@/lib/api-response"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const refreshToken = cookieStore.get("refreshToken")?.value
        if (!refreshToken) {
            return errorResponse("Unauthorized", 401)
        }
        const payload = await verifyToken(refreshToken, "refresh") as any
        if (!payload) {
            return errorResponse("Unauthorized", 401)
        }
        cookieStore.delete("accessToken")
        cookieStore.delete("refreshToken")
        await prisma.refreshToken.delete({
            where: {
                token: refreshToken
            }
        })
        await prisma.user.update({
            where: { id: payload.userId },
            data: {
                tokenVersion: { increment: 1 }
            }
        })
        return successResponse("User logged out successfully")
    } catch (error) {
        return errorResponse(`Internale server error: ${error}`, 500)
    }
}