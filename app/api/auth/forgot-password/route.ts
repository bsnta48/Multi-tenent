import { errorResponse, successResponse, validationError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/schema";
import { sendForgotPasswordEmail } from "@/lib/send-email";
import { generateEmailToken, protocol, rootDomain } from "@/lib/utils";

export async function POST(req: Request) {
    try {
        const data = await req.json()
        const validate = forgotPasswordSchema.safeParse(data)
        if (!validate.success) {
            return validationError(validate.error)
        }
        const { email } = validate.data
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (!user) {
            return errorResponse("User not found", 404)
        }
        const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000)
        const generateVerifyToken = generateEmailToken()
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                verifyCode: generateVerifyToken,
                verifyCodeExpiry
            }
        })
        const verifyUrl = `${protocol}://${rootDomain}/reset-password/${generateVerifyToken}`;
        await sendForgotPasswordEmail(email, user.username, verifyUrl)
        return successResponse({}, "Password reset link sent successfully, please check your email")
    } catch (error) {
        return errorResponse(`Internale server error: ${error}`, 500)
    }
}