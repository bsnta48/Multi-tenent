import { errorResponse, successResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, ctx: RouteContext<`/api/invites/accept/[token]`>) {
    try {
        const { token } = await ctx.params
        const invitedUser = await prisma.invite.findUnique({
            where: {
                token,
                expireAt: {
                    gt: new Date()
                },
                used: false
            },
            select: {
                email: true,
                role: true,
                tenentId: true
            }
        })
        if (!invitedUser) {
            return errorResponse("Invite not found or expired", 404)
        }
        return successResponse(invitedUser)
    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}