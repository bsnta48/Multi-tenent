import { Resend } from "resend"
import { VerifyEmailTemplate, ForgotPasswordTemplate, InviteLinkTemplate } from "@/components/EmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, name: string, verifyUrl: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: `Acme <${process.env.RESEND_FROM_EMAIL}>`,
            to: [email],
            subject: "Verify your email address",
            react: VerifyEmailTemplate({ name, url: verifyUrl }),
        })
        return { data, error }
    } catch (error: any) {
        return { error }
    }
}

export async function sendForgotPasswordEmail(email: string, name: string, verifyUrl: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: `Acme <${process.env.RESEND_FROM_EMAIL}>`,
            to: [email],
            subject: "Forgot Password",
            react: ForgotPasswordTemplate({ name, url: verifyUrl }),
        })
        return { data, error }
    } catch (error: any) {
        return { error }
    }
}

export async function sendInviteLink(email: string, verifyUrl: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: `Acme <${process.env.RESEND_FROM_EMAIL}>`,
            to: [email],
            subject: "Invite Link",
            react: InviteLinkTemplate({ name: "", url: verifyUrl }),
        })
        return { data, error }
    } catch (error: any) {
        return { error }
    }
}