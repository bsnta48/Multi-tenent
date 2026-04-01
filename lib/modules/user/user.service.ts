"server-only"

import { Prisma } from "@/generated/prisma"
import { inviteService } from "@/lib/modules/invite/invite.service"
import bcrypt from "bcryptjs"
import { prisma } from "../../prisma"
import { SignUpSchema, UpdateSchema, UserSchema } from "./user.schema"
import { User } from "./user.types"
import { generateEmailToken, protocol, rootDomain } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/send-email";

export const userQueryOptions = Prisma.validator<Prisma.UserDefaultArgs>()({
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

export async function isValidToken(token: string) {
    const invitedUser = await userService.findByQuery({
        token,
        expireAt: {
            gt: new Date()
        },
        used: false
    })
    if (!invitedUser) {
        return null
    }
    return invitedUser
}

// get all users
function getAll(tenentId: string) {
    return prisma.user.findMany({
        where: {
            tenentId: tenentId
        },
        ...userQueryOptions
    })
}

// get signle user
function get(id: string) {
    return prisma.user.findUnique({
        where: {
            id
        },
        ...userQueryOptions
    }) as Promise<User.Data | null>
}

// create user
async function create(data: User.CreateUser, inviteToken?: string) {
    if (inviteToken) {
        const validInvite = await inviteService.isValidInvite(inviteToken)
        if (!validInvite) {
            return {
                success: false,
                message: "Invalid invite",
            }
        }
        if (validInvite.email !== data.email) {
            return {
                success: false,
                message: "Invalid email address",
            }
        }
        const validate = UserSchema.safeParse(data)
        if (!validate.success) {
            return {
                success: false,
                error: validate.error.flatten().fieldErrors,
                message: "Invalid fields"
            }
        }
        const { email, username, password } = validate.data
        const { role, tenentId } = validInvite
        const hashedPassword = await bcrypt.hash(password, 10)
        const res = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role,
                tenentId,
                userProfile: {
                    create: {
                        firstName: "",
                        lastName: ""
                    }
                }
            }
        })
        return {
            success: true,
            message: "User created successfully",
            data: res
        }
    }

    const payload = {
        organizationName: data.organizationName,
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword
    }

    const validate = SignUpSchema.safeParse(payload)
    if (!validate.success) {
        return {
            success: false,
            error: validate.error.flatten().fieldErrors,
            message: "Invalid fields"
        }
    }
    const { organizationName, username, email, password } = validate.data
    const slug = organizationName.toLowerCase().replace(/\s+/g, '-')
    const hashedPassword = await bcrypt.hash(password, 10)
    const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000)
    const generateVerifyToken = generateEmailToken()
    const verifyUrl = `${protocol}://${rootDomain}/verify-email/${generateVerifyToken}`;
    await sendVerificationEmail(data.email, data.username, verifyUrl)
    const result = await prisma.tenent.create({
        data: {
            name: organizationName,
            slug,
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
                },
            }
        }
    })
    return {
        success: true,
        message: "Organization created successfully. Please check your email to verify your account.",
        data: result
    }
}

// update user
async function update(id: string, data: User.UpdateUser) {
    const validate = UpdateSchema.safeParse(data)
    if (!validate.success) {
        return {
            success: false,
            errors: validate.error.flatten().fieldErrors
        }
    }
    const { userProfile, ...userData } = validate.data;
    const user = await prisma.user.update({
        where: {
            id
        },
        data: {
            ...userData,
            userProfile: userProfile ? {
                update: {
                    ...userProfile,
                    dob: userProfile.dob ? new Date(userProfile.dob) : undefined,
                    joinDate: userProfile.joinDate ? new Date(userProfile.joinDate) : undefined,
                }
            } : undefined
        },
        ...userQueryOptions
    })

    if (!user) {
        return {
            success: false,
            message: "User not found"
        }
    }

    return {
        success: true,
        data: user
    }
}

// delete user
function drop(id: string) {
    return prisma.user.delete({
        where: { id },
        include: {
            userProfile: true
        }
    })
}

// find user by email with password
function findByQuery(query: any) {
    return prisma.user.findFirst({
        where: query,
    })
}

export const userService = {
    getAll,
    get,
    create,
    update,
    drop,
    findByQuery
}
