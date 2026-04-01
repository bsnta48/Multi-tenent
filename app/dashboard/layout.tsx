import { getRequests } from "@/lib/modules/requests/request.actions"
import { getTenent } from "@/lib/modules/tenents/tenent.actions"
import { getMe } from "@/lib/modules/user/me.actions"
import DashboardHeader from "@/app/dashboard/components/DashboardHeader"
import DashboardSidebar from "@/app/dashboard/components/DashboardSidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { Provider } from "./context"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: me } = await getMe()
    const { data: tenent } = await getTenent()
    const { data: requests } = await getRequests()

    return (
        <Provider value={{ me, tenent, requests }}>
            <SidebarProvider>
                <DashboardSidebar />
                <SidebarInset>
                    <div className="flex min-h-screen w-full flex-col">
                        <DashboardHeader />
                        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
                            {children}
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
            <Toaster />
        </Provider>
    )
}