"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { RegisterForm } from "@/components/shared/register-form"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

const slides = [
    {
        bg: "/images/features-1.jpg",
        logo: "/icons/unify-logo.svg",
        title: "Temukan Bantuan di Sekitar Anda",
        desc: "Ajukan atau temukan permintaan bantuan di sekitar lokasi Anda secara cepat dan tepat sasaran.",
    },
    {
        bg: "/images/features-2.jpg",
        logo: "/icons/unify-logo.svg",
        title: "Status Bantuan Real-Time",
        desc: "Pantau status bantuan secara langsung, mulai dari menunggu relawan hingga bantuan selesai.",
    },
    {
        bg: "/images/features-3.jpg",
        logo: "/icons/unify-logo.svg",
        title: "Chat Langsung dengan Relawan",
        desc: "Berkomunikasi secara real-time dengan relawan atau peminta bantuan setelah bantuan diambil, tanpa perlu aplikasi tambahan.",
    },
];

export default function RegisterPage() {
    const [current, setCurrent] = useState(0)

    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.replace("/");
            }
        }
    })

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="grid h-screen overflow-hidden lg:grid-cols-12">
            {/* === Left side - Slideshow === */}
            <div className="relative hidden lg:block lg:col-span-5 overflow-hidden">
                <AnimatePresence mode="sync">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={slides[current].bg}
                            alt="Background"
                            fill
                            className="object-cover"
                            priority
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent" />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center justify-end text-center px-8 h-full text-white pb-24">
                            <motion.div
                                key={current + "-content"}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8 }}
                                className="flex flex-col items-center gap-4 max-w-xs"
                            >
                                <Image
                                    src={slides[current].logo}
                                    alt="Logo"
                                    width={48}
                                    height={48}
                                />
                                <h2 className="text-2xl font-semibold leading-snug max-w-xs">
                                    {slides[current].title}
                                </h2>
                                <p className="text-sm text-gray-200 max-w-sm">
                                    {slides[current].desc}
                                </p>
                            </motion.div>

                            {/* Dots */}
                            <div className="flex gap-2 mt-6">
                                {slides.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrent(i)}
                                        className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${current === i
                                            ? "bg-primary"
                                            : "bg-white/70 hover:bg-white"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* === Right side - Form (scrollable only inside this section) === */}
            <div className="relative flex flex-col gap-4 p-6 md:p-8 lg:col-span-7 h-screen overflow-y-auto">
                <div className="flex justify-center md:justify-start">
                    <Link href="/">
                        <Image
                            src="/icons/unify-logo.svg"
                            alt="Main Logo"
                            width={128}
                            height={128}
                        />
                    </Link>
                </div>

                {/* Scrollable form area */}
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-md">
                        <RegisterForm />
                    </div>
                </div>
            </div>
        </div>
    )
}
