"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCancelHelpRequest } from "@/lib/api/admin";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { CancelHelpFilterForm } from "@/components/shared/cancel-help-request-filter";

type CancelEvent = {
    id: number;
    actor: string;
    stage: string;
    violation_score: number;
    created_at: string;
    actorUser: {
        id: number;
        full_name: string;
    } | null;
    helpRequest: {
        id: number;
        title: string;
        status: string;
    } | null;
};

export default function ManageCancelHelp() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [data, setData] = useState<CancelEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        actor: searchParams.get("actor") ?? "",
        stage: searchParams.get("stage") ?? "",
        minViolationScore: searchParams.get("minViolationScore") ?? "",
        from: searchParams.get("from") ?? "",
        to: searchParams.get("to") ?? "",
        onlyPending: true,
    });


    const updateQuery = (params: Record<string, string | undefined>) => {
        const query = new URLSearchParams(searchParams.toString());

        Object.entries(params).forEach(([key, value]) => {
            if (!value) query.delete(key);
            else query.set(key, value);
        });

        router.push(`?${query.toString()}`);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            const params = {
                actor: searchParams.get("actor") ?? undefined,
                stage: searchParams.get("stage") ?? undefined,
                minViolationScore: searchParams.get("minViolationScore")
                    ? Number(searchParams.get("minViolationScore"))
                    : undefined,
                from: searchParams.get("from") ?? undefined,
                to: searchParams.get("to") ?? undefined,
                onlyPending: true as const,
            };

            try {
                const res = await getCancelHelpRequest(params);
                setData(res);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams]);

    const formatDate = (date: string) => {
        const d = new Date(date);
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${mm}-${dd}-${yyyy}`;
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-">

                <h1 className="text-xl font-semibold mb-4">
                    Pembatalan Permintaan Bantuan
                </h1>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent align="end" className="p-4">
                        <CancelHelpFilterForm
                            filters={filters}
                            setFilters={setFilters}
                            onApply={() =>
                                updateQuery({
                                    actor: filters.actor || undefined,
                                    stage: filters.stage || undefined,
                                    minViolationScore:
                                        filters.minViolationScore || undefined,
                                    from: filters.from || undefined,
                                    to: filters.to || undefined,
                                })
                            }
                            onReset={() => {
                                setFilters({
                                    actor: "",
                                    stage: "",
                                    minViolationScore: "",
                                    from: "",
                                    to: "",
                                    onlyPending: true,
                                });
                                router.push("?");
                            }}
                        />
                    </PopoverContent>
                </Popover>

            </div>

            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-muted">
                        <tr className="text-left">
                            <th className="px-4 py-3">Tanggal</th>
                            <th className="px-4 py-3">Pelapor</th>
                            <th className="px-4 py-3">Nama</th>
                            <th className="px-4 py-3">Tahap</th>
                            <th className="px-4 py-3">Skor</th>
                            <th className="px-4 py-3">Bantuan</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-4 py-6 text-center text-muted-foreground"
                                >
                                    Tidak ada data pembatalan
                                </td>
                            </tr>
                        )}

                        {data.map((item) => (
                            <tr
                                key={item.id}
                                onClick={() =>
                                    router.push(
                                        `/admin/cancel-help/${item.id}`
                                    )
                                }
                                className="border-t cursor-pointer hover:bg-muted/60 transition"
                            >
                                <td className="px-4 py-3">
                                    {formatDate(item.created_at)}
                                </td>

                                <td className="px-4 py-3 font-medium">
                                    {item.actor}
                                </td>

                                <td className="px-4 py-3">
                                    {item.actorUser?.full_name ?? "-"}
                                </td>

                                <td className="px-4 py-3">
                                    {item.stage}
                                </td>

                                <td className="px-4 py-3">
                                    <span
                                        className={
                                            item.violation_score >= 10
                                                ? "text-red-600 font-semibold"
                                                : ""
                                        }
                                    >
                                        {item.violation_score}
                                    </span>
                                </td>

                                <td className="px-4 py-3">
                                    {item.helpRequest?.title ?? "-"}
                                </td>

                                <td className="px-4 py-3">
                                    {item.helpRequest?.status ?? "-"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
