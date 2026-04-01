"use client"

import { Request } from "@/lib/modules/requests/request.types"
import { Tenent } from "@/lib/modules/tenents/tenent.types"
import { User } from "@/lib/modules/user/user.types"
import { useRouter } from "next/navigation"
import { createContext, useContext } from "react"

export type DashboardContextProps = {
    me?: User.Data | null
    tenent?: Tenent.Data | null
    requests?: Request.Data[] | null
    getRequests: () => void
    getTenent: () => void
    getUser: () => void
}

const context = createContext<DashboardContextProps | null>(null)

export const Provider = ({ value, children }: { value: Partial<DashboardContextProps>, children: React.ReactNode }) => {
    const router = useRouter()

    const refresh = () => router.refresh()

    const contextValue: DashboardContextProps = {
        me: value.me,
        tenent: value.tenent,
        requests: value.requests,
        getRequests: refresh,
        getTenent: refresh,
        getUser: refresh
    }

    return <context.Provider value={contextValue}>
        {children}
    </context.Provider>
}

export const useDashboardContext = () => {
    const ctx = useContext(context)
    if (!ctx) throw new Error("useDashboardContext must be used within Context")
    return ctx
}