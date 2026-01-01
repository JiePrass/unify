"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Script from "next/script"

const faqs = [
    {
        question: "Apa itu Unify?",
        answer:
            "Unify adalah platform yang menghubungkan pengguna yang membutuhkan bantuan dengan relawan di sekitar mereka secara cepat, transparan, dan berbasis kepercayaan.",
    },
    {
        question: "Bagaimana cara membuat akun di Unify?",
        answer:
            "Pengguna dapat membuat akun dengan mendaftar menggunakan email aktif. Setelah itu, akun akan diverifikasi melalui email sebelum dapat digunakan sepenuhnya.",
    },
    {
        question: "Bagaimana cara mengajukan permintaan bantuan?",
        answer:
            "Setelah login, pengguna dapat membuat permintaan bantuan dengan mengisi detail kebutuhan, lokasi, dan kategori bantuan yang sesuai.",
    },
    {
        question: "Bagaimana relawan mengambil bantuan?",
        answer:
            "Relawan dapat melihat daftar bantuan di sekitar lokasi mereka dan mengambil bantuan yang tersedia. Setelah diambil, relawan wajib menyelesaikan bantuan sesuai ketentuan waktu.",
    },
    {
        question: "Apakah saya bisa menjadi relawan sekaligus peminta bantuan?",
        answer:
            "Ya. Setiap pengguna Unify dapat berperan sebagai peminta bantuan maupun relawan secara bergantian.",
    },
    {
        question: "Bagaimana sistem skor reputasi bekerja?",
        answer:
            "Setiap aktivitas bantuan akan memengaruhi skor reputasi pengguna. Menyelesaikan bantuan dengan baik akan meningkatkan reputasi, sementara pembatalan atau pelanggaran akan menurunkannya.",
    },
    {
        question: "Apa keuntungan membantu peminta bantuan sebagai relawan?",
        answer:
            "Selain membantu sesama, relawan akan memperoleh poin, reputasi, serta lencana yang mencerminkan kontribusi dan kepercayaan dalam komunitas Unify."
    },
    {
        question: "Bagaimana jika peminta bantuan atau relawan membatalkan bantuan secara tiba tiba?",
        answer:
            "Jika bantuan dibatalkan secara tiba-tiba, sistem akan mencatat pembatalan tersebut. Pembatalan tanpa alasan yang sah dapat dikenakan penalti reputasi sesuai kebijakan Unify."
    },
]


export default function FAQSection() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    const toggleFAQ = (index: number) => {
        setActiveIndex((prev) => (prev === index ? null : index))
    }

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map((faq) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer,
            },
        })),
    }

    return (
        <section aria-label="Pertanyaan yang Sering Diajukan" className="container mx-auto px-6 pb-32 flex justify-center" id="faq">
            <Script
                id="faq-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <div className="md:max-w-3xl">
                <div className="flex flex-col text-center mb-12 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold">
                        Berbagai Pertanyaan yang sering ditanyakan seputar <span className="text-primary">Unify</span>
                    </h2>
                    <p className="font-light md:px-48">Cari dan temukan jawabanmu dari berbagai pertanyaan seputar Unify disini!</p>
                </div>

                <div className="space-y-4 mx-auto">
                    {faqs.map((faq, index) => {
                        const isOpen = index === activeIndex
                        const answerId = `faq-answer-${index}`

                        return (
                            <div
                                key={index}
                                className="border-b border-gray-500 overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex items-center justify-between px-5 py-4 text-left text-lg font-medium cursor-pointer transition"
                                    aria-expanded={isOpen}
                                    aria-controls={answerId}
                                >
                                    {faq.question}
                                    {isOpen ? (
                                        <ChevronUp className="w-5 h-5" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5" />
                                    )}
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            id={answerId}
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                        >
                                            <div className="px-5 pb-4 pt-0 text-gray-600 text-base">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
