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
import { Switch } from "@/components/ui/switch"
import Image from "next/image"

type Badge = {
    id: number
    name: string
    icon_url: string
}

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

        await createMission(form)

        setLoading(false)

        await Swal.fire({
            title: "Mission created",
            icon: "success",
        })

        router.push("/admin/missions")
    }

    console.log(badges)

    return (
        <div className="p-6 max-w-3xl space-y-6">
            <h1 className="text-xl font-semibold">Create Mission</h1>

            {/* Code */}
            {/* Mission Code */}
            <div>
                <Label>Mission Code</Label>
                <Select
                    value={form.code}
                    onValueChange={(value) =>
                        setForm({ ...form, code: value })
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select mission code" />
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

            {/* Title */}
            <div>
                <Label>Title</Label>
                <Input
                    value={form.title}
                    onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                    }
                />
            </div>

            {/* Description */}
            <div>
                <Label>Description</Label>
                <Textarea
                    value={form.description}
                    onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                    }
                />
            </div>

            {/* Category */}
            <div>
                <Label>Category</Label>
                <Input
                    value={form.category}
                    onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                    }
                />
            </div>

            {/* Target & Reward */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Target Value</Label>
                    <Input
                        type="number"
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
                    <Label>Reward Points</Label>
                    <Input
                        type="number"
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

            {/* Auto Complete */}
            <div className="flex items-center gap-3">
                <Switch
                    checked={form.auto_complete}
                    onCheckedChange={(v) =>
                        setForm({ ...form, auto_complete: v })
                    }
                />
                <Label>Auto Complete</Label>
            </div>

            {/* Reward Badge Picker */}
            <div>
                <Label className="mb-2 block">Reward Badge (optional)</Label>

                <div className="flex flex-wrap gap-3">
                    {/* None option */}
                    <button
                        type="button"
                        onClick={() =>
                            setForm({ ...form, reward_badge_id: null })
                        }
                        className={`w-20 h-20 border rounded-lg flex items-center justify-center text-xs
                            ${form.reward_badge_id === null
                                ? "border-primary ring-2 ring-primary"
                                : "border-muted"
                            }
                        `}
                    >
                        None
                    </button>

                    {(badges || []).map((badge) => (
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
                                }
                            `}
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
                    Create Mission
                </Button>
            </div>
        </div>
    )
}
