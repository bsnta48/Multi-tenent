import { z } from "zod";

export const usernameSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long").regex(/^[a-zA-Z0-9]+$/, "Username must contain only letters and numbers")
})

export const signUpSchema = usernameSchema.extend({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
})

export const profileSchema = z.object({
    firstName: z.string().min(3, "First name must be at least 3 characters long"),
    lastName: z.string().min(3, "Last name must be at least 3 characters long"),
    phone: z.string().min(10, "Phone number must be at least 10 digits long").max(20, "Phone number must be at most 20 digits long"),
    dob: z.string(),
    address: z.string(),
    branch: z.string(),
    department: z.string(),
    jobTitle: z.string(),
    jobDescription: z.string(),
    joinDate: z.string(),
    level: z.string(),
    officialContact: z.string().min(10, "Official contact must be at least 10 digits long").max(20, "Official contact must be at most 20 digits long"),
    province: z.string(),
    servicePeriod: z.string(),
    status: z.string(),
    subDepartment: z.string(),
    unit: z.string()
})

export const createTenentSchema = signUpSchema.extend({
    organizationName: z.string().min(3, "Organization name must be at least 3 characters long"),
})

export const signInSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
})

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address")
})

export const verifyTokenSchema = z.object({
    verifyCode: z.string().min(6, "Verification code must be at least 6 characters long"),
})

export const resetPasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
})

export const inviteSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["admin", "member"])
})

export const createInviteSchema = usernameSchema.extend({
    email: z.string().email("Invalid email address"),
    role: z.enum(["admin", "member"]),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    tenentId: z.string()
})

export interface userSchema{
    id: string
    tenentId: string
    username: string
    role: string
    email: string
    userProfile: {
        firstName: string
        lastName: string
        phone: string
        dob: string
        address: string
        branch: string
        department: string
        jobTitle: string
        jobDescription: string
        joinDate: string
        level: string
        officialContact: string
        province: string
        servicePeriod: string
        status: string
        subDepartment: string
        unit: string
    }
}

export interface tenentScheme{
    id: string
    name: string
    createdAt: string
    updatedAt: string
}

export type SessionPayload = {
    userId: string
    tenentId: string
    role: string
    username: string
    email: string
}
