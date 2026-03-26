import { NextRequest } from "next/server";
import { errorResponse, successResponse, validationError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { verifyUser } from "@/lib/auth";
import { usernameSchema } from "@/lib/schema";


export async function GET(req: NextRequest, ctx: RouteContext<'/api/users/[id]'>) {
    try {
        const { id } = await ctx.params
        const user = await verifyUser()
        if (!user) {
            return errorResponse("Unauthorized", 401)
        }
        if (!id) {
            return errorResponse("User ID is required", 400)
        }
        const userData = await prisma.user.findUnique({
            where: {
                id
            },
            omit: {
                verifyCode: true,
                verifyCodeExpiry: true,
                password: true,
            },
            include: {
                userProfile: {
                    omit: {
                        id: true,
                        userId: true,
                    }
                }
            }
        })
        if (!userData) {
            return errorResponse("User not found", 404)
        }
        return successResponse(userData, "User fetched successfully")
    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}


export async function PUT(req: NextRequest, ctx: RouteContext<'/api/users/[id]'>) {
    try {
        const user = await verifyUser()
        const { id } = await ctx.params
        if (!user || (user.role !== "admin" && user.id !== id)) {
            return errorResponse("Unauthorized", 401)
        }

        if (!id) {
            return errorResponse("User ID is required", 400)
        }

        const body = await req.json()
        const { username, role, userProfile } = body

        const validateUsername = usernameSchema.safeParse({ username })
        if (!validateUsername.success) {
            const error = validateUsername.error
            return validationError(error)
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id }
        })

        if (!existingUser) {
            return errorResponse("User not found", 404)
        }

        if (user?.id === id && user.role !== role) {
            return errorResponse("You can not change your role", 400)
        }

        // Update user data
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...(username && { username }),
                ...(role && { role, tokenVersion: { increment: 1 } }),
                userProfile: userProfile ? {
                    upsert: {
                        create: {
                            firstName: userProfile.firstName || null,
                            lastName: userProfile.lastName || null,
                            phone: userProfile.phone || null,
                            address: userProfile.address || null,
                            jobTitle: userProfile.jobTitle || null,
                            department: userProfile.department || null,
                        },
                        update: {
                            firstName: userProfile.firstName || null,
                            lastName: userProfile.lastName || null,
                            phone: userProfile.phone || null,
                            address: userProfile.address || null,
                            jobTitle: userProfile.jobTitle || null,
                            department: userProfile.department || null,
                        }
                    }
                } : undefined
            },
            omit: {
                verifyCode: true,
                verifyCodeExpiry: true,
                password: true,
            },
            include: {
                userProfile: {
                    omit: {
                        id: true,
                        userId: true,
                    }
                }
            }
        })

        return successResponse(updatedUser, "User updated successfully", 200)
    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}

export async function DELETE(req: NextRequest, ctx: RouteContext<'/api/users/[id]'>) {
    try {
        const user = await verifyUser()
        const { id } = await ctx.params

        if (!user || user.role !== "admin") {
            return errorResponse("Unauthorized", 401)
        }

        if (user.id === id) {
            return errorResponse("You can not delete yourself", 400)
        }

        if (!id) {
            return errorResponse("User ID is required", 400)
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id }
        })

        if (!existingUser) {
            return errorResponse("User not found", 404)
        }

        // Delete the user
        await prisma.user.delete({
            where: { id, role: { not: 'admin' } },
        })

        // Delete user's profile first (if it exists)
        await prisma.userProfile.deleteMany({
            where: { userId: id }
        })

        return successResponse(null, "User deleted successfully", 200)
    } catch (error) {
        return errorResponse(`Internal server error: ${error}`, 500)
    }
}
