import { NextRequest } from "next/server";
import { errorResponse, validationError, successResponse } from "@/lib/api-response";
import { resetPasswordSchema } from "@/lib/schema";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
    try {
        const data = await req.json()
        const { token, password } = data
        if (!token) {
            return errorResponse("Token is invalid", 400)
        }
        const user = await prisma.user.findFirst({
            where: {
                verifyCode: token,
                verifyCodeExpiry: {
                    gt: new Date()
                }
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
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                password: hashedPassword,
                verifyCode: null,
                verifyCodeExpiry: null
            }
        })
        return successResponse("Password reset successfully")

    } catch (error) {
        return errorResponse(`Internale server error: ${error}`, 500)
    }
}