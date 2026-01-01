"use client";

import Image from "next/image";

const features = [
    {
        title: "Sistem Bantuan Berbasis Lokasi (Real-Time)",
        description: "Temukan dan bantu orang di sekitar Anda secara instan.",
    },
    {
        title: "Chat Langsung 1-on-1",
        description: "Komunikasi langsung antara peminta bantuan dan relawan.",
    },
    {
        title: "Sistem Reputasi & Kepercayaan",
        description: "Nilai dan pantau reputasi relawan untuk keamanan.",
    },
    {
        title: "Misi, Badge, & Leaderboard",
        description: "Tingkatkan motivasi relawan dengan gamifikasi.",
    },
];

export default function FeatureSection() {
    return (
        <section className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 py-24" id="about">
            {/* Kiri: Judul dan fitur */}
            <div className="flex-1">
                <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                    Mulai Membantu Masyarakat Sekarang dengan <span className="text-primary">Unify</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {features.map((feature, idx) => (
                        <div key={idx} className="p-4 bg-[#FFD4A9] rounded-lg hover:shadow-lg transition">
                            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                            <p className="text-gray-600 text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Kanan: Gambar prototype HP */}
            <div className="flex-1 flex justify-center">
                <div className="relative w-72 h-144 sm:w-80 sm:h-144">
                    <Image
                        src="/images/phone.png"
                        alt="Unify App Prototype"
                        fill
                        className="object-contain"
                    />
                </div>
            </div>
        </section>
    );
}
