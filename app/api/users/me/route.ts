import { errorResponse, successResponse } from "@/lib/api-response"
import { verifyUser } from "@/lib/auth"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
    try {
        const user = await verifyUser()
        if (!user) {
            return errorResponse("Unauthorized", 401)
        }
        return successResponse(user)
    } catch (error) {
        return errorResponse(`Internale server error: ${error}`, 500)
    }
}