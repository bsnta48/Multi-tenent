import { verifyUser } from "@/lib/modules/auth/auth.service"
import { tenentService } from "@/lib/modules/tenents/tenent.service"

export async function getTenent() {
    try {
        const user = await verifyUser()
        if (!user) {
            return { success: false, message: "Unauthorized" }
        }
        const data = await tenentService.get(user.tenentId)
        return {
            success: true,
            message: "Tenent data fetched successfully",
            data
        }
    } catch (error: any) {
        return { success: false, message: `Internal server error: ${error}` }
    }
}