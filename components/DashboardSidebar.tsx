import { Home, Users, Mail, User } from "lucide-react"
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
import { useDashboardContext } from "@/app/dashboard/layout"

export function DashboardSidebar() {
  const { user, tenent } = useDashboardContext()
  return (
    <Sidebar>
      <SidebarHeader className="h-16 border-b flex flex-row items-center px-4">
        <span className="font-bold text-lg">{tenent?.name}</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {user?.role === "admin" && <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/users">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Users</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/invite">
                      <Mail className="mr-2 h-4 w-4" />
                      <span>Invites</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
