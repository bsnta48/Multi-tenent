"use client"

import AppLink from "@/components/AppLink"
import SignOut from "@/components/SignOut"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export function AppSidebar({ organizationName, role }: { organizationName: string, role: string }) {
    const pathname = usePathname()
    return (
        <Sidebar>
            <SidebarHeader>
                <h2 className="text-2xl font-bold">{organizationName}</h2>
            </SidebarHeader>
            <SidebarContent className="px-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <AppLink href="/dashboard" isAction={pathname === '/dashboard'}>Dashboard</AppLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <AppLink href="/dashboard/my-profile" isAction={pathname === '/dashboard/my-profile'}>My Profile</AppLink>
                    </SidebarMenuItem>
                    {role === "admin" && <SidebarMenuItem>
                        <AppLink href="/dashboard/users" isAction={pathname === '/dashboard/users'}>Users</AppLink>
                    </SidebarMenuItem>}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <SignOut/>
            </SidebarFooter>
        </Sidebar>
    )
}