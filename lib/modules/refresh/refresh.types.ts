export namespace Refresh {
    export interface CreateData {
        token: string
        userId: string
        expiresAt: Date
        deviceName: string
    }

    export interface UpdateData {
        token: string
        expireAt: Date
    }

    export interface DropData {
        token: string
    }
}