export const ROLES = {
    ADMIN: "ADMIN",
    USER: "USER"
} as const

export const REQUEST_STATUS = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    CANCELLED: "CANCELLED"
} as const

export const REQUEST_TYPE = {
    LEAVE: "LEAVE",
    TIME: "TIME",
    TRAVEL: "TRAVEL",
    OTHER: "OTHER"
} as const
