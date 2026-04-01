import { errorResponse, successResponse } from "@/lib/api-response";
import { verifyUser } from "@/lib/modules/auth/auth.service";
import { userService } from "@/lib/modules/user/user.service";

export async function GET() {
    try {
        const user = await verifyUser()
        if (!user) {
            return errorResponse("Unauthorized", 401)
        }
        const users = await userService.getAll(user.tenentId)
        return successResponse(users, "Users fetched successfully")
    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}