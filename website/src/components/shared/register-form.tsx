"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import Swal from "sweetalert2"
import { useRouter } from "next/navigation"
import axios from "axios"
import { registerUser } from "@/lib/api/auth"


interface FormData {
    fullName: string
    email: string
    phone: string
    password: string
    confirmPassword?: string
}

interface ApiError {
    error: string
}

export function RegisterForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    })

    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            Swal.fire({
                icon: "error",
                title: "Password tidak sama",
                text: "Pastikan password dan konfirmasi password cocok.",
            })
            return
        }

        setLoading(true)
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...payload } = formData

            const res = await registerUser(payload)
            Swal.fire({
                icon: "success",
                title: "Registrasi Berhasil",
                text: res.message,
            })

            router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
        } catch (err: unknown) {
            if (axios.isAxiosError<ApiError>(err)) {
                Swal.fire({
                    icon: "error",
                    title: "Registrasi Gagal",
                    text: err.response?.data?.error || "Gagal mendaftar",
                })
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Registrasi Gagal",
                    text: "Gagal mendaftar",
                })
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleRegister}
            className={cn("flex flex-col gap-6", className)}
            {...props}
        >
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-3xl font-bold">
                    Daftar di <span className="text-primary">UNIFY</span> 🚀
                </h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Buat akun untuk membantu dan meminta bantuan masyarakat!
                </p>
            </div>

            <div className="grid gap-4">
                {/* Nama & Email */}
                <div className="grid gap-2">
                    <Label htmlFor="fullName">Nama Lengkap</Label>
                    <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Nama Lengkap"
                        required
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    <div className="grid gap-2 col-span-4">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="example@email.com"
                            required
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid gap-2 col-span-3">
                        <Label htmlFor="phone">Nomor Telepon</Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="text"
                            placeholder="08123456789"
                            required
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Minimal 8 karakter"
                            required
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            className="absolute right-2 top-2.5 text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Ulangi password"
                            required
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            className="absolute right-2 top-2.5 text-gray-500"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                        >
                            {showConfirmPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Loading..." : "Daftar"}
                </Button>
            </div>

            <div className="text-center text-sm">
                Sudah punya akun?{" "}
                <Link href="/login" className="underline underline-offset-4">
                    Masuk
                </Link>
            </div>
        </form>
    )
}
