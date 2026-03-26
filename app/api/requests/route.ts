import { errorResponse, successResponse } from "@/lib/api-response";
import { verifyUser } from "@/lib/auth";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const user = await verifyUser()
        if (!user || user.role !== "admin") {
            return errorResponse("Unauthorized", 401)
        }

        const requests = await prisma.request.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                        userProfile: {
                            select: {
                                firstName: true,
                                lastName: true,
                            }
                        }
                    }
                }
            }
        })
        return successResponse(requests, "Requests fetched successfully")
    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}