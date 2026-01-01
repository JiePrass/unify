import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-24">
            {/* Animated background blur */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-[-10%] left-[-10%] h-100 w-100 rounded-full bg-orange-300/30 blur-3xl animate-pulse" />
                <div className="absolute top-[20%] right-[-10%] h-112.5 w-112.5 rounded-full bg-yellow-200/30 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
                <div className="absolute bottom-[-15%] left-[30%] h-125 w-125 rounded-full bg-amber-200/30 blur-3xl animate-[pulse_10s_ease-in-out_infinite]" />
            </div>

            <div
                className="container relative mx-auto flex items-center justify-center"
                id="home"
            >
                <div className="relative z-10 max-w-3xl text-center px-8 py-24 pb-64">
                    <Badge
                        variant="outline"
                        className="mb-4 bg-white/10 backdrop-blur-sm border-white/30 px-4 py-2 font-light text-base"
                    >
                        <Image
                            src="/icons/stars-black.svg"
                            alt="stars"
                            width={24}
                            height={24}
                            className="inline-block mr-2"
                        />
                        Platform Kolaborasi Sosial
                    </Badge>

                    <h1 className="text-3xl md:text-5xl font-medium mb-4">
                        Satukan Kepedulian, Wujudkan Aksi Nyata Bersama Unify
                    </h1>

                    <p className="md:text-xl mb-6 text-muted-foreground">
                        Unify menghubungkan mereka yang membutuhkan bantuan dengan
                        relawan di sekitar secara cepat, transparan, dan real-time.
                    </p>

                    <div className="flex items-center justify-center gap-4">
                        <Button asChild>
                            <Link href="/dashboard">
                                Download Aplikasi
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/register">
                                Bergabung Sekarang
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
