import { errorResponse, successResponse, validationError } from "@/lib/api-response"
import { verifyUser } from "@/lib/auth"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { usernameSchema } from "@/lib/schema"
import { userService } from "@/lib/modules/user/user.service"

export async function GET(req: NextRequest) {
    try {
        const user = await verifyUser()
        if (!user) {
            return errorResponse("Unauthorized", 401)
        }
        const res = await userService.get(user.id)
        return successResponse(res)
    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}

export async function PUT(req: NextRequest) {
    try {
        const user = await verifyUser()
        if (!user) {
            return errorResponse("Unauthorized", 401)
        }

        const data = await req.json()
        const { username, userProfile } = data

        const validate = usernameSchema.safeParse({ username })
        if (!validate.success) {
            const error = validate.error
            return validationError(error)
        }

        // Update user properties
        const updateData: any = {}
        if (username) updateData.username = username

        // Update profile
        if (userProfile) {
            updateData.userProfile = {
                upsert: {
                    create: userProfile,
                    update: userProfile
                }
            }
        }

        const res = await userService.update({
            id: user.id,
            ...updateData
        })
        return successResponse(res, "Profile updated successfully")
    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}