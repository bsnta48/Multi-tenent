"use client"

import { Home, Users, Mail, User, Mails } from "lucide-react"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useDashboardContext } from "@/app/dashboard/context"
import { usePathname } from "next/navigation"

export default function DashboardSidebar() {
  const { me, tenent } = useDashboardContext()
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="h-16 border-b flex flex-row items-center px-4">
        <span className="font-bold text-lg">{tenent?.name}</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>My App</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/profile"}>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/my-requests"}>
                  <Link href="/dashboard/my-requests">
                    <Mail className="mr-2 h-4 w-4" />
                    <span>My Requests</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {me?.role === "admin" && <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/requests"}>
                    <Link href="/dashboard/requests">
                      <Mails className="mr-2 h-4 w-4" />
                      <span>All Requests</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/users"}>
                    <Link href="/dashboard/users">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Users</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/invite"}>
                    <Link href="/dashboard/invite">
                      <Mail className="mr-2 h-4 w-4" />
                      <span>Invites</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>}
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarGroupLabel>Team App</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/team"}>
                  <Link href="/dashboard/team">
                    <Users className="mr-2 h-4 w-4" />
                    <span>My Team</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
