import { errorResponse, successResponse } from "@/lib/api-response"
import { verifyUser } from "@/lib/auth"
import { inviteService } from "@/lib/modules/invite/invite.service"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
    try {
        const user = await verifyUser()
        if (!user || user.role !== "admin") {
            return errorResponse("Unauthorized", 401)
        }
        const res = await inviteService.getAll(user.tenentId)
        return successResponse(res)
    } catch (error) {
        return errorResponse(`Internale server error: ${error}`, 500)
    }
}