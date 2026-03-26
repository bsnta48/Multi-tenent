"use client"

import DashboardHeader from "@/components/DashboardHeader"
import DashboardSidebar from "@/components/DashboardSidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useContext, createContext, useState, useEffect } from "react"
import { apiFetch } from "@/lib/api-fetch"
import { userSchema, tenentScheme } from "@/lib/schema"
import { Toaster } from "@/components/ui/sonner"

const DashboardContext = createContext<any>(null)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [me, setMe] = useState<userSchema | null>(null)
    const [tenent, setTenent] = useState<tenentScheme | null>(null)
    const [requests, setRequests] = useState<any[]>([])

    const getUser = async () => {
        const res = await apiFetch("/api/users/me", {
            cache: "no-store"
        })
        const result = await res.json()
        setMe(result.data)
    }

    const getTenent = async () => {
        const res = await apiFetch("/api/tenent")
        const result = await res.json()
        setTenent(result.data)
    }

    const getRequests = async () => {
        const res = await apiFetch("/api/users/me/requests")
        const result = await res.json()
        setRequests(result.data || [])
    }

    useEffect(() => {
        getUser()
        getTenent()
        getRequests()
    }, [])

    return (
        <DashboardContext.Provider value={{ me, tenent, requests, getRequests }}>
            <SidebarProvider>
                <DashboardSidebar />
                <SidebarInset>
                    <div className="flex min-h-screen w-full flex-col">
                        <DashboardHeader />
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
            <Toaster />
        </DashboardContext.Provider>
    )
}

export const useDashboardContext = () => {
    const context = useContext(DashboardContext)
    if (!context) {
        throw new Error("useDashboardContext must be used within DashboardLayout")
    }
    return context
}