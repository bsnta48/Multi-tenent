import { ROLES } from "@/lib/constants"
import { SignUpSchema, UpdateSchema } from "./user.schema"
import z from "zod"

export type Role = typeof ROLES[keyof typeof ROLES]

export namespace User {
    export type CreateUser = z.infer<typeof SignUpSchema>

    export type UpdateUser = {
        username?: string
        role?: string
        userProfile?: any
        verified?: boolean
        verifyCode?: string | null
        verifyCodeExpiry?: Date | null
    }

    export type Data = {
        id: string
        username: string
        email: string
        role: string
        tenentId: string
        verified: boolean
        userProfile?: any
        createdAt: Date
        updatedAt: Date
        tokenVersion: number
    }
}