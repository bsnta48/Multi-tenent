import { errorResponse, successResponse } from "@/lib/api-response"
import { getToken, verifyToken } from "@/lib/modules/auth/auth.service"
import { hashToken } from "@/lib/utils"
import { refreshService } from "@/lib/modules/refresh/refresh.service"
import { userService } from "@/lib/modules/user/user.service"
import { cookies } from "next/headers"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const refreshToken = await getToken("refresh")
        if (!refreshToken) {
            return errorResponse("Unauthorized", 401)
        }
        const payload = await verifyToken(refreshToken, "refresh") as any
        if (!payload) {
            return errorResponse("Unauthorized", 401)
        }
        const hashedToken = await hashToken(refreshToken)
        await refreshService.drop(hashedToken)
        await userService.update({
            id: payload.userId,
            tokenVersion: { increment: 1 }
        })
        cookieStore.delete("accessToken")
        cookieStore.delete("refreshToken")
        return successResponse("User logged out successfully")
    } catch (error) {
        return errorResponse(`Internale server error: ${error}`, 500)
    }
}