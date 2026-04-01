import { verifyUser } from "@/lib/modules/auth/auth.service"
import { requestService } from "@/lib/modules/requests/request.service"

export async function getRequests() {
    try {
        const user = await verifyUser()
        if (!user) {
            return { success: false, message: "Unauthorized" }
        }
        const data = await requestService.getAllByUser(user.id)
        return {
            success: true,
            message: "Requests fetched successfully",
            data
        }
    } catch (error: any) {
        return { success: false, message: `Internal server error: ${error}` }
    }
}

export async function addRequest(state: any, formData: FormData) {
    try {
        const user = await verifyUser()
        if (!user) {
            return { success: false, message: "Unauthorized" }
        }
        const data = await requestService.create({
            type: formData.get("type") as string,
            event: formData.get("event") as string,
            description: formData.get("description") as string,
            userId: user.id,
            tenentId: user.tenentId
        })
        return {
            success: true,
            message: "Request added successfully",
            data
        }
    } catch (error: any) {
        return { success: false, message: `Internal server error: ${error}` }
    }
}

export async function updateRequest(state: any, payload: { formData: FormData, id: string }) {
    try {
        const user = await verifyUser()
        if (!user) {
            return { success: false, message: "Unauthorized" }
        }
        const { id, formData } = payload
        const data = await requestService.update({
            id,
            status: formData.get("status") as string,
            updatedBy: formData.get("updatedBy") as string,
            replyText: formData.get("replyText") as string
        })
        return {
            success: true,
            message: "Request updated successfully",
            data
        }
    } catch (error: any) {
        return { success: false, message: `Internal server error: ${error}` }
    }
}