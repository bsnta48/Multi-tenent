"use server"

import { cookies } from "next/headers";
import { userService } from "../user/user.service";
import { SignInSchema } from "./auth.schema";
import { Auth, Token } from "./auth.types";
import { comparePassword, getDeviceName } from "./auth.utils";
import { verifyToken, setToken, deleteToken, refreshAccessToken } from "./session.service";

export async function verifyUser() {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) return null

    let payload: Token.Access

    try {
        payload = await verifyToken(accessToken, "access")
    } catch {
        return null
    }

    const user = await userService.findByQuery({
        id: payload.userId
    })

    if (!user) return null

    if (payload.tokenVersion !== user.tokenVersion) {
        return null
    }

    return user
}

export async function verifyAndRefreshSession() {
    let verify = await verifyUser()
    if (!verify) {
        await refreshAccessToken()
        verify = await verifyUser()
    }
    return verify
}

export async function authenticateUser(data: Auth.SignIn) {
    const { rememberMe, ...rest } = data
    const validate = SignInSchema.safeParse({ ...rest, rememberMe: !rememberMe ? "off" : "on" })
    if (!validate.success) {
        return {
            success: false,
            error: validate.error.flatten().fieldErrors,
            message: "Please check the form for errors"
        }
    }
    const { email, password } = validate.data
    const user = await userService.findByQuery({
        email,
        verified: true
    });

    if (!user) {
        return {
            success: false,
            message: "User not verified",
        }
    }

    const isValid = await comparePassword(password, user.password);

    if (!isValid) return {
        success: false,
        message: "Email or Password is incorrect",
    };

    const accessTokenPayload = {
        userId: user.id,
        tenentId: user.tenentId,
        tokenVersion: user.tokenVersion
    }

    const deviceName = await getDeviceName()

    const refreshTokenPayload = {
        userId: user.id,
        type: "refresh",
        deviceName,
        rememberMe: rememberMe === 'on',
    }

    await setToken("accessToken", accessTokenPayload)
    await setToken("refreshToken", refreshTokenPayload)

    return {
        success: true,
        message: "User logged in successfully."
    }
}

export async function destroySession() {
    try {
        await deleteToken("access")
        await deleteToken("refresh")
    } catch {
        throw new Error("Failed to destroy session")
    }
}

// verify email
export async function verifyEmail(token: string) {
    try {
        const user = await userService.findByQuery({
            verifyCode: token,
            verifyCodeExpiry: {
                gt: new Date()
            }
        })
        if (!user) {
            return {
                success: false,
                message: "Invalid or expired verification token"
            }
        }
        const res = await userService.update(user.id, {
            verified: true,
            verifyCode: null,
            verifyCodeExpiry: null
        })
        if(!res.success){
            return {
                success: false,
                message: "Email verification failed."
            }
        }
        return {
            success: true,
            message: "Email verified successfully"
        }
    } catch (error) {
        return {
            success: false,
            message: "Failed to verify email"
        }
    }
}