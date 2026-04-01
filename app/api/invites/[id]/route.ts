import { errorResponse, successResponse } from "@/lib/api-response";
import { verifyUser } from "@/lib/auth";
import { inviteService } from "@/lib/modules/invite/invite.service";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, ctx: { params: { id: number } }) {
    try {
        const user = await verifyUser()
        const { id } = await ctx.params

        if (!user || user.role !== "admin") {
            return errorResponse("Unauthorized", 401)
        }

        // const inviteId = parseInt(id, 10)
        // if (isNaN(inviteId)) {
        //     return errorResponse("Invalid invite ID", 400)
        // }

        const existingInvite = await inviteService.get(id)

        if (!existingInvite) {
            return errorResponse("Invite not found", 404)
        }

        await inviteService.drop(id)

        return successResponse(null, "Invite deleted successfully", 200)
    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}
