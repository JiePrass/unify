'use client'

import { AppSidebar } from "@/components/layouts/app-sidebar"
import AppHeader from "@/components/layouts/app-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, loading } = useAuth()
    const router = useRouter()

    if (!loading) {
        if (!user) {
            router.replace("/login");
        } else if (user?.role && user.role !== "ADMIN") {
            router.replace("/");
        }
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <AppHeader />
                <main className="flex flex-1 flex-col p-4 pt-0">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
