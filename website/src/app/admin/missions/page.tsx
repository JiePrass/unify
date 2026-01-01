/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getAllMissions, deleteMission } from "@/lib/api/admin"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Swal from "sweetalert2"

type Mission = {
    id: number
    code: string
    title: string
    description: string
    category: string
    target_value: number
    reward_points: number
    reward_badge_id: number | null
    auto_complete: boolean
    _count: {
        userMissions: number
    }
}

export default function AdminMissionsPage() {
    const [missions, setMissions] = useState<Mission[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMissions()
    }, [])

    const fetchMissions = async () => {
        try {
            const data = await getAllMissions()
            setMissions(data)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        const confirm = await Swal.fire({
            title: "Hapus Misi?",
            text: "Misi yang telah dihapus tidak akan bisa dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonText: "Batal",
            confirmButtonColor: "#dc2626",
        })

        if (!confirm.isConfirmed) return

        try {
            await deleteMission(id)

            setMissions((prev) => prev.filter((m) => m.id !== id))

            await Swal.fire({
                title: "Misi Berhasil Di Hapus",
                icon: "success",
            })
        } catch (err: any) {
            const message =
                err?.response?.data?.error ||
                err?.message ||
                "Gagal menghapus misi"

            await Swal.fire({
                title: "Gagal Menghapus Misi",
                text: message,
                icon: "error",
            })
        }
    }

    if (loading) {
        return <div className="p-6 text-sm text-muted-foreground">Loading Misi...</div>
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Manajemen Misi</h1>

                <Link href="/admin/missions/create">
                    <Button>Buat Misi</Button>
                </Link>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Kode Misi</TableHead>
                        <TableHead>Judul</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Hadiah</TableHead>
                        <TableHead>Banyak Pengguna</TableHead>
                        <TableHead>Aksi</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {missions.map((mission) => (
                        <TableRow key={mission.id}>
                            <TableCell className="font-mono text-xs">
                                {mission.code}
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{mission.title}</div>
                                <div className="text-xs text-muted-foreground">
                                    {mission.description}
                                </div>
                            </TableCell>
                            <TableCell>{mission.category}</TableCell>
                            <TableCell>{mission.target_value}</TableCell>
                            <TableCell>{mission.reward_points} Point</TableCell>
                            <TableCell>{mission._count.userMissions}</TableCell>
                            <TableCell>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(mission.id)}
                                >
                                    Hapus
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}

                    {missions.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="text-center text-sm text-muted-foreground"
                            >
                                Tidak ada misi yang tersedia
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
