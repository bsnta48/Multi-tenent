"use client"

import { tenentScheme, userSchema } from "@/lib/schema"
import { createContext, useContext } from "react"

type DashboardContextProps = {
    user: userSchema | null
    tenent: tenentScheme | null
}

const context = createContext<DashboardContextProps | null>(null)

export const Provider = ({ value, children }: { value: DashboardContextProps, children: React.ReactNode }) => {
    return <context.Provider value={value}>
        {children}
    </context.Provider>
}

export const useDashboardContext = () => {
    const ctx = useContext(context)
    if (!ctx) throw new Error("useDashboardContext must be used within Context")
    return ctx
}