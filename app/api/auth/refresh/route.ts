import { errorResponse, successResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import setToken from "@/lib/set-token";
import { TokenPayload } from "@/lib/types";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies()
        const refreshToken = cookieStore.get("refreshToken")?.value
        if (!refreshToken) {
            return errorResponse("Unauthorized", 401)
        }
        const user = await prisma.refreshToken.findUnique({
            where: {
                token: refreshToken
            }
        })
        const currentDate = new Date()
        if (!user || user.expiresAt < currentDate) {
            await prisma.refreshToken.delete({
                where: {
                    token: refreshToken
                }
            })
            return errorResponse("Invalid token", 401)
        }
        const findUser = await prisma.user.findUnique({
            where: {
                id: user.userId
            },
            select: {
                id: true,
                tenentId: true,
                username: true,
                role: true,
                email: true
            }
        })
        if (!findUser) {
            return errorResponse("User not found", 404)
        }
        const tokenPayload: TokenPayload = {
            userId: findUser.id,
            tenentId: findUser.tenentId,
            role: findUser.role,
            username: findUser.username,
            email: findUser.email
        }
        await setToken("accessToken", tokenPayload)
        return successResponse("Token refreshed successfully")
    } catch (error) {
        return errorResponse(`Internale server error: ${error}`, 500)
    }
}