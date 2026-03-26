import { errorResponse, successResponse, validationError } from "@/lib/api-response";
import { verifyUser } from "@/lib/auth";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateRequestSchema } from "@/lib/schema";

export async function GET(req: NextRequest, ctx: RouteContext<'/api/requests/[id]'>) {
    try {
        const { id } = await ctx.params
        const user = await verifyUser()
        if (!user || (user.id !== id && user.role !== "admin")) {
            return errorResponse("Unauthorized", 401)
        }

        if (!id) {
            return errorResponse("Request ID is required", 400)
        }

        const requests = prisma.request.findMany({
            where: { userId: id }
        })

        return successResponse(requests, "Requests fetched successfully")

    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/requests/[id]'>) {
    try {
        const { id } = await ctx.params
        const user = await verifyUser()
        const data = await req.json()
        if (!user || (user.id !== id && user.role !== "admin" && data.status !== "canceled")) {
            return errorResponse("Unauthorized", 401)
        }
        if (!id) {
            return errorResponse("Request ID is required", 400)
        }

        const existingRequest = await prisma.request.findUnique({
            where: { id }
        })

        if (!existingRequest) {
            return errorResponse("Request not found", 404)
        }

        const validate = updateRequestSchema.safeParse(data)
        if (!validate.success) {
            return validationError(validate.error)
        }

        // Authorization logic
        const isAdmin = user.role === "admin"
        const isOwner = existingRequest.userId === user.id

        if (!isAdmin) {
            if (!isOwner) {
                return errorResponse("Unauthorized", 401)
            }
            // If they are owner but not admin, they can only "cancel" their pending request
            if (data.status !== "canceled") {
                return errorResponse("Unauthorized - you can only cancel your own requests", 403)
            }
            if (existingRequest.status !== "pending") {
                return errorResponse("Only pending requests can be canceled", 400)
            }
        }
        const request = await prisma.request.update({
            where: { id },
            data: validate.data
        })
        return successResponse(request, "Request updated successfully")
    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}