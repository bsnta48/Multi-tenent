import { errorResponse, successResponse } from "@/lib/api-response";
import { verifyUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { tenentId?: string | undefined } }) {
    try {
        const user = await verifyUser()
        if (!user) {
            return errorResponse("Unauthorized", 401)
        }
        const users = await prisma.user.findMany({
            where: {
                tenentId: user.tenentId
            },
            omit: {
                verifyCode: true,
                verifyCodeExpiry: true,
                password: true,
            },
            include: {
                userProfile: {
                    omit:{
                        id: true,
                        userId: true,
                    }
                }
            }
        })
        return successResponse(users, "Users fetched successfully")
    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}