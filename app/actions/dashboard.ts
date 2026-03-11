"use server"

import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"

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

export async function getProfile() {
    const session = await verifySession()
    if (!session.user.userId) {
        return null
    }
    const user = await prisma.user.findUnique({
        where: { id: session.user.userId },
        include: {
            userProfile: true
        }
    })
    return user
}