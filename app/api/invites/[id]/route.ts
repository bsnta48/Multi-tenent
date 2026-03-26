import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { verifyUser } from "@/lib/auth";

export async function DELETE(req: NextRequest, ctx: { params: { id: string } }) {
    try {
        const user = await verifyUser()
        const { id } = await ctx.params
        
        if (!user || user.role !== "admin") {
            return errorResponse("Unauthorized", 401)
        }
        
        const inviteId = parseInt(id, 10)
        if (isNaN(inviteId)) {
            return errorResponse("Invalid invite ID", 400)
        }

        const existingInvite = await prisma.invite.findUnique({
            where: { id: inviteId }
        })

        if (!existingInvite) {
            return errorResponse("Invite not found", 404)
        }

        await prisma.invite.delete({
            where: { id: inviteId }
        })

        return successResponse(null, "Invite deleted successfully", 200)
    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}
