/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createMission, getAllBadges } from "@/lib/api/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Image from "next/image"

type Badge = {
    id: number
    name: string
    icon_url: string
}

const MISSION_CATEGORIES = [
    { value: "GENERAL", label: "Umum" },
    { value: "DAILY", label: "Harian" },
    { value: "WEEKLY", label: "Mingguan" },
] as const

const MISSION_CODES = [
    "HELP_TAKEN",
    "HELP_COMPLETED",
    "HELP_REQUEST",
    "LOGIN_STREAK",
    "PROFILE_COMPLETED",
] as const

export default function CreateMissionPage() {
    const router = useRouter()
    const [badges, setBadges] = useState<Badge[]>([])
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        code: "",
        title: "",
        description: "",
        category: "GENERAL",
        target_value: 1,
        reward_points: 0,
        reward_badge_id: null as number | null,
        auto_complete: true,
    })

    useEffect(() => {
        const fetchBadges = async () => {
            const res = await getAllBadges()
            setBadges(res.data)
        }
        fetchBadges()
    }, [])

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await createMission(form)

            await Swal.fire({
                title: "Misi berhasil dibuat",
                icon: "success",
            })

            router.push("/admin/missions")
        } catch (err: any) {
            await Swal.fire({
                title: "Gagal membuat misi",
                text:
                    err?.response?.data?.error ||
                    err?.message ||
                    "Terjadi kesalahan",
                icon: "error",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 max-w-3xl space-y-6">
            <h1 className="text-xl font-semibold">Buat Misi Baru</h1>

            {/* Code & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>Kode Misi</Label>
                    <Select
                        value={form.code}
                        onValueChange={(value) =>
                            setForm({ ...form, code: value })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih kode misi" />
                        </SelectTrigger>
                        <SelectContent>
                            {MISSION_CODES.map((code) => (
                                <SelectItem key={code} value={code}>
                                    {code}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label>Kategori</Label>
                    <Select
                        value={form.category}
                        onValueChange={(value) =>
                            setForm({ ...form, category: value })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            {MISSION_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Title */}
            <div>
                <Label>Judul Misi</Label>
                <Input
                    placeholder="Contoh: Selesaikan 3 bantuan"
                    value={form.title}
                    onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                    }
                />
            </div>

            {/* Description */}
            <div>
                <Label>Deskripsi</Label>
                <Textarea
                    placeholder="Jelaskan misi secara singkat dan jelas"
                    value={form.description}
                    onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                    }
                />
            </div>

            {/* Target & Reward */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>Target Penyelesaian</Label>
                    <Input
                        type="number"
                        min={1}
                        value={form.target_value}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                target_value: Number(e.target.value),
                            })
                        }
                    />
                </div>

                <div>
                    <Label>Poin Reward</Label>
                    <Input
                        type="number"
                        min={0}
                        value={form.reward_points}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                reward_points: Number(e.target.value),
                            })
                        }
                    />
                </div>
            </div>

            {/* Reward Badge */}
            <div>
                <Label className="mb-2 block">Badge Reward (Opsional)</Label>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            setForm({ ...form, reward_badge_id: null })
                        }
                        className={`w-20 h-20 border rounded-lg flex items-center justify-center text-xs
                        ${form.reward_badge_id === null
                                ? "border-primary ring-2 ring-primary"
                                : "border-muted"
                            }`}
                    >
                        Tanpa Badge
                    </button>

                    {badges.map((badge) => (
                        <button
                            key={badge.id}
                            type="button"
                            onClick={() =>
                                setForm({
                                    ...form,
                                    reward_badge_id: badge.id,
                                })
                            }
                            className={`w-20 h-20 border rounded-lg flex flex-col items-center justify-center gap-1
                            ${form.reward_badge_id === badge.id
                                    ? "border-primary ring-2 ring-primary"
                                    : "border-muted"
                                }`}
                        >
                            <Image
                                src={badge.icon_url}
                                alt={badge.name}
                                width={32}
                                height={32}
                            />
                            <span className="text-[10px] text-center">
                                {badge.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
                <Button onClick={handleSubmit} disabled={loading}>
                    Simpan Misi
                </Button>
            </div>
        </div>
    )
}
