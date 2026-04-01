import { errorResponse, successResponse, validationError } from "@/lib/api-response";
import { forgotPasswordSchema } from "@/lib/schema";
import { sendForgotPasswordEmail } from "@/lib/send-email";
import { userService } from "@/lib/modules/user/user.service";
import { generateEmailToken, protocol, rootDomain } from "@/lib/utils";

export async function POST(req: Request) {
    try {
        const data = await req.json()
        const validate = forgotPasswordSchema.safeParse(data)
        if (!validate.success) {
            return validationError(validate.error)
        }
        const { email } = validate.data
        const user = await userService.findByQuery({
            email
        })
        if (!user) {
            return errorResponse("User not found", 404)
        }
        const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000)
        const generateVerifyToken = generateEmailToken()
        await userService.update({
            id: user.id,
            verifyCode: generateVerifyToken,
            verifyCodeExpiry
        })
        const verifyUrl = `${protocol}://${rootDomain}/reset-password/${generateVerifyToken}`;
        await sendForgotPasswordEmail(email, user.username, verifyUrl)
        return successResponse({}, "Password reset link sent successfully, please check your email")
    } catch (error) {
        return errorResponse(`Internale server error: ${error}`, 500)
    }
}