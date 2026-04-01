import { errorResponse, successResponse } from "@/lib/api-response";
import { verifyToken } from "@/lib/modules/auth/auth.service";
import setToken from "@/lib/set-token";
import { TokenPayload } from "@/lib/types";
import { cookies } from "next/headers";
import { hashToken } from "@/lib/utils";
import { refreshService } from "@/lib/modules/refresh/refresh.service";
import { userService } from "@/lib/modules/user/user.service";

export async function POST() {
    try {
        const cookieStore = await cookies()
        const refreshToken = cookieStore.get("refreshToken")?.value
        if (!refreshToken) {
            return errorResponse("Unauthorized", 401)
        }
        await verifyToken(refreshToken, "refresh")
        const tokenHash = hashToken(refreshToken)
        const user = await refreshService.get(tokenHash)
        const currentDate = new Date()
        if (!user || user.expiresAt < currentDate) {
            await refreshService.drop(tokenHash)
            return errorResponse("Invalid token", 401)
        }
        const findUser = await userService.get(user.userId)
        if (!findUser) {
            return errorResponse("User not found", 404)
        }
        const tokenPayload: TokenPayload = {
            userId: findUser.id,
            tenentId: findUser.tenentId,
            tokenVersion: findUser.tokenVersion
        }
        await setToken("accessToken", tokenPayload)
        return successResponse("Token refreshed successfully")
    } catch (error) {
        return errorResponse(`Internale server error: ${error}`, 500)
    }
}