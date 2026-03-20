import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";


export async function GET(req: NextRequest, ctx: RouteContext<'/api/users/[id]'>) {
    try {
        const { id } = await ctx.params
        if (!id) {
            return errorResponse("User ID is required", 400)
        }
        const user = await prisma.user.findUnique({
            where: {
                id
            },
            omit: {
                verifyCode: true,
                verifyCodeExpiry: true,
                password: true,
            },
            include: {
                userProfile: {
                    omit: {
                        id: true,
                        userId: true,
                    }
                }
            }
        })
        if (!user) {
            return errorResponse("User not found", 404)
        }
        return successResponse(user, "User fetched successfully")
    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}