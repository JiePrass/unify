"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Swal from "sweetalert2"

import {
    getAllBadges,
    deleteBadge,
} from "@/lib/api/admin"

import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import EditBadgeModal from "@/components/shared/edit-badge-modal"

type Badge = {
    id: number
    name: string
    icon_url: string
    tier: string
    description?: string
}

export default function AdminBadgesPage() {
    const [badges, setBadges] = useState<Badge[]>([])
    const [loading, setLoading] = useState(true)

    const [openEdit, setOpenEdit] = useState(false)
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)

    const fetchBadges = async () => {
        setLoading(true)
        const res = await getAllBadges()
        setBadges(res.data)
        setLoading(false)
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchBadges()
    }, [])

    const handleDelete = async (badge: Badge) => {
        const confirm = await Swal.fire({
            title: "Hapus lencana?",
            text: "Lencana yang dihapus tidak dapat dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#dc2626",
        })

        if (!confirm.isConfirmed) return

        await deleteBadge(badge.id)

        await Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Lencana berhasil dihapus.",
        })

        setBadges((prev) => prev.filter((b) => b.id !== badge.id))
    }

    if (loading) {
        return (
            <div className="p-6 text-sm text-muted-foreground">
                Memuat lencana...
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">
                    Manajemen Lencana
                </h1>

                <Button>Buat Lencana</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Ikon</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Tingkatan</TableHead>
                        <TableHead className="text-right">
                            Aksi
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {badges.map((badge) => (
                        <TableRow key={badge.id}>
                            <TableCell>
                                <Image
                                    src={badge.icon_url}
                                    alt={badge.name}
                                    width={36}
                                    height={36}
                                    className="rounded"
                                />
                            </TableCell>

                            <TableCell className="font-medium">
                                {badge.name}
                            </TableCell>

                            <TableCell className="text-sm text-muted-foreground">
                                {badge.tier}
                            </TableCell>

                            <TableCell className="text-right space-x-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedBadge(badge)
                                        setOpenEdit(true)
                                    }}
                                >
                                    Edit
                                </Button>

                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(badge)}
                                >
                                    Hapus
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}

                    {badges.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="text-center text-sm text-muted-foreground"
                            >
                                Tidak ada lencana
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {openEdit && selectedBadge && (
                <EditBadgeModal
                    key={selectedBadge.id} // ← PENTING
                    badge={selectedBadge}
                    onClose={() => {
                        setOpenEdit(false)
                        setSelectedBadge(null)
                    }}
                    onSuccess={async () => {
                        await fetchBadges()
                    }}
                />
            )}
        </div>
    )
}
