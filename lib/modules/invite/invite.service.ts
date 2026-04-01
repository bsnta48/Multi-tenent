import { prisma } from "../../prisma";
import { Invite } from "./invite.types";

async function isValidInvite(token: string) {
    const invitedUser = await prisma.invite.findFirst({
        where: {
            token,
            expireAt: {
                gt: new Date()
            },
            used: false
        }
    })
    if (!invitedUser) {
        return null
    }
    return invitedUser
}

function create(data: Invite.CreateData) {
    return prisma.invite.create({
        data
    })
}

function getAll(tenentId: string) {
    return prisma.invite.findMany({
        where: { tenentId }
    })
}

function get(id: number) {
    return prisma.invite.findUnique({
        where: { id }
    })
}

function update(data: Invite.UpdateData) {
    const { email, ...restData } = data
    return prisma.invite.update({
        where: { email },
        data: restData
    })
}

function drop(id: number) {
    return prisma.invite.delete({
        where: { id }
    })
}

export const inviteService = {
    isValidInvite,
    getAll,
    create,
    get,
    update,
    drop
}