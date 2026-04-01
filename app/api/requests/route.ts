import { errorResponse, successResponse } from "@/lib/api-response";
import { verifyUser } from "@/lib/auth";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requestService } from "@/lib/modules/requests/request.service";

export async function GET(req: NextRequest) {
    try {
        const user = await verifyUser()
        if (!user || user.role !== "admin") {
            return errorResponse("Unauthorized", 401)
        }

        const requests = await requestService.getAll(user.tenentId)
        return successResponse(requests, "Requests fetched successfully")
    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}