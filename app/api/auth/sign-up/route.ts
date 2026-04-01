import { errorResponse, successResponse, validationError } from "@/lib/api-response"
import { isValidInvite } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createTenentSchema, createInviteSchema } from "@/lib/schema"
import { sendVerificationEmail } from "@/lib/send-email"
import { tenentService } from "@/lib/modules/tenents/tenent.service"
import { userService } from "@/lib/modules/user/user.service"
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
                userService.findByQuery({
                    username
                }),
                userService.findByQuery({
                    email,
                    tenentId
                })
            ])
            if (usernameExist || emailExist) {
                return errorResponse("Username or Email already exist", 400)
            }
            const hashedPassword = await bcrypt.hash(password, 10)
            const user = await userService.create({
                username,
                email,
                password: hashedPassword,
                role,
                tenentId,
                verified: true,
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
        const { organizationName, username, email, password } = validate.data

        /**
         * Check the user has already exist
         */
        const slug = organizationName.toLowerCase().replace(/\s+/g, '-')
        const [slugExist, usernameExist, emailExist] = await Promise.all([
            tenentService.findByQuery({
                where: { slug }
            }),
            userService.findByQuery({
                username
            }),
            userService.findByQuery({
                email
            })
        ])
        if (slugExist || usernameExist || emailExist) {
            return errorResponse("Organization name or username or email already exists", 400, rest)
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
        const tenent = await tenentService.create({
            name: organizationName,
            slug,
            logo: "",
            description: "",
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
        })

        /**
         * Send verification email
         */
        const verifyUrl = `${protocol}://${rootDomain}/verify-email/${generateVerifyToken}`;
        await sendVerificationEmail(email, username, verifyUrl)

        return successResponse(tenent, "Account has been created successfully. Please check your email to verify your account.")

    } catch (error) {
        return errorResponse(`Internale server error: ${error}`, 500)
    }
}