import { errorResponse, successResponse, validationError } from "@/lib/api-response"
import { authenticateUser, setToken } from "@/lib/modules/auth/auth.service"
import { signInSchema } from "@/lib/schema"
import { NextRequest } from "next/server"
import { UAParser } from "ua-parser-js"

export async function POST(req: NextRequest) {
    try {
        const userAgent = req.headers.get("user-agent") || ""
        const data = await req.json()

        const parser = new UAParser(userAgent)
        const result = parser.getResult()
        const deviceName = `${result.browser.name} on ${result.os.name}`

        /**
         * Validate user's input data
         */
        const validate = signInSchema.safeParse(data)
        if (!validate.success) {
            return validationError(validate.error)
        }
        const { email, password } = validate.data

        /**
         * Authenticate user
         */
        const authenticate = await authenticateUser(email, password)
        if(!authenticate){
            return errorResponse("Email or password is not correct", 400)
        }

        /**
         * Set cookies in http
         */
        const accessTokenPayload = {
            userId: authenticate.id,
            tenentId: authenticate.tenentId,
            tokenVersion: authenticate.tokenVersion
        }
        const refreshTokenPayload = {
            userId: authenticate.id,
            type: "refresh",
            deviceName,
            rememberMe: data.rememberMe
        }
        await setToken("accessToken", accessTokenPayload)
        await setToken("refreshToken", refreshTokenPayload)
        return successResponse("User logged in successfully")
    } catch (error) {
        return errorResponse(`Internale server error: ${error}`, 500)
    }
}