import { NextRequest } from "next/server";
import { errorResponse, validationError, successResponse } from "@/lib/api-response";
import { resetPasswordSchema } from "@/lib/schema";
import bcrypt from "bcryptjs"
import { userService } from "@/lib/modules/user/user.service";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json()
        const { token, password } = data
        if (!token) {
            return errorResponse("Token is invalid", 400)
        }
        const user = await userService.findByQuery({
            verifyCode: token,
            verifyCodeExpiry: {
                gt: new Date()
            }
        })
        if (!user) {
            return errorResponse("Invalid token or expired token", 401)
        }
        const validate = resetPasswordSchema.safeParse({ password })
        if (!validate.success) {
            return validationError(validate.error)
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        await userService.update({
            id: user.id,
            password: hashedPassword,
            verifyCode: null,
            verifyCodeExpiry: null
        })
        return successResponse({}, "Password reset successfully")

    } catch (error) {
        return errorResponse(`Internale server error: ${error}`, 500)
    }
}