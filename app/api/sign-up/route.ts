import { redis } from "@/lib/redis";
import { z } from "zod"

const signUpSchema = z.object({
    tenentId: z.string().min(1, "Tenent id is required"),
    username: z.string().min(1, "Username is required").regex(/^[a-zA-Z0-9_]+$/, "Username must contain only letters, numbers, and underscores"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
})

export async function POST(request: Request) {
    try{
        const user = await request.json();
        const validated = signUpSchema.safeParse(user);
        if (!validated.success) {
            return Response.json({
                success: false,
                message: validated.error!.issues[0].message,
            }, { status: 400 })
        }

        return

        const isValidTenent = await redis.get(`tenent:${validated.data.tenentId}`)
        if (!isValidTenent) {
            return Response.json({
                success: false,
                message: "Invalid tenent id",
            }, { status: 400 })
        }

        const sanitizedUsername = validated.data.username.toLowerCase().replace(/[^a-z0-9-]/g, '');
        const userAlreadyExists = await redis.get(`user:${sanitizedUsername}`)
        if (userAlreadyExists) {
            return Response.json({
                success: false,
                message: "User already exists",
            }, { status: 400 })
        }

    } catch (error) {
        return Response.json({
            success: false,
            message: "Something went wrong",
        }, { status: 500 })
    }
    // if (!tenentId) {
    //     return Response.json({
    //         success: false,
    //         message: "Tenent id is required",
    //     }, { status: 400 })
    // }

    // const isValidTenent = await redis.get(`tenent:${tenentId}`)
    // if (!isValidTenent) {
    //     return Response.json({
    //         success: false,
    //         message: "Invalid tenent id",
    //     }, { status: 400 })
    // }

    // if (!username) {
    //     return Response.json({
    //         success: false,
    //         message: "Username is required",
    //     }, { status: 400 })
    // }

    // const sanitizedUsername = username.toLowerCase().replace(/[^a-z0-9-]/g, '');
    // const userAlreadyExists = await redis.get(`user:${sanitizedUsername}`)
    // if (userAlreadyExists) {
    //     return Response.json({
    //         success: false,
    //         message: "User already exists",
    //     }, { status: 400 })
    // }

    // const isUserFieldsValid = requireFields.every((field) => {
    //     if (!user[field.name]) {
    //         return Response.json({
    //             success: false,
    //             message: field.message,
    //         }, { status: 400 })
    //     }
    // })

    // if (isUserFieldsValid) {
    //     const result = await redis.set(`user:${user.username}`, {

    //     })
    // }
}