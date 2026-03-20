import { errorResponse, successResponse } from "@/lib/api-response";
import { isValidInvite } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, ctx: RouteContext<`/api/invites/accept/[token]`>) {
    try {
        const { token } = await ctx.params
        const invitedUser = await isValidInvite(token)
        if (!invitedUser) {
            return errorResponse("Invite not found or expired", 404)
        }
        return successResponse(invitedUser)
    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}