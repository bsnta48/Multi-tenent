export namespace Request {
    export type CreateData = {
        userId: string
        tenentId: string
        type: string
        event: string
        description: string
        status?: string
        replyText?: string
    }

    export type UpdateData = {
        id: string
        status?: string
        replyText?: string | null
        updatedBy?: string | null
    }

    export type Data = {
        id: string
        userId: string
        tenentId: string
        type: string
        event: string | null
        description: string | null
        status: string
        replyText: string | null
        updatedBy: string | null
        createdAt: Date
        updatedAt: Date
    }
}