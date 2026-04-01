import { errorResponse, successResponse, validationError } from "@/lib/api-response";
import { verifyUser } from "@/lib/modules/auth/auth.service";
import { requestService } from "@/lib/modules/requests/request.service";
import { createRequestSchema } from "@/lib/schema";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const user = await verifyUser()
        if (!user) {
            return errorResponse("Unauthorized", 401)
        }
        const requests = await requestService.getAllByUser(user.id)
        return successResponse(requests)
    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await verifyUser()
        if (!user) {
            return errorResponse("Unauthorized", 401)
        }
        const data = await req.json()
        const validate = createRequestSchema.safeParse(data)
        if (!validate.success) {
            return validationError(validate.error)
        }
        const request = await requestService.create({
            type: validate.data.type,
            event: validate.data.event,
            description: validate.data.description,
            userId: user.id,
            tenentId: user.tenentId
        })
        return successResponse(request, "Request created successfully")
    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}