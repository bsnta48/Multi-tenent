export namespace Invite {
    export interface CreateData {
        email: string
        role: string
        tenentId: string
        token: string
        expireAt: Date
        used?: boolean
    }

    export interface UpdateData {
        email: string
        used?: boolean
        expireAt?: Date
        token?: string
        role?: string
    }
}