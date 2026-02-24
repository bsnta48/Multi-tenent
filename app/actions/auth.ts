"use server"

import { headers } from "next/headers";
import { protocol, rootDomain } from "@/lib/utils";
import { signUpSchema, createTenentSchema } from "@/lib/schema";
import { extractSubdomain } from "@/helpers/helpers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";

const resend = new Resend(process.env.RESEND_API_KEY)

export type FormState = {
    data?: {
        subdomain?: string;
        username?: string;
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        organizationName?: string;
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

export async function signUp(state: FormState, formData: FormData): Promise<FormState> {
    try {
        const headersList = await headers();
        const host = headersList.get('host');
        const url = host ? `${protocol}://${host}` : null;
        const subdomain = extractSubdomain({ host, url });

        // validate subdomain
        if (!subdomain) {
            return {
                success: false,
                errors: {
                    subdomain: ["Subdomain is required to create an account"],
                }
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
                errors: {
                    subdomain: ["Subdomain not found"],
                }
            }
        }

        // validate form data
        const validate = signUpSchema.safeParse({
            username: formData.get("username"),
            email: formData.get("email"),
            password: formData.get("password"),
            confirmPassword: formData.get("confirmPassword"),
        })

        const data = {
            data: {
                username: formData.get("username") as string,
                email: formData.get("email") as string,
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

        const user = await prisma.user.create({
            data: {
                username: validate.data.username,
                email: validate.data.email,
                password: hashedPassword,
                tenentId: isSubdomainExist.id,
            }
        })

        if (!user) {
            return {
                success: false,
                message: "User not created",
            }
        }

        const sentEmail = await sendVerificationEmail(user.email)

        return {
            success: true,
            message: "User created successfully",
        }
    } catch (error) {
        return {
            success: false,
            message: "Something went wrong",
        }
    }
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

        const tenent = await prisma.tenent.create({
            data: {
                name: validate.data.organizationName,
                subdomain: validate.data.subdomain,
            }
        })

        const hashedPassword = await bcrypt.hash(validate.data.password, 10);

        const user = await prisma.user.create({
            data: {
                username: validate.data.username,
                email: validate.data.email,
                password: hashedPassword,
                tenentId: tenent.id,
                role: "admin",
            }
        })

        if (!tenent || !user) {
            return {
                data: validate.data,
                success: false,
                message: "Tenent not created",
            }
        }

        await sendVerificationEmail(user.email)
    } catch (error) {
        return {
            success: false,
            message: "Something went wrong",
        }
    }

    redirect(`${protocol}://${sanitizeName}.${rootDomain}`)
}

export async function sendVerificationEmail(email: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: `Acme <${process.env.RESEND_FROM_EMAIL}>`,
            to: [email],
            subject: "Verify your email address",
            react: EmailTemplate({ name: "Basant", url: "https://google.com" }),
        })

        if (error) {
            return {
                success: false,
                message: error.message || "Failed to send verification email",
            }
        }

        return {
            success: true,
            message: "Verification email sent successfully",
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "An unexpected error occurred while sending verification email",
        }
    }
}