import { errorResponse, successResponse, validationError } from "@/lib/api-response"
import { createToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { signInSchema } from "@/lib/schema"
import setToken from "@/lib/set-token"
import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const data = await req.json()

        /**
         * Validate user's input data
         */
        const validate = signInSchema.safeParse(data)
        if (!validate.success) {
            return validationError(validate.error)
        }
        const { email, password } = validate.data

        /**
         * Find user by email
         */
        const user = await prisma.user.findUnique({
            where: { email }
        })
        if (!user) {
            return errorResponse("Email address or password is not correct", 400)
        }

        /**
         * Check user is verified
         */
        if (!user.verified) {
            return errorResponse("Email address is not verified, please verify your email address.", 400)
        }

        /**
         * Check is password valid
         */
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return errorResponse("Email address or password is not correct", 400)
        }

        /**
         * Set cookies in http
         */
        const accessTokenPayload = {
            userId: user.id,
            tenentId: user.tenentId,
            role: user.role,
            username: user.username,
            email: user.email
        }
        const refreshTokenPayload = {
            userId: user.id,
            type: "refresh",
            expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000)
        }
        await setToken("accessToken", accessTokenPayload, 60 * 15)
        await setToken("refreshToken", refreshTokenPayload, 60 * 60 * 24 * 7)
        return successResponse("User logged in successfully")
    } catch (error) {
        return errorResponse(`Internale server error: ${error}`, 500)
    }
}