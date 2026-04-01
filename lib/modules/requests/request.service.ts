import { prisma } from "../../prisma";
import { Request } from "./request.types";

// get all requests
function getAll(tenentId: string) {
    return prisma.request.findMany({
        where: { tenentId },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    userProfile: {
                        select: {
                            firstName: true,
                            lastName: true,
                        }
                    }
                }
            }
        }
    })
}

// get requests by user
function getAllByUser(userId: string) {
    return prisma.request.findMany({
        where: { userId },
        orderBy: {
            createdAt: "desc"
        }
    })
}

// get single request
function get(id: string) {
    return prisma.request.findUnique({
        where: { id }
    })
}

// create request
function create(data: Request.CreateData) {
    return prisma.request.create({ data })
}

// update request
function update(data: Request.UpdateData) {
    const { id, ...restData } = data
    return prisma.request.update({
        where: { id },
        data: restData
    })
}

// delete request
function drop(id: string) {
    return prisma.request.delete({
        where: { id }
    })
}

export const requestService = {
    getAll,
    getAllByUser,
    get,
    create,
    update,
    drop
}