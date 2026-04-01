"use server"

import { verifyUser } from "@/lib/modules/auth/auth.service"
import { userService } from "@/lib/modules/user/user.service"
import { User } from "./user.types"

export async function getMe() {
    try {
        const user = await verifyUser()
        if (!user) {
            return { success: false, message: "Unauthorized" }
        }
        const data = await userService.get(user.id)
        return {
            success: true,
            message: "User data fetched successfully",
            data
        }
    } catch (error: any) {
        return { success: false, message: `Internal server error: ${error}` }
    }
}

export async function updateMe(state: any, formData: FormData) {
    const payload = {
        username: formData.get("username"),
        role: formData.get("role"),
        userProfile: {
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            phone: formData.get("phone"),
            address: formData.get("address"),
            city: formData.get("city"),
            state: formData.get("state"),
            zip: formData.get("zip"),
            country: formData.get("country"),
        }
    }
    try {
        const user = await verifyUser()
        if (!user) {
            return { success: false, message: "Unauthorized" }
        }
        const data = await userService.update(user.id, payload as User.UpdateUser)
        if (!data.success) {
            return {
                success: false,
                message: "Failed to update user",
                errors: data.errors
            }
        }
        return {
            success: true,
            message: "User updated successfully",
            data: data.data
        }
    } catch (error: any) {
        return { success: false, message: `Internal server error: ${error}` }
    }
}