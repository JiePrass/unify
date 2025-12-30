"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Swal from "sweetalert2"
import { useAuth } from "@/contexts/auth-context"
import { AxiosError } from "axios"
import { Eye, EyeOff } from "lucide-react"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const { login } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            await login(email, password)

            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "Login berhasil!",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            }).then(() => router.push("/admin/dashboard"))
        } catch (err: unknown) {
            let message = "Login gagal"

            if (err instanceof AxiosError) {
                message = err.response?.data?.error || message
            }

            Swal.fire({
                icon: "error",
                title: "Login gagal",
                text: message,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={cn("flex flex-col gap-6", className)}
            {...props}
        >
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-3xl font-bold">
                    Selamat Datang Kembali di{" "}<span className="text-primary">UNIFY</span>👋
                </h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Masuk untuk membantu dan meminta bantuan masyarakat!
                </p>
            </div>
            <div className="grid gap-6">
                <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="example@email.com"
                        required
                    />
                </div>
                <div className="grid gap-3">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <Link
                            href="/forgot-password"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                            Lupa password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="At least 8 characters"
                            required
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Loading..." : "Masuk"}
                </Button>
            </div>
            <div className="text-center text-sm">
                Tidak memiliki akun?{" "}
                <Link href="/register" className="underline underline-offset-4">
                    Daftar
                </Link>
            </div>
        </form>
    )
}
