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
import { Label } from "@/components/ui/label"
import { Camera } from "lucide-react"

export default function CreateBadgePage() {
    const [name, setName] = useState("")
    const [tier, setTier] = useState("")
    const [icon, setIcon] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleFileChange = (file: File | null) => {
        setIcon(file)
        setPreview(file ? URL.createObjectURL(file) : null)
    }

    const handleSubmit = async () => {
        if (!name || !tier || !icon) {
            await Swal.fire({
                icon: "warning",
                title: "Data belum lengkap",
                text: "Nama, tier, dan ikon wajib diisi.",
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
                text: "Lencana berhasil dibuat.",
            })

            setName("")
            setTier("")
            setIcon(null)
            setPreview(null)
        } catch (error: any) {
            await Swal.fire({
                icon: "error",
                title: "Gagal",
                text: error?.message || "Gagal membuat lencana.",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 max-w-xl space-y-6">
            <h1 className="text-xl font-semibold">Buat Lencana Baru</h1>

            {/* Nama */}
            <div>
                <Label>Nama Lencana</Label>
                <Input
                    placeholder="Contoh: First Responder"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            {/* Tier */}
            <div>
                <Label>Tier</Label>
                <Select value={tier} onValueChange={setTier}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih tier" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="BRONZE">Bronze</SelectItem>
                        <SelectItem value="SILVER">Silver</SelectItem>
                        <SelectItem value="GOLD">Gold</SelectItem>
                        <SelectItem value="PLATINUM">Platinum</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Ikon */}
            <div className="space-y-2">
                <Label>Ikon Lencana</Label>

                <div className="flex items-center gap-4">
                    {/* Preview */}
                    <div className="relative w-24 h-24 rounded-lg border flex items-center justify-center bg-muted">
                        {preview ? (
                            <Image
                                src={preview}
                                alt="Preview ikon"
                                fill
                                className="object-contain rounded-lg"
                            />
                        ) : (
                            <Camera className="w-8 h-8 text-muted-foreground" />
                        )}
                    </div>

                    {/* File Input */}
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            handleFileChange(e.target.files?.[0] ?? null)
                        }
                    />
                </div>

                <p className="text-xs text-muted-foreground">
                    Rekomendasi: PNG / SVG, rasio 1:1
                </p>
            </div>

            {/* Submit */}
            <div className="pt-4">
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Menyimpan..." : "Simpan Lencana"}
                </Button>
            </div>
        </div>
    )
}
