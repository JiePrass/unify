'use client'

import * as React from "react";
import {
  Award,
  LayoutDashboard,
  Megaphone,
  Target,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import Image from "next/image";
import { NavFooter } from "@/components/nav-footer";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const navMain = [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Report",
      url: "/admin/cancel-help",
      icon: Megaphone,
    },
    {
      title: "Misi",
      url: "#",
      icon: Target,
      items: [
        { title: "Manajemen Misi", url: "/admin/missions" },
        { title: "Buat Misi", url: "/admin/missions/create" },
      ]
    },
    {
      title: "Lencana",
      url: "#",
      icon: Award,
      items: [
        { title: "Manajemen Lencana", url: "/admin/badges" },
        { title: "Buat Lencana", url: "/admin/badges/create" },
      ]
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header logo */}
      <SidebarHeader>
        <div className="flex items-center gap-2 px-3 py-2">
          <Image
            src="/icons/unify-logo.svg"
            alt="Logo"
            width={100}
            height={100}
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}