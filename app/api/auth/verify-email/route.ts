import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json()
        if (!data.verifyToken) {
            return errorResponse("Token is required", 400)
        }
        const user = await prisma.user.findFirst({
            where: {
                verifyCode: data.verifyToken,
                verifyCodeExpiry: {
                    gt: new Date()
                }
            }
        })
        if (!user) {
            return errorResponse("Invalid code or expired code", 401)
        }
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                verified: true,
                verifyCode: null,
                verifyCodeExpiry: null
            }
        })
        return successResponse({}, "Email verified successfully")
    } catch (error) {
        return errorResponse(`Internale server error: ${error}`, 500)
    }
}