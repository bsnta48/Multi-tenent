"use server"

import { prisma } from "@/lib/prisma";
import { createTenentSchema, signInSchema, signUpSchema, verifyTokenSchema } from "@/lib/schema";
import { createSession, destroySession } from "@/lib/session";
import { protocol, rootDomain } from "@/lib/utils";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sendVerificationEmail } from "@/lib/send-email";

const token = crypto.randomBytes(32).toString("hex");

const generateToken = crypto.createHash("sha256").update(token).digest("hex");

export type FormState = {
    data?: {
        subdomain?: string;
        username?: string;
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        organizationName?: string;
        verifyCode?: string;
    };
    errors?: {
        organizationName?: string[];
        subdomain?: string[];
        username?: string[];
        name?: string[];
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
    };
    success?: boolean | null;
    message?: string | null;
} | undefined;

let hits = 0;

export async function signOut() {
    await destroySession()
    redirect("/sign-in")
}

export async function checkToken(token: string) {
    const user = await prisma.user.findFirst({
        where: {
            verifyToken: token,
        }
    })
    if (!user) {
        return {
            success: false,
            message: "Invalid verification token",
        }
    }
    hits = 0;
    return {
        success: true,
        message: "Verification token is valid",
    }
}

export async function verifyToken(state: FormState, formData: FormData): Promise<FormState> {

    const validate = verifyTokenSchema.safeParse({
        verifyCode: formData.get("verifyCode") as string,
    })

    if (!validate.success) {
        return {
            success: false,
            message: "Invalid verification code",
        }
    }

    try {
        const token = formData.get("token") as string

        if (!token) {
            return {
                success: false,
                message: "Unauthorized",
            }
        }

        const user = await prisma.user.findFirst({
            where: {
                verifyToken: token,
            }
        })

        if (!user) {
            return {
                success: false,
                message: "Verify token is expired",
            }
        }

        if (hits > 3) {
            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    verifyToken: null,
                    verifyCode: null,
                    verifyCodeExpiry: null,
                }
            })
            return {
                success: false,
                message: "Too many attempts",
            }
        }

        if (!user.verifyCode || user.verifyCode !== validate.data.verifyCode) {
            hits++;
            return {
                success: false,
                message: "Verify code is invalid",
            }
        }

        if (!user.verifyCodeExpiry || user.verifyCodeExpiry < new Date()) {
            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    verifyCode: null,
                    verifyCodeExpiry: null,
                    verifyToken: null,
                }
            })
            return {
                success: false,
                message: "Verification code expired",
            }
        }

        const updateVerifiedUser = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                verified: true,
                verifyCode: null,
                verifyCodeExpiry: null,
                verifyToken: null,
            }
        })

        if (!updateVerifiedUser) {
            return {
                success: false,
                message: "Something went wrong",
            }
        }

        hits = 0;

    } catch (error) {
        return {
            success: false,
            message: "Something went wrong",
        }
    }

    redirect("/sign-in")
}

export async function signIn(state: FormState, formData: FormData): Promise<FormState> {
    const verifyToken = generateToken;
    let isVerified = false;
    try {
        const headersList = await headers();
        const host = headersList.get('host');
        const subdomain = host?.split('.')[0];

        // validate subdomain
        if (!subdomain) {
            return {
                success: false,
                message: "Subdomain is required to sign in"
            }
        }

        // check subdomain exist or not
        const tenent = await prisma.tenent.findUnique({
            where: {
                subdomain,
            }
        })

        if (!tenent) {
            return {
                success: false,
                message: "Subdomain not found"
            }
        }

        // validate form data
        const validate = signInSchema.safeParse({
            email: formData.get("email"),
            password: formData.get("password"),
        })

        const data = {
            data: {
                email: formData.get("email") as string,
                password: formData.get("password") as string,
            },
        }

        if (!validate.success) {
            return {
                ...data,
                success: false,
                errors: validate.error.flatten().fieldErrors,
            }
        }

        const user = await prisma.user.findUnique({
            where: {
                email: validate.data.email,
                tenentId: tenent.id,
            }
        })

        if (!user) {
            return {
                ...data,
                success: false,
                message: "Email or Password not valid"
            }
        }

        const isPasswordValid = await bcrypt.compare(validate.data.password, user.password);

        if (!isPasswordValid) {
            return {
                ...data,
                success: false,
                message: "Email or Password not valid"
            }
        }

        if (user.verified) {
            isVerified = true;
            await createSession({
                userId: user.id,
                email: user.email,
                username: user.username,
                tenentId: user.tenentId,
                role: user.role,
            })
        }

        if (!user.verified) {
            const verifyCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit random number
            const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    verifyCode,
                    verifyCodeExpiry,
                    verifyToken
                }
            })
            await sendVerificationEmail(user.email, verifyCode)
        }

    } catch (error) {
        return {
            success: false,
            message: "Something went wrong",
        }
    }

    if (isVerified) {
        redirect("/dashboard")
    }

    redirect("/verify-token/" + verifyToken)
}

export async function signUp(state: FormState, formData: FormData): Promise<FormState> {
    const headersList = await headers();
    const host = headersList.get('host');
    const subdomain = host?.split('.')[0];

    console.log("subdomain", subdomain);

    // validate subdomain
    if (!subdomain) {
        return {
            success: false,
            message: "Subdomain is required to create an account",
        }
    }

    // check subdomain exist or not
    const isSubdomainExist = await prisma.tenent.findUnique({
        where: {
            subdomain,
        }
    })

    if (!isSubdomainExist) {
        return {
            success: false,
            message: "Subdomain not found",
        }
    }

    // validate form data
    const validate = signUpSchema.safeParse({
        username: formData.get("username"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
    })

    const data = {
        data: {
            username: formData.get("username") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            password: formData.get("password") as string,
            confirmPassword: formData.get("confirmPassword") as string,
        },
    }

    if (!validate.success) {
        return {
            ...data,
            success: false,
            errors: validate.error.flatten().fieldErrors,
        }
    }

    const verifyToken = generateToken;
    try {

        const isUsernameExist = await prisma.user.findUnique({
            where: {
                username: validate.data.username,
            }
        })

        if (isUsernameExist) {
            return {
                ...data,
                success: false,
                errors: {
                    username: ["Username already exists"],
                }
            }
        }

        const isEmailExist = await prisma.user.findUnique({
            where: {
                email: validate.data.email,
            }
        })

        if (isEmailExist) {
            return {
                ...data,
                success: false,
                errors: {
                    email: ["Email already exists"],
                }
            }
        }

        const hashedPassword = await bcrypt.hash(validate.data.confirmPassword, 10);
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit random number
        const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        const user = await prisma.user.create({
            data: {
                username: validate.data.username,
                email: validate.data.email,
                password: hashedPassword,
                tenentId: isSubdomainExist.id,
                verifyCode,
                verifyCodeExpiry,
                verifyToken,
            }
        })

        if (!user) {
            return {
                success: false,
                message: "User not created",
            }
        }

        const { error } = await sendVerificationEmail(user.email, verifyCode)

        if (error) {
            console.log(error)
        }

    } catch (error) {
        return {
            success: false,
            message: "Something went wrong",
        }
    }

    redirect(`/verify-token/${verifyToken}`)
}

export async function createTenent(state: FormState, formData: FormData): Promise<FormState> {
    const validate = createTenentSchema.safeParse({
        organizationName: formData.get("organizationName") as string,
        subdomain: formData.get("subdomain") as string,
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
    })

    const data = {
        organizationName: formData.get("organizationName") as string,
        subdomain: formData.get("subdomain") as string,
        username: formData.get("username") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    }

    if (!validate.success) {
        return {
            data,
            success: false,
            errors: validate.error.flatten().fieldErrors,
        }
    }

    const sanitizeName = validate.data.subdomain;

    const verifyToken = generateToken;

    try {
        const isSubdomainExist = await prisma.tenent.findUnique({
            where: {
                subdomain: sanitizeName,
            }
        })

        if (isSubdomainExist) {
            return {
                data,
                success: false,
                errors: {
                    subdomain: ["Subdomain already exists"],
                }
            }
        }

        const hashedPassword = await bcrypt.hash(validate.data.password, 10);
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit random number
        const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        const tenent = await prisma.tenent.create({
            data: {
                name: validate.data.organizationName,
                subdomain: validate.data.subdomain,
                users: {
                    create: [
                        {
                            username: validate.data.username,
                            email: validate.data.email,
                            password: hashedPassword,
                            role: "admin",
                            verifyCode,
                            verifyCodeExpiry,
                            verifyToken,
                        }
                    ]
                }
            }
        })

        if (!tenent) {
            return {
                data: validate.data,
                success: false,
                message: "Tenent not created",
            }
        }


        const { error } = await sendVerificationEmail(validate.data.email, verifyCode)

        if (error) {
            console.log(error)
        }

    } catch (error) {
        return {
            success: false,
            message: "Something went wrong",
        }
    }

    redirect(`${protocol}://${sanitizeName}.${rootDomain}/verify-token/${verifyToken}`)
}