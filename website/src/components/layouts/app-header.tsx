"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Separator } from "@radix-ui/react-separator"
import { SidebarTrigger } from "../ui/sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../ui/breadcrumb"

function capitalize(text: string) {
    return text
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function AppHeader() {
    const pathname = usePathname()

    const segments = pathname
        .split("/")
        .filter(Boolean)

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />

                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />

                <Breadcrumb>
                    <BreadcrumbList>
                        {segments.map((segment, index) => {
                            const href = "/" + segments.slice(0, index + 1).join("/")
                            const isLast = index === segments.length - 1

                            return (
                                <BreadcrumbItem key={href}>
                                    {isLast ? (
                                        <BreadcrumbPage>
                                            {capitalize(segment)}
                                        </BreadcrumbPage>
                                    ) : (
                                        <>
                                            <BreadcrumbLink asChild>
                                                <Link href={href}>
                                                    {capitalize(segment)}
                                                </Link>
                                            </BreadcrumbLink>
                                            <BreadcrumbSeparator />
                                        </>
                                    )}
                                </BreadcrumbItem>
                            )
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </header>
    )
}
