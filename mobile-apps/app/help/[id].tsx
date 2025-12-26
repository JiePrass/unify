import { useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Linking,
    Platform,
    Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { getHelpRequestById, takeHelpRequest, confirmHelper, cancelHelpRequest, markHelpCompleted, markHelpFailed } from "@/lib/api/help";
import HeaderScreen from "@/components/header-screen";
import Ionicons from "@expo/vector-icons/Ionicons";
import CancelHelpModal from "@/components/modals/cancel-help-modal";

const getStatusColor = (status: string, colors: any) => {
    switch (status.toUpperCase()) {
        case "IN_PROGRESS":
            return "#ead326ff";
        case "TAKEN":
            return "#e9950eff";
        case "OPEN":
            return "#10B981";
        case "COMPLETED":
            return "#107134ff";
        case "CANCELLED":
            return "#EF4444";
        default:
            return colors.subText;
    }
};

export const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
        case "fisik":
            return "body-outline";
        case "medis":
            return "medkit-outline";
        case "logistik":
            return "cube-outline";
        case "transportasi":
            return "car-outline";
        case "keamanan":
            return "shield-checkmark-outline";
        default:
            return "help-circle-outline";
    }
};

export default function HelpDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const insets = useSafeAreaInsets();

    const background = useThemeColor({}, "background");
    const card = useThemeColor({}, "card");
    const icon = useThemeColor({}, "icon");
    const primary = useThemeColor({}, "primary");

    const [loading, setLoading] = useState(true);
    const [help, setHelp] = useState<any>(null);

    const snapPoints = useMemo(() => ["25%", "75%"], []);

    const [actionLoading, setActionLoading] = useState(false);
    const [cancelModalVisible, setCancelModalVisible] = useState(false);

    useEffect(() => {
        fetchHelp();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchHelp = async () => {
        try {
            const res = await getHelpRequestById(id!);
            setHelp(res.data);
        } finally {
            setLoading(false);
        }
    };

    const handleTakeHelp = async () => {
        try {
            setActionLoading(true);
            await takeHelpRequest(help.id);
            fetchHelp(); // refresh status
        } catch (err: any) {
            Alert.alert("Gagal", "Tidak dapat mengambil bantuan. Pastikan Anda tidak memiliki bantuan aktif lain.");
            console.error(err)
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmHelp = async () => {
        if (!help.assignment?.id) {
            Alert.alert("Error", "Data assignment tidak valid.");
            return;
        }
        try {
            setActionLoading(true);
            await confirmHelper(help.id, help.assignment?.id);
            fetchHelp();
        } catch (err: any) {
            Alert.alert("Gagal", "Gagal mengonfirmasi relawan.");
            console.error(err)
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelHelp = async (reasonCode: string) => {
        try {
            setActionLoading(true);
            await cancelHelpRequest(help.id, { reason_code: reasonCode });
            setCancelModalVisible(false);
            fetchHelp();
        } catch (err: any) {
            Alert.alert("Gagal", "Gagal membatalkan bantuan.");
            console.error(err)
        } finally {
            setActionLoading(false);
        }
    };

    const openCancelModal = () => {
        setCancelModalVisible(true);
    };

    const handleCompleteHelp = async () => {
        if (!help.assignment?.id) {
            Alert.alert("Error", "Data assignment tidak valid/hilang.");
            return;
        }
        try {
            setActionLoading(true);
            await markHelpCompleted(help.assignment.id);
            fetchHelp();
        } catch (err: any) {
            Alert.alert("Gagal", "Gagal menyelesaikan bantuan.");
            console.error(err)
        } finally {
            setActionLoading(false);
        }
    };

    const handleFailHelp = async () => {
        if (!help.assignment?.id) {
            Alert.alert("Error", "Data assignment tidak valid.");
            return;
        }
        try {
            setActionLoading(true);
            await markHelpFailed(help.assignment.id);
            fetchHelp();
        } catch (err: any) {
            Alert.alert("Gagal", "Gagal menandai bantuan gagal.");
            console.error(err)
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenMaps = () => {
        const scheme = Platform.select({ ios: 'maps://0,0?daddr=', android: 'google.navigation:q=' });
        const latLng = `${help.latitude},${help.longitude}`;
        const label = help.title;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}`
        });

        if (url) {
            Linking.openURL(url);
        }
    };

    const handleOpenChat = () => {
        router.push({
            pathname: "/chat",
            params: {
                helpDetail: JSON.stringify(help),
            },
        });
    };

    if (loading || !help) {
        return (
            <View style={[styles.loading, { backgroundColor: background }]}>
                <ActivityIndicator size="large" color={icon} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* MAP LAYER */}
            <View style={StyleSheet.absoluteFill}>
                <MapView
                    style={StyleSheet.absoluteFill}
                    initialRegion={{
                        latitude: help.latitude,
                        longitude: help.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                >
                    <Marker
                        coordinate={{
                            latitude: help.latitude,
                            longitude: help.longitude,
                        }}
                    >
                        <View style={styles.customMarker}>
                            <View style={[styles.markerBubble, { backgroundColor: primary }]}>
                                <Ionicons
                                    name={getCategoryIcon(help.category)}
                                    size={20}
                                    color="#fff"
                                />
                            </View>
                        </View>
                    </Marker>
                </MapView>
            </View>

            {/* HEADER */}
            <View
                style={[
                    styles.headerWrapper,
                    {
                        paddingTop: insets.top,
                    },
                ]}
            >
                <HeaderScreen title="Detail Permintaan Bantuan" />
            </View>

            {/* BOTTOM SHEET */}
            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                index={0}
                enablePanDownToClose={false}
                backgroundStyle={{ backgroundColor: card }}
                handleIndicatorStyle={{ backgroundColor: icon }}
            >
                <BottomSheetView style={[styles.sheetContent, { backgroundColor: card }]}>
                    <ThemedText type="title">{help.title}</ThemedText>
                    <ThemedText style={styles.desc}>
                        {help.description}
                    </ThemedText>

                    <View style={styles.row}>
                        <ThemedText type="defaultSemiBold">Kategori</ThemedText>

                        <View style={styles.categoryChip}>
                            <Ionicons
                                name={getCategoryIcon(help.category)}
                                size={14}
                                color={icon}
                                style={{ marginRight: 6 }}
                            />
                            <ThemedText style={styles.categoryText}>
                                {help.category.toUpperCase()}
                            </ThemedText>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <ThemedText type="defaultSemiBold">Status</ThemedText>

                        <View style={[styles.statusBadge, { borderColor: getStatusColor(help.status, { subText: icon }) }]}>
                            <Ionicons
                                name="ellipse"
                                size={10}
                                color={getStatusColor(help.status, { subText: icon })}
                                style={{ marginRight: 6 }}
                            />
                            <ThemedText style={[styles.statusText, { color: getStatusColor(help.status, { subText: icon }) }]}>
                                {help.status}
                            </ThemedText>
                        </View>
                    </View>

                    {/* AVATAR SECTION */}
                    <ThemedText type="subtitle" style={styles.section}>
                        Peminta Bantuan
                    </ThemedText>
                    <View style={styles.avatarSection}>
                        <View style={styles.userInfo}>
                            <Image
                                source={
                                    help.requester?.avatar_url
                                        ? { uri: help.requester.avatar_url }
                                        : require("@/assets/icons/avatar-placeholder.png")
                                }
                                style={styles.avatar}
                            />

                            <ThemedText type="defaultSemiBold" style={styles.userName}>
                                {help.requester?.full_name ?? "User"}
                            </ThemedText>
                        </View>

                        <View
                            style={styles.reputationBadge}
                        >
                            <ThemedText
                                type="defaultSemiBold"
                                style={styles.reputationText}
                            >
                                {help.requester?.reputation_score ?? 100}
                            </ThemedText>
                            <Ionicons
                                name="shield-checkmark"
                                size={24}
                                color={primary}
                            />
                        </View>
                    </View>

                    {help.helper && (
                        <>
                            <ThemedText type="subtitle" style={styles.section}>
                                Relawan
                            </ThemedText>

                            <View style={styles.avatarSection}>
                                {/* LEFT */}
                                <View style={styles.userInfo}>
                                    <Image
                                        source={
                                            help.helper.avatar_url
                                                ? { uri: help.helper.avatar_url }
                                                : require("@/assets/icons/avatar-placeholder.png")
                                        }
                                        style={styles.avatar}
                                    />

                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={styles.userName}
                                    >
                                        {help.helper.full_name}
                                    </ThemedText>
                                </View>

                                {/* RIGHT */}
                                <View style={styles.reputationBadge}>
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={styles.reputationText}
                                    >
                                        {help.helper.reputation_score}
                                    </ThemedText>
                                    <Ionicons
                                        name="shield-checkmark"
                                        size={24}
                                        color={primary}
                                    />
                                </View>
                            </View>
                        </>
                    )}

                    {/* ACTION BUTTONS */}
                    {help.permissions?.can_take && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: primary }]}
                            disabled={actionLoading}
                            onPress={handleTakeHelp}
                        >
                            {actionLoading ? (
                                <ActivityIndicator color={icon} />
                            ) : (
                                <ThemedText style={styles.actionText}>
                                    Ambil Bantuan
                                </ThemedText>
                            )}
                        </TouchableOpacity>
                    )}

                    {(help.status === "TAKEN" || help.status === "IN_PROGRESS") && (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.outlineButton, { borderColor: primary, marginBottom: 12, marginTop: 20 }]}
                                onPress={handleOpenMaps}
                            >
                                <ThemedText style={[styles.outlineText, { color: primary }]}>
                                    Navigasi ke Lokasi
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: primary, marginTop: 0 }]}
                                onPress={handleOpenChat}
                            >
                                <ThemedText style={styles.actionText}>
                                    {help.role === "REQUESTER"
                                        ? "Hubungi Relawan"
                                        : "Hubungi Peminta Bantuan"}
                                </ThemedText>
                            </TouchableOpacity>
                        </>
                    )}

                    {help.permissions?.can_confirm && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: primary }]}
                            disabled={actionLoading}
                            onPress={handleConfirmHelp}
                        >
                            {actionLoading ? (
                                <ActivityIndicator color={icon} />
                            ) : (
                                <ThemedText style={styles.actionText}>
                                    Konfirmasi Kehadiran
                                </ThemedText>
                            )}
                        </TouchableOpacity>
                    )}

                    {help.permissions?.can_complete && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: primary }]}
                            disabled={actionLoading}
                            onPress={handleCompleteHelp}
                        >
                            {actionLoading ? (
                                <ActivityIndicator color={icon} />
                            ) : (
                                <ThemedText style={styles.actionText}>
                                    Bantuan Selesai
                                </ThemedText>
                            )}
                        </TouchableOpacity>
                    )}

                    {help.permissions?.can_fail && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton]}
                            disabled={actionLoading}
                            onPress={handleFailHelp}
                        >
                            {actionLoading ? (
                                <ActivityIndicator color="#EF4444" />
                            ) : (
                                <ThemedText style={styles.cancelText}>
                                    Bantuan Gagal
                                </ThemedText>
                            )}
                        </TouchableOpacity>
                    )}

                    {help.permissions?.can_cancel && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton]}
                            disabled={actionLoading}
                            onPress={openCancelModal}
                        >
                            {actionLoading ? (
                                <ActivityIndicator color="#EF4444" />
                            ) : (
                                <ThemedText style={styles.cancelText}>
                                    Batalkan Bantuan
                                </ThemedText>
                            )}
                        </TouchableOpacity>
                    )}

                </BottomSheetView>
            </BottomSheet>

            {/* CANCEL MODAL */}
            <CancelHelpModal
                visible={cancelModalVisible}
                onClose={() => setCancelModalVisible(false)}
                onConfirm={handleCancelHelp}
                loading={actionLoading}
                role={help?.role}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerWrapper: {
        position: "absolute",
        left: 0,
        right: 0,
        zIndex: 20,
    },
    loading: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    sheetContent: {
        padding: 16,
    },
    desc: {
        marginTop: 8,
        marginBottom: 16,
        fontSize: 16,
    },
    section: {
        marginTop: 20,
        marginBottom: 8,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    categoryChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: "600",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 13,
        fontWeight: "600",
    },
    avatarSection: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    userName: {
        fontSize: 14,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    reputationBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    reputationText: {
        fontSize: 20,
    },
    actionButton: {
        marginTop: 20,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    actionText: {
        fontSize: 16,
        fontWeight: "700",
    },
    cancelButton: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#EF4444",
    },
    cancelText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#EF4444",
    },
    outlineButton: {
        backgroundColor: "transparent",
        borderWidth: 1,
    },
    outlineText: {
        fontSize: 16,
        fontWeight: "700",
    },
    customMarker: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
    },
    markerBubble: {
        width: 32,
        height: 32,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
