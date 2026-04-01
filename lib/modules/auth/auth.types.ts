import z from "zod"
import { SignInSchema } from "./auth.schema"

export namespace Token {
    export type Access = {
        userId: string
        tenentId: string,
        tokenVersion: number
    }
    export type Refresh = {
        userId: string,
        type: string,
        deviceName: string,
        rememberMe: boolean
    }
}

export namespace Auth {
    export type SignIn = z.infer<typeof SignInSchema>
}