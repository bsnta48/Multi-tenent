import { NextResponse } from "next/server"
import { z } from "zod"

export function validationError(error: z.ZodError) {
    const errors = z.treeifyError(error) as { errors: [], properties: {} }
    return NextResponse.json({
        success: false,
        message: "Invalid fields",
        error: errors?.properties
    }, { status: 400 })
}

export function successResponse(data: any, message = "Success", status = 200) {
    return NextResponse.json({
        success: true,
        message,
        data
    }, { status })
}

export function errorResponse(message: string, status = 400, data: any = null) {
    return NextResponse.json({
        success: false,
        message,
        data
    }, { status })
}