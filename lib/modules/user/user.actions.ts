"use server"

import { userService } from "./user.service";
import { User } from "./user.types";

export async function signUp(state: any, formData: FormData) {
    const payload = {
        organizationName: formData.get("organization-name") as string,
        username: formData.get("username") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirm-password") as string
    }
    try {
        const res = await userService.create(payload as User.CreateUser)
        if (!res.success) {
            return {
                ...res,
                data: payload
            }
        }
        return res
    } catch (error: any) {
        return {
            success: false,
            message: error.message,
            data: payload
        }
    }
}