import { errorResponse, successResponse } from "@/lib/api-response"
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
        await prisma.refreshToken.delete({
            where: {
                token: refreshToken
            }
        })
        cookieStore.delete("accessToken")
        cookieStore.delete("refreshToken")
        return successResponse("User logged out successfully")
    } catch (error) {
        return errorResponse(`Internale server error: ${error}`, 500)
    }
}