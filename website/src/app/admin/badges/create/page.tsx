/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import Image from "next/image"
import Swal from "sweetalert2"

import { createBadge } from "@/lib/api/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

export default function CreateBadgePage() {
    const [name, setName] = useState("")
    const [tier, setTier] = useState("")
    const [icon, setIcon] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleFileChange = (file: File | null) => {
        setIcon(file)
        if (file) {
            setPreview(URL.createObjectURL(file))
        } else {
            setPreview(null)
        }
    }

    const handleSubmit = async () => {
        if (!name || !tier || !icon) {
            await Swal.fire({
                icon: "warning",
                title: "Incomplete Data",
                text: "Name, tier, and icon are required.",
            })
            return
        }

        const formData = new FormData()
        formData.append("name", name)
        formData.append("tier", tier)
        formData.append("icon", icon)

        try {
            setLoading(true)
            await createBadge(formData)

            await Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: "Lencana baru berhasil dibuat",
            })

            setName("")
            setTier("")
            setIcon(null)
            setPreview(null)
        } catch (error: any) {
            await Swal.fire({
                icon: "error",
                title: "Gagal",
                text: error?.message ?? "Gagal membuat lencana",
            }
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-xl">
            <Card>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nama Lencana</label>
                        <Input
                            placeholder="e.g. First Responder"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tier</label>
                        <Select value={tier} onValueChange={setTier}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select tier" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BRONZE">Bronze</SelectItem>
                                <SelectItem value="SILVER">Silver</SelectItem>
                                <SelectItem value="GOLD">Gold</SelectItem>
                                <SelectItem value="PLATINUM">Platinum</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Icon</label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                        />

                        {preview && (
                            <div className="relative w-24 h-24 mt-2">
                                <Image
                                    src={preview}
                                    alt="Preview"
                                    fill
                                    className="object-contain rounded"
                                />
                            </div>
                        )}
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Badge"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
