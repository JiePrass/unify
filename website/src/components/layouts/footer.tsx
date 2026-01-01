"use client"

import Image from "next/image";
import { ArrowUp } from "lucide-react";
import Link from "next/link";
import { BrandFacebook, BrandInstagram, BrandTwitter, BrandYoutube } from "tabler-icons-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="bg-card py-8 overflow-hidden px-4">
            {/* Logo */}
            <div className="container mx-auto md:px-0 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                <div className="flex items-center">
                    <Image
                        src="/icons/unify-logo.svg"
                        alt="Unify Logo"
                        width={200}
                        height={200}
                        className="object-contain"
                    />
                </div>
            </div>

            {/* Info Section */}
            <div className="container mx-auto md:px-0 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-64">
                <div className="flex flex-col justify-between">
                    <h1 className="text-5xl md:text-5xl font-semibold">
                        Langkah Kecil untuk Bantuan yang Lebih Besar!
                    </h1>

                    <p className="text-xs md:text-sm hidden md:flex font-light opacity-70 mt-6">
                        &copy; {currentYear} Unify. All rights reserved.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    <div className="flex flex-col gap-2 text-lg">
                        <h2 className="opacity-60">Location</h2>
                        <p>Jl. Raya Tajur, Kp. Buntar RT.02/RW.08, Kel. Muara sari, Kec. Bogor Selatan</p>
                    </div>
                    <div className="flex flex-col gap-2 text-lg">
                        <h2 className="opacity-60">Email</h2>
                        <p>renjieprass@gmail.com</p>
                    </div>
                    <div className="flex flex-col gap-2 text-lg">
                        <h2 className="opacity-60">Contact</h2>
                        <p>+62 857 7025 3105</p>
                    </div>
                    <div className="flex flex-col gap-2 text-lg">
                        <h2 className="opacity-60">Social Media</h2>
                        <div className="flex gap-4">
                            <Link href="https://facebook.com/JiePrass" target="_blank" rel="noopener noreferrer">
                                <BrandFacebook className="w-8 h-8 hover:text-blue-500 transition" />
                            </Link>
                            <Link href="https://instagram.com/jie.env" target="_blank" rel="noopener noreferrer">
                                <BrandInstagram className="w-8 h-8 hover:text-pink-500 transition" />
                            </Link>
                            <Link href="https://twitter.com/jie.env" target="_blank" rel="noopener noreferrer">
                                <BrandTwitter className="w-8 h-8 hover:text-sky-400 transition" />
                            </Link>
                            <Link href="https://youtube.com/jie.env" target="_blank" rel="noopener noreferrer">
                                <BrandYoutube className="w-8 h-8 hover:text-red-600 transition" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Big Logo Text */}
            <div className="container mx-auto md:px-0">
                <div className="flex justify-center items-center">
                    <h1 className="text-[77px] md:text-[160px] lg:text-[444px] cursor-default text-text mb-6 leading-none font-semibold text-center">
                        Unify
                    </h1>
                </div>

                <button
                    onClick={scrollToTop}
                    className="w-full rounded-xl px-4 md:px-8 py-4 flex items-center justify-between gap-4 bg-primary text-sm hover:bg-[#FFD4A9] transition cursor-pointer"
                >
                    <span className="text-left">
                        Kembali Ke Halaman<br /> Paling Atas
                    </span>
                    <div className="bg-white text-black rounded-full p-2">
                        <ArrowUp className="w-4 h-4" />
                    </div>
                </button>
            </div>

            <p className="text-xs text-center text-subtle md:hidden mt-4">
                &copy; {currentYear} Unify semua hak dilindungi.
            </p>
        </footer>
    );
}
