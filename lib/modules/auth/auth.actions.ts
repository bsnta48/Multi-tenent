"use server"

import { redirect } from "next/navigation";
import z from "zod";
import { AcceptInviteSchema, PasswordSchema } from "./auth.schema";
import { authenticateUser, destroySession, verifyEmail } from "./auth.service";
import { Auth } from "./auth.types";

export async function signIn(state: any, formData: FormData) {
    const payload = {
        email: formData.get("email"),
        password: formData.get("password"),
        rememberMe: formData.get("rememberMe")
    }
    const res = await authenticateUser(payload as Auth.SignIn)
    if (!res.success) {
        return {
            ...res,
            data: payload
        }
    }
    redirect("/dashboard")
}

export async function signOut() {
    await destroySession()
    redirect("/sign-in")
}

const ForgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address")
})

export async function forgotPassword(state: any, formData: FormData) {
    const payload = {
        email: formData.get("email")
    }
    try {
        const validate = ForgotPasswordSchema.safeParse(payload)
        if (!validate.success) {
            const errors = z.treeifyError(validate.error)
            return { success: false, data: payload, error: errors.properties }
        }
        const res = await fetch("/api/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify(validate.data)
        })
        const result = await res.json()
        return result
    } catch (error: any) {
        return {
            ...error,
            data: payload
        }
    }
}

export async function resetPassword(state: any, payload: { formData: FormData, token: string }) {
    const { formData, token } = payload
    const data = {
        password: formData.get("password"),
        confirmPassword: formData.get("confirm-password")
    }
    try {
        const validate = PasswordSchema.safeParse(data)
        if (!validate.success) {
            const errors = z.treeifyError(validate.error)
            return { success: false, data: payload, error: errors.properties }
        }
        const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            body: JSON.stringify({ password: validate.data.password, token })
        })
        const result = await res.json()
        return result
    } catch (error: any) {
        return {
            ...error,
            data: payload
        }
    }
}

export async function acceptInvite(state: any, payload: { formData: FormData, token: string, email: string, role: string, tenentId: string }) {
    const { formData, token, email, role, tenentId } = payload
    const data = {
        username: formData.get("username"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirm-password"),
        email,
        role,
        tenentId
    }
    try {
        const validate = AcceptInviteSchema.safeParse(data)
        if (!validate.success) {
            const errors = z.treeifyError(validate.error)
            return { success: false, data, error: errors.properties }
        }
        const res = await fetch("/api/auth/sign-up", {
            method: "POST",
            body: JSON.stringify({ ...validate.data, inviteToken: token })
        })
        const result = await res.json()
        return result
    } catch (error: any) {
        return {
            ...error,
            data
        }
    }
}

export async function verifyEmailAction(token: string) {
    const res = await verifyEmail(token)
    if (res.success) {
        return res
    }
    return res
}