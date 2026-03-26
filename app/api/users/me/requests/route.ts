import { NextRequest } from "next/server";
import { verifyUser } from "@/lib/auth";
import { errorResponse, validationError, successResponse } from "@/lib/api-response";
import { createRequestSchema } from "@/lib/schema";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const user = await verifyUser()
        if (!user) {
            return errorResponse("Unauthorized", 401)
        }
        const requests = await prisma.request.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: "desc"
            }
        })
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
        const request = await prisma.request.create({
            data: {
                type: validate.data.type,
                event: validate.data.event,
                description: validate.data.description,
                user: {
                    connect: {
                        id: user.id
                    }
                }
            }
        })
        return successResponse(request, "Request created successfully")
    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}