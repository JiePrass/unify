/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";

import {
    getCancelHelpRequestDetail,
    executeCancelHelpRequestPenalty,
} from "@/lib/api/admin";

import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Detail = any;

export default function CancelHelpDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState<Detail | null>(null);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const [targetUserId, setTargetUserId] = useState<number | undefined>();
    const [notes, setNotes] = useState("");

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getCancelHelpRequestDetail(id as string);
                setData(res);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    useEffect(() => {
        if (!data?.actorUser?.id) return;

        setTargetUserId((prev) =>
            prev ?? data.actorUser.id
        );
    }, [data]);

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    if (!data) {
        return <div className="p-6">Data not found</div>;
    }

    const {
        cancelHelpRequest,
        actorUser,
        helpRequest,
        assignment,
        chatHistory,
        timeline,
    } = data;

    const executed = data?.cancelHelpRequest.penalty_executed === true;

    const penaltyTargets = Array.from(
        new Map<number, { label: string; value: number }>([
            [actorUser.id, { label: "Actor", value: actorUser.id }],
            [assignment.helper.id, { label: "Helper", value: assignment.helper.id }],
        ]).values()
    );

    const formatDateTime = (value?: string | null) => {
        if (!value) return "-";
        return new Date(value).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    const handleExecutePenalty = async () => {
        if (executed || executing) return;

        const confirm = await Swal.fire({
            title: "Jalankan Penalti?",
            text: "Tindakan ini akan memengaruhi reputasi pengguna dan tidak dapat dibatalkan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, jalankan",
            cancelButtonText: "Batal",
            confirmButtonColor: "#dc2626",
        });

        if (!confirm.isConfirmed) return;

        setExecuting(true);
        try {
            await executeCancelHelpRequestPenalty(cancelHelpRequest.id, {
                targetUserId,
                notes: notes || undefined,
            });

            setData((prev: { cancelHelpRequest: any; }) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    cancelHelpRequest: {
                        ...prev.cancelHelpRequest,
                        penalty_executed: true,
                        penalty_executed_at: new Date().toISOString(),
                    },
                };
            });

            await Swal.fire({
                title: "Penalti Berhasil Diterapkan",
                text: "Skor Reputasi Pengguna Dikurangi",
                icon: "success",
            });

            router.refresh();
        } catch (err: any) {
            await Swal.fire({
                title: "Gagal Menjalankan Penalti",
                text:
                    err?.message ??
                    "Terjadi kesalahan saat menjalankan penalti. Silahkan coba lagi.",
                icon: "error",
            });
        } finally {
            setExecuting(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold">
                    Detail Pembatalan Permintaan Bantuan
                </h1>
                <Button variant="outline" onClick={() => router.back()}>
                    Kembali
                </Button>
            </div>

            {/* Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Ringaksan Pembatalan</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Pelapor</p>
                        <Badge>{cancelHelpRequest.actor}</Badge>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Tahapan</p>
                        <Badge variant="outline">{cancelHelpRequest.stage}</Badge>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Skor Pelanggaran</p>
                        <span className="font-semibold text-red-600">
                            {cancelHelpRequest.violation_score}
                        </span>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Skor Dampak</p>
                        {cancelHelpRequest.impact_score}
                    </div>
                    <div>
                        <p className="text-muted-foreground">Kode Alasan</p>
                        {cancelHelpRequest.reason_code}
                    </div>
                    <div>
                        <p className="text-muted-foreground">Dilaporkan Pada</p>
                        {formatDateTime(cancelHelpRequest.created_at)}
                    </div>
                </CardContent>
            </Card>

            {/* Users */}
            <Card>
                <CardHeader>
                    <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-medium">Pelapor</p>
                        <p>{actorUser.full_name}</p>
                        <p className="text-muted-foreground">{actorUser.email}</p>
                        <p>Skor Reputasi: {actorUser.reputation_score}</p>
                    </div>

                    <div>
                        <p className="font-medium">Relawan</p>
                        <p>{assignment.helper.full_name}</p>
                        <p className="text-muted-foreground">
                            {assignment.helper.email}
                        </p>
                        <p>Skor Reputasi: {assignment.helper.reputation_score}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Help Request */}
            <Card>
                <CardHeader>
                    <CardTitle>Permintaan Bantuan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p><strong>Judul:</strong> {helpRequest.title}</p>
                    <p><strong>Desktripsi:</strong> {helpRequest.description}</p>
                    <p><strong>Kategori:</strong> {helpRequest.category}</p>
                    <p><strong>Status:</strong> {helpRequest.status}</p>
                    <p><strong>Dibuat Pada:</strong> {formatDateTime(helpRequest.created_at)}</p>
                </CardContent>
            </Card>

            {/* Assignment */}
            <Card>
                <CardHeader>
                    <CardTitle>Pertolongan</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant="destructive">{assignment.status}</Badge>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Diambil Pada</p>
                        {formatDateTime(assignment.taken_at)}
                    </div>
                    <div>
                        <p className="text-muted-foreground">Gagal Pada</p>
                        {formatDateTime(assignment.failed_at)}
                    </div>
                </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Lini Masa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {timeline.map((t: any, i: number) => (
                        <div key={i} className="flex justify-between">
                            <span>{t.event}</span>
                            <span className="text-muted-foreground">
                                {formatDateTime(t.timestamp)}
                            </span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Chat History */}
            <Card>
                <CardHeader>
                    <CardTitle>Riwayat Pesan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {chatHistory.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Tidak ada Pesan
                        </p>
                    )}

                    {chatHistory.map((c: any, i: number) => (
                        <div key={i} className="border rounded-lg p-3 text-sm">
                            <div className="flex justify-between mb-1">
                                <span className="font-medium">
                                    {c.sender_name} ({c.role})
                                </span>
                                <span className="text-muted-foreground">
                                    {formatDateTime(c.created_at)}
                                </span>
                            </div>
                            <p>{c.message}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Penalty Execution Info */}
            {executed && (
                <Card>
                    <CardHeader>
                        <CardTitle>Terapkan Penalti</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Diterapkan Pada</p>
                            <p>{formatDateTime(cancelHelpRequest.penalty_executed_at)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Diterapkan Oleh</p>
                            <p>{cancelHelpRequest.penaltyExecutedBy?.full_name ?? "-"}</p>
                            <p className="text-muted-foreground">
                                {cancelHelpRequest.penaltyExecutedBy?.email}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Target Pengguna</p>
                            <p>
                                {targetUserId === actorUser.id ? "Actor" : "Helper"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Execute Penalty */}
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">
                        Terapkan Penalti
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 text-sm">
                    <div className="space-y-1">
                        <p className="text-muted-foreground">Target Pengguna</p>
                        <Select
                            disabled={executed}
                            value={targetUserId?.toString()}
                            onValueChange={(v) => setTargetUserId(Number(v))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Actor (default)" />
                            </SelectTrigger>
                            <SelectContent>
                                {penaltyTargets.map((t) => (
                                    <SelectItem
                                        key={t.value}
                                        value={String(t.value)}
                                    >
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <p className="text-muted-foreground">Catatan Audit</p>
                        <Textarea
                            placeholder="Optional notes for audit log"
                            value={notes}
                            disabled={executed}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <Button
                        variant="destructive"
                        disabled={executing || executed}
                        onClick={handleExecutePenalty}
                    >
                        {executed ? "Penalti Sudah Diterapkan" : "Terapkan Penalty"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
