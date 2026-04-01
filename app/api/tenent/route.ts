import { errorResponse, successResponse } from "@/lib/api-response"
import { verifyUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { tenentService } from "@/lib/modules/tenents/tenent.service"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
    try {
        const user = await verifyUser()
        if (!user) {
            return errorResponse("Unauthorized", 401)
        }
        const res = await tenentService.get(user.tenentId)
        return successResponse(res)
    } catch (error) {
        return errorResponse(`Internale server error: ${error}`, 500)
    }
}