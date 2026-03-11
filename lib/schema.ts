import { z } from "zod";

export const signUpSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long").regex(/^[a-zA-Z0-9]+$/, "Username must contain only letters and numbers"),
    email: z.string().email("Invalid email address"),
    // phone: z.string().min(10, "Phone number must be at least 10 digits long").max(15, "Phone number must be at most 15 digits long").regex(/^[0-9]+$/, "Phone number must contain only numbers"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export const createTenentSchema = signUpSchema.extend({
    subdomain: z.string().min(3, "Domain must be at least 3 characters long").regex(/^[a-zA-Z0-9-]+$/, "Domain must contain only letters and numbers").transform((value) => value.trim().toLowerCase().replace(/\s+/g, "-")),
    organizationName: z.string().min(3, "Organization name must be at least 3 characters long"),
})

export const signInSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
})

export const verifyTokenSchema = z.object({
    verifyCode: z.string().min(6, "Verification code must be at least 6 characters long"),
})

export type SessionPayload = {
    userId: string
    tenentId: string
    role: string
    username: string
    email: string
}
