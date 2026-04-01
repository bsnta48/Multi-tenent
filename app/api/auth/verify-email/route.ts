import { errorResponse, successResponse } from "@/lib/api-response";
import { userService } from "@/lib/modules/user/user.service";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json()
        if (!data.verifyToken) {
            return errorResponse("Token is required", 400)
        }
        const user = await userService.findByQuery({
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
        await userService.update({
            id: user.id,
            verified: true,
            verifyCode: null,
            verifyCodeExpiry: null
        })
        return successResponse({}, "Email verified successfully")
    } catch (error) {
        return errorResponse(`Internale server error: ${error}`, 500)
    }
}