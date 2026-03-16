import { errorResponse, successResponse, validationError } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { createTenentSchema } from "@/lib/schema"
import { sendVerificationEmail } from "@/lib/send-email"
import { generateEmailToken, protocol, rootDomain } from "@/lib/utils"
import bcrypt from "bcryptjs"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        /**
         * Validate user's input data
         */
        const validate = createTenentSchema.safeParse(data)
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
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()
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