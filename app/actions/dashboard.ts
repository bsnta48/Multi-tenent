"use server"

import { z } from "zod"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import { profileSchema } from "@/lib/schema"
import { revalidatePath } from "next/cache";

export type ProfileFormState = {
    errors?: {
        [K in keyof z.infer<typeof profileSchema>]?: string[];
    };
    message?: string | null;
    success?: boolean;
    data?: any;
} | undefined | null;

export async function getTenent() {
    const session = await verifySession()
    const tenent = await prisma.tenent.findUnique({
        where: { id: session.user.tenentId }
    })
    return tenent
}

export async function getUsers() {
    const session = await verifySession()
    if (session.user.role !== "admin") {
        return null
    }
    const users = await prisma.user.findMany({
        where: { tenentId: session.user.tenentId }
    })
    return users
}

export async function getUser(id?: string) {
    const session = await verifySession()
    if (!session.user.userId) {
        return null
    }
    const user = await prisma.user.findUnique({
        where: { id: id || session.user.userId },
        include: {
            userProfile: true
        }
    })
    return user
}

export async function updateUser(state: ProfileFormState, formData: FormData) {
    const session = await verifySession();
    if (!session.user.userId) {
        return null;
    }
    const fieldsData = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        phone: formData.get("phone"),
        dob: formData.get("dob"),
        address: formData.get("address"),
        branch: formData.get("branch"),
        department: formData.get("department"),
        jobTitle: formData.get("jobTitle"),
        jobDescription: formData.get("jobDescription"),
        joinDate: formData.get("joinDate"),
        level: formData.get("level"),
        officialContact: formData.get("officialContact"),
        province: formData.get("province"),
        servicePeriod: formData.get("servicePeriod"),
        status: formData.get("status"),
        subDepartment: formData.get("subDepartment"),
        unit: formData.get("unit"),
    }

    const validatedFields = profileSchema.safeParse(fieldsData)

    if (!validatedFields.success) {
        return {
            data: fieldsData,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing fields. Failed to update profile.",
        };
    }

    const { dob, joinDate, ...rest } = validatedFields.data
    const formatDob = dob && !isNaN(new Date(dob).getTime()) ? new Date(dob) : null
    const formatJoinDate = joinDate && !isNaN(new Date(joinDate).getTime()) ? new Date(joinDate) : null

    try {
        const userProfile = await prisma.userProfile.upsert({
            where: { userId: session.user.userId },
            update: {
                ...rest,
                dob: formatDob,
                joinDate: formatJoinDate,
            },
            create: {
                ...rest,
                userId: session.user.userId,
                dob: formatDob,
                joinDate: formatJoinDate,
            }
        })
        revalidatePath("/dashboard/my-profile")
        return {
            message: "Profile updated successfully",
            success: true,
        };
    } catch (error) {
        console.error("Update profile error:", error)
        return {
            message: "Failed to update profile",
            success: false,
        };
    }
}