import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { getTenent } from "../actions/dashboard"
import { getSession } from "@/lib/session"
import { Toaster } from "@/components/ui/sonner"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const tenent = await getTenent()
    const session = await getSession()
    return (
        <SidebarProvider>
            <AppSidebar role={session?.role || "user"} organizationName={tenent?.name || "Organization Name"} />
            <SidebarInset className="p-4">
                {children}
            </SidebarInset>
            <Toaster />
        </SidebarProvider>
    )
}