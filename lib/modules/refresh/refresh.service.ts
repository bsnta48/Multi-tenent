import { prisma } from "../../prisma";
import { Refresh } from "./refresh.types";

function create(data: Refresh.CreateData) {
    return prisma.refreshToken.create({
        data
    })
}

function get(token: string) {
    return prisma.refreshToken.findUnique({
        where: {
            token
        }
    })
}

function update() {

}

function drop(token: string) {
    return prisma.refreshToken.delete({
        where: {
            token
        }
    })
}

export const refreshService = {
    create,
    get,
    update,
    drop
}
