import { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { HelpCard } from "@/components/cards/help-card";
import { useAuth } from "@/contexts/auth-context";
import {
    getMyActiveHelp,
    getNearbyHelpRequests,
} from "@/lib/api/help";
import { NearbyHelpState } from "@/components/nearby-help-state";

export default function HelpScreen() {
    const { user } = useAuth();
    const router = useRouter();

    const background = useThemeColor({}, "background");
    const card = useThemeColor({}, "card");
    const primary = useThemeColor({}, "primary");
    const subText = useThemeColor({}, "subText");
    const border = useThemeColor({}, "border");

    const [location, setLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const [activeHelp, setActiveHelp] = useState<any>(null);
    const [nearbyHelps, setNearbyHelps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setLoading(false);
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});
            const coords = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            };

            setLocation(coords);

            try {
                const [active, nearby] = await Promise.all([
                    getMyActiveHelp({
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        radius: 5000,
                    }),
                    getNearbyHelpRequests({
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        radius: 5000,
                    }),
                ]);

                setActiveHelp(active?.data ?? null);
                setNearbyHelps(nearby?.data ?? []);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: background }]}
        >
            {/* ================= HEADER ================= */}
            <ThemedView style={styles.header}>
                {/* LEFT */}
                <View style={styles.headerLeft}>
                    <Image
                        source={
                            user?.avatar_url
                                ? { uri: user.avatar_url }
                                : require("@/assets/icons/avatar-placeholder.png")
                        }
                        style={styles.avatar}
                    />

                    <ThemedText type="defaultSemiBold" style={styles.userName}>
                        {user?.full_name ?? "User"}
                    </ThemedText>
                </View>

                {/* RIGHT */}
                <View
                    style={styles.reputationBadge}
                >
                    <ThemedText
                        type="defaultSemiBold"
                        style={styles.reputationText}
                    >
                        {user?.reputation_score ?? 100}
                    </ThemedText>
                    <Ionicons
                        name="shield-checkmark"
                        size={24}
                        color={primary}
                    />
                </View>
            </ThemedView>

            {/* ================= ACTION BUTTONS ================= */}
            <ThemedView style={styles.actionRow}>
                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        {
                            backgroundColor: card,
                            borderColor: border,
                        },
                    ]}
                    onPress={() => router.push("/help/request")}
                >
                    <Ionicons
                        name="add"
                        size={32}
                        color={primary}
                    />
                    <ThemedText type="defaultSemiBold">Buat Bantuan</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        {
                            backgroundColor: card,
                            borderColor: border,
                        },
                    ]}
                    onPress={() => router.push("/")}
                >
                    <Ionicons
                        name="time"
                        size={32}
                        color={primary}
                    />
                    <ThemedText type="defaultSemiBold">
                        Riwayat Bantuan
                    </ThemedText>
                </TouchableOpacity>
            </ThemedView>

            {/* ================= Bantuan Aktif ================= */}
            <ThemedView style={styles.activeWrapper}>
                {activeHelp ? (
                    <HelpCard
                        data={activeHelp.help}
                        onPress={() =>
                            router.push(`/`)
                        }
                    />
                ) : (
                    <ThemedView
                        style={[
                            styles.emptyActiveCard,
                            { backgroundColor: card, borderColor: border },
                        ]}
                    >
                        <Ionicons
                            name="information-circle"
                            size={32}
                            color={primary}
                        />
                        <ThemedText type="subtitle">
                            Tidak ada bantuan aktif
                        </ThemedText>
                    </ThemedView>
                )}
            </ThemedView>

            {/* ================= Map ================= */}
            <View style={[styles.mapWrapper, { backgroundColor: card }]}>
                {loading || !location ? (
                    <View style={styles.mapSkeleton}>
                        <Ionicons
                            name="map"
                            size={40}
                            color={subText}
                        />
                        <ThemedText type="subtitle">
                            Memuat peta…
                        </ThemedText>
                    </View>
                ) : (
                    <MapView
                        style={StyleSheet.absoluteFill}
                        initialRegion={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                            latitudeDelta: 0.03,
                            longitudeDelta: 0.03,
                        }}
                    >
                        {/* USER MARKER */}
                        <Marker
                            coordinate={location}
                            title="Lokasimu"
                            pinColor="#2563EB"
                        />

                        {/* HELP MARKERS */}
                        {nearbyHelps.map((help) => (
                            <Marker
                                key={help.id}
                                coordinate={{
                                    latitude: help.latitude,
                                    longitude: help.longitude,
                                }}
                                title={help.title}
                                description={help.category}
                                pinColor="#EF4444"
                                onPress={() => router.push(`/`)}
                            />
                        ))}
                    </MapView>
                )}
            </View>

            {/* ================= List Bantuan Terdekat ================= */}
            <ThemedView style={styles.listWrapper}>
                <ThemedText
                    type="defaultSemiBold"
                    style={styles.sectionTitle}
                >
                    Bantuan Terdekat
                </ThemedText>

                {loading && <NearbyHelpState type="loading" />}

                {!loading && nearbyHelps.length === 0 && (
                    <NearbyHelpState type="empty" />
                )}

                {!loading && nearbyHelps.length > 0 && (
                    <FlatList
                        data={nearbyHelps}
                        keyExtractor={(item) => String(item.id)}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingVertical: 12,
                            flexGrow: nearbyHelps.length === 0 ? 1 : undefined,
                        }}
                        renderItem={({ item }) => (
                            <HelpCard
                                data={item}
                                onPress={() =>
                                    router.push(`/`)
                                }
                            />
                        )}
                    />
                )}
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    userName: {
        fontSize: 18,
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
        fontSize: 24,
    },
    actionRow: {
        flexDirection: "row",
        gap: 12,
        marginHorizontal: 16,
    },
    actionButton: {
        flex: 1,
        height: 96,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderWidth: 1,
    },
    activeWrapper: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    emptyActiveCard: {
        height: 100,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        gap: 4,
    },
    mapWrapper: {
        height: 220,
        marginHorizontal: 16,
        borderRadius: 16,
        overflow: "hidden",
    },
    mapSkeleton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    listWrapper: {
        flex: 1,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 16,
        marginVertical: 16,
    },
    empty: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 32,
    },
});
