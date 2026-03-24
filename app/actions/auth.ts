import { redirect } from "next/navigation";
import z from "zod";

const PasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters long")
}).refine((data) => (data.password === data.confirmPassword), {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

const SignUpSchema = z.object({
    organizationName: z.string().min(3, "Organization name must be at least 3 characters long"),
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
}).merge(PasswordSchema)

export async function signUp(state: any, formData: FormData) {
    const payload = {
        organizationName: formData.get("organization-name"),
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirm-password")
    }
    try {
        const validate = SignUpSchema.safeParse(payload)
        if (!validate.success) {
            const errors = z.treeifyError(validate.error)
            return { success: false, data: payload, error: errors.properties }
        }
        const res = await fetch("/api/auth/sign-up", {
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

const SignInSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long")
})

export async function signIn(state: any, formData: FormData) {
    const payload = {
        email: formData.get("email"),
        password: formData.get("password")
    }
    try {
        const validate = SignInSchema.safeParse(payload)
        if (!validate.success) {
            const errors = z.treeifyError(validate.error)
            return { success: false, data: payload, error: errors.properties }
        }
        const res = await fetch("/api/auth/sign-in", {
            method: "POST",
            body: JSON.stringify(validate.data)
        })
        const result = await res.json()
        if (!result.success) {
            return {
                ...result,
                data: payload
            }
        }
    } catch (error: any) {
        return {
            ...error,
            data: payload
        }
    }
    redirect("/dashboard")
}

export async function signOut() {
    try {
        const res = await fetch("/api/auth/logout", {
            method: "POST"
        })
        const result = await res.json()
        if (!result.success) {
            return result
        }
    } catch (error: any) {
        return error
    }
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

export async function verifyEmail(token: string) {
    try {
        const res = await fetch("/api/auth/verify-email", {
            method: "POST",
            body: JSON.stringify({ verifyToken: token })
        })
        const data = await res.json()
        return data
    } catch (error) {
        return error
    }
}

const AcceptInviteSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters long"),
    email: z.string().email(),
    role: z.enum(["admin", "member"]),
    tenentId: z.string()
}).refine((data) => (data.password === data.confirmPassword), {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

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