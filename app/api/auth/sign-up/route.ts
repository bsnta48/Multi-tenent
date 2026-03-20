import { errorResponse, successResponse, validationError } from "@/lib/api-response"
import { isValidInvite } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createTenentSchema, createInviteSchema } from "@/lib/schema"
import { sendVerificationEmail } from "@/lib/send-email"
import { generateEmailToken, protocol, rootDomain } from "@/lib/utils"
import bcrypt from "bcryptjs"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { inviteToken, ...rest } = await request.json()
        /**
         * Verify invited user
         */
        if (inviteToken) {
            const validate = createInviteSchema.safeParse(rest)
            if (!validate.success) {
                return validationError(validate.error)
            }
            const { tenentId, username, email, password, role } = validate.data
            const invitedUser = await isValidInvite(inviteToken)
            if (!invitedUser) {
                return errorResponse("Invite not found or expired", 404)
            }
            const [usernameExist, emailExist] = await Promise.all([
                prisma.user.findUnique({
                    where: { username }
                }),
                prisma.user.findUnique({
                    where: { email }
                })
            ])
            if (usernameExist || emailExist) {
                return errorResponse("Username or Email already exist", 400)
            }
            const hashedPassword = await bcrypt.hash(password, 10)
            const user = await prisma.user.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                    role,
                    tenentId,
                    verified: true,
                    userProfile: {
                        create: {
                            firstName: "",
                            lastName: "",
                        }
                    }
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    verified: true,
                }
            })
            await prisma.invite.update({
                where: {
                    email: invitedUser.email,
                },
                data: {
                    used: true
                }
            })
            return successResponse(user, "User created successfully")
        }

        /**
         * Validate user's input data
         */
        const validate = createTenentSchema.safeParse(rest)
        if (!validate.success) {
            return validationError(validate.error)
        }
        const { subdomain, organizationName, username, email, password } = validate.data

        /**
         * Check the user has already exist
         */
        const [subdomainExist, usernameExist, emailExist] = await Promise.all([
            prisma.tenent.findUnique({
                where: { subdomain }
            }),
            prisma.user.findUnique({
                where: { username }
            }),
            prisma.user.findUnique({
                where: { email }
            })
        ])
        if (subdomainExist || usernameExist || emailExist) {
            return errorResponse("Subdomain, username or email already exists", 400)
        }

        /**
         * Hash the password
         */
        const hashedPassword = await bcrypt.hash(password, 10)

        /**
         * Generate verification code
         */
        const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000)

        /**
         * Create tenent and user
         */
        const generateVerifyToken = generateEmailToken()
        const tenent = await prisma.tenent.create({
            data: {
                name: organizationName,
                subdomain,
                users: {
                    create: {
                        username,
                        email,
                        password: hashedPassword,
                        role: "admin",
                        verifyCode: generateVerifyToken,
                        verifyCodeExpiry,
                        userProfile: {
                            create: {
                                firstName: "",
                                lastName: ""
                            }
                        }
                    }
                }
            },
            include: {
                users: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                        verified: true,
                    }
                },
            }
        })

        /**
         * Send verification email
         */
        const verifyUrl = `${protocol}://${rootDomain}/verify-email/${generateVerifyToken}`;
        await sendVerificationEmail(email, username, verifyUrl)

        return successResponse(tenent, "Tenent created successfully.")

    } catch (error) {
        return errorResponse(`Internale server error: ${error}`, 500)
    }
}