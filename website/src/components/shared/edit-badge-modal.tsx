/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateBadge } from "@/lib/api/admin"

interface Props {
    badge: any
    onClose: () => void
    onSuccess: () => void
}

export default function EditBadgeModal({
    badge,
    onClose,
    onSuccess,
}: Props) {
    const [form, setForm] = useState({
        name: badge.name ?? "",
        tier: badge.tier ?? "",
        iconFile: null as File | null,
        preview: badge.icon_url ?? "",
    })

    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        setLoading(true)

        const formData = new FormData()
        formData.append("name", form.name)
        formData.append("tier", form.tier)

        if (form.iconFile) {
            formData.append("icon", form.iconFile)
        }

        await updateBadge(badge.id, formData)

        setLoading(false)
        onSuccess()
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-xl bg-white p-6 space-y-4">
                <h2 className="text-lg font-semibold">Edit Lencana</h2>

                {/* Nama */}
                <div className="space-y-1">
                    <label className="text-sm font-medium">Nama Lencana</label>
                    <Input
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />
                </div>

                {/* Tier */}
                <div className="space-y-1">
                    <label className="text-sm font-medium">Tingkatan</label>
                    <Input
                        value={form.tier}
                        onChange={(e) =>
                            setForm({ ...form, tier: e.target.value })
                        }
                    />
                </div>

                {/* Preview */}
                {form.preview && (
                    <div className="flex justify-center pt-2">
                        <Image
                            src={form.preview}
                            alt="Preview Icon"
                            width={64}
                            height={64}
                            className="rounded"
                        />
                    </div>
                )}

                {/* Upload */}
                <div className="space-y-1">
                    <label className="text-sm font-medium">
                        Icon Lencana (Opsional)
                    </label>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return

                            setForm({
                                ...form,
                                iconFile: file,
                                preview: URL.createObjectURL(file),
                            })
                        }}
                    />
                    <p className="text-xs text-muted-foreground">
                        Kosongkan jika tidak ingin mengganti icon
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
