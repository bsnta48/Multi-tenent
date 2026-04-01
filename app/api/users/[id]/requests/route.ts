import { errorResponse, successResponse } from "@/lib/api-response";
import { verifyUser } from "@/lib/auth";
import { NextRequest } from "next/server";
import { requestService } from "@/lib/modules/requests/request.service";

export async function GET(req: NextRequest, ctx: RouteContext<'/api/users/[id]/requests'>) {
    try {
        const { id } = await ctx.params
        const user = await verifyUser()
        if (!user || (user.id !== id && user.role !== "admin")) {
            return errorResponse("Unauthorized", 401)
        }

        if (!id) {
            return errorResponse("Request ID is required", 400)
        }

        const requests = requestService.getByUser(id)

        return successResponse(requests, "Requests fetched successfully")

    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}