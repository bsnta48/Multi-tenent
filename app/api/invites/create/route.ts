import { errorResponse, successResponse, validationError } from "@/lib/api-response";
import { NextRequest } from "next/server";
import { verifyUser } from "@/lib/auth";
import { inviteSchema } from "@/lib/schema";
import { generateEmailToken, protocol, rootDomain } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { sendInviteLink } from "@/lib/send-email";

export async function POST(req: NextRequest) {
    try {
        const user = await verifyUser()
        if (!user) {
            return errorResponse("Unauthorized", 401)
        }
        if (user.role !== "admin") {
            return errorResponse("Unauthorized", 403)
        }
        const data = await req.json()
        const validate = inviteSchema.safeParse(data)
        if (!validate.success) {
            return validationError(validate.error)
        }
        const { email, role } = validate.data
        const inviteToken = generateEmailToken()
        await prisma.invite.upsert({
            where: {
                email
            },
            update: {
                token: inviteToken,
                expireAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
            },
            create: {
                email,
                token: inviteToken,
                expireAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
                role,
                tenentId: user.tenentId,
            }
        })
        const url = `${protocol}://${rootDomain}/invite/${inviteToken}`
        await sendInviteLink(email, url)
        return successResponse("Invite link sent successfully")
    } catch (error) {
        return errorResponse(`Internale server error: ${error}`, 500)
    }
}