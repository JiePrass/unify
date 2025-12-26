import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

const CANCEL_REASONS_REQUESTER = [
    { code: "CHANGE_OF_MIND", label: "Berubah pikiran" },
    { code: "FOUND_OTHER_HELPER", label: "Menemukan relawan lain" },
    { code: "NO_LONGER_NEEDED", label: "Bantuan tidak lagi dibutuhkan" },
    { code: "HELPER_NO_RESPONSE", label: "Relawan tidak merespon" },
    { code: "HELPER_LATE", label: "Relawan terlambat" },
];

const CANCEL_REASONS_HELPER = [
    { code: "CANNOT_REACH_LOCATION", label: "Tidak dapat menjangkau lokasi" },
    { code: "REQUESTER_NO_SHOW", label: "Peminta bantuan tidak ada" },
    { code: "REQUESTER_UNRESPONSIVE", label: "Peminta bantuan tidak merespon" },
    { code: "TASK_NOT_AS_DESCRIBED", label: "Tugas tidak sesuai deskripsi" },
];

interface CancelHelpModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (reasonCode: string) => void;
    loading?: boolean;
    role?: "REQUESTER" | "HELPER" | "PUBLIC" | string;
}

export default function CancelHelpModal({
    visible,
    onClose,
    onConfirm,
    loading = false,
    role = "REQUESTER",
}: CancelHelpModalProps) {
    const card = useThemeColor({}, "card");
    const primary = useThemeColor({}, "primary");
    const icon = useThemeColor({}, "icon");

    const [selectedReason, setSelectedReason] = useState<string | null>(null);

    // Reset selection when modal opens/closes
    useEffect(() => {
        if (visible) {
            setSelectedReason(null);
        }
    }, [visible]);

    const handleConfirm = () => {
        if (selectedReason) {
            onConfirm(selectedReason);
        }
    };

    const reasons = role === "HELPER" ? CANCEL_REASONS_HELPER : CANCEL_REASONS_REQUESTER;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
                <View style={[styles.modalContent, { backgroundColor: card }]}>
                    <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
                        Alasan Pembatalan
                    </ThemedText>

                    <ScrollView style={{ maxHeight: 300 }}>
                        {reasons.map((item) => (
                            <TouchableOpacity
                                key={item.code}
                                style={[
                                    styles.reasonItem,
                                    selectedReason === item.code && { backgroundColor: primary + "20" },
                                ]}
                                onPress={() => setSelectedReason(item.code)}
                            >
                                <View style={[styles.radioOuter, { borderColor: icon }]}>
                                    {selectedReason === item.code && (
                                        <View style={[styles.radioInner, { backgroundColor: primary }]} />
                                    )}
                                </View>
                                <ThemedText>{item.label}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={[styles.row, { marginTop: 20, justifyContent: "flex-end", gap: 12 }]}>
                        <TouchableOpacity onPress={onClose} style={{ padding: 10 }}>
                            <ThemedText>Batal</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleConfirm}
                            disabled={!selectedReason || loading}
                            style={[
                                styles.actionButton,
                                {
                                    backgroundColor: !selectedReason ? "#ccc" : "#EF4444",
                                },
                            ]}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <ThemedText style={{ color: "#fff", fontWeight: "bold" }}>
                                    Konfirmasi
                                </ThemedText>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        width: "100%",
        borderRadius: 16,
        padding: 20,
        elevation: 5,
    },
    reasonItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 4,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        marginRight: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    actionButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
});
