import { Prisma } from "@/generated/prisma";
import { prisma } from "../../prisma";
import { Tenent } from "./tenent.types";

// get all tenents
function getAll() {
    return prisma.tenent.findMany()
}

// get single tenent
function get(id: string) {
    return prisma.tenent.findUnique({
        where: { id },
    }) as Promise<Tenent.Data | null>
}

// update tenent
function update(data: Tenent.UpdateData) {
    const { id, ...restData } = data
    return prisma.tenent.update({
        where: { id },
        data: restData
    })
}

// delete tenent
function drop(id: string) {
    return prisma.tenent.delete({
        where: { id }
    })
}

// find by query
function findByQuery(query: Prisma.TenentFindUniqueArgs) {
    return prisma.tenent.findUnique(query)
}

export const tenentService = {
    getAll,
    get,
    update,
    drop,
    findByQuery
}