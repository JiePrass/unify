"use client"

import { LogOut } from "lucide-react"
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export function NavFooter() {
    const router = useRouter()

    const { logout } = useAuth()

    function handleLogout() {
        logout()
        router.push("/login")
    }

    return (
        <SidebarGroup>
            <SidebarMenu>
                {/* Logout */}
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Logout" onClick={handleLogout} className="text-red-600 hover:cursor-pointer hover:text-red-600">
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    )
}