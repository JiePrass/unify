import { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { HelpCard } from "@/components/cards/help-card";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "@/contexts/location-context";
import {
    getMyActiveHelp,
    getNearbyHelpRequests,
} from "@/lib/api/help";
import { NearbyHelpState } from "@/components/nearby-help-state";

export const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
        case "fisik":
            return "body";
        case "medis":
            return "medkit";
        case "logistik":
            return "cube";
        case "transportasi":
            return "car";
        case "keamanan":
            return "shield-checkmark";
        default:
            return "help-circle";
    }
};



export default function HelpScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const { location, loading: locationLoading, refreshLocation } = useLocation();

    const background = useThemeColor({}, "background");
    const card = useThemeColor({}, "card");
    const primary = useThemeColor({}, "primary");
    const subText = useThemeColor({}, "subText");
    const border = useThemeColor({}, "border");

    const [activeHelp, setActiveHelp] = useState<any>(null);
    const [nearbyHelps, setNearbyHelps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        if (!location) return;
        try {
            const [active, nearby] = await Promise.all([
                getMyActiveHelp({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    radius: 5000,
                }),
                getNearbyHelpRequests({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    radius: 5000,
                }),
            ]);

            setActiveHelp(active?.data ?? null);
            setNearbyHelps(nearby?.data ?? []);
        } catch (error) {
            console.log("Error fetching help data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (location) {
            fetchData();
        } else if (!locationLoading && !location) {
            setLoading(false);
        }
    }, [location, locationLoading]);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshLocation();
        if (location) await fetchData();
        else setRefreshing(false);
    };

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: background }]}
        >
            <ScrollView
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primary]} />
                }
                showsVerticalScrollIndicator={false}
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
                                router.push({
                                    pathname: "/help/[id]",
                                    params: { id: activeHelp.help.id },
                                })
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
                                anchor={{ x: 0.5, y: 0.5 }}
                            >
                                <View style={styles.userMarkerOutline}>
                                    <View style={styles.userMarkerInner} />
                                </View>
                            </Marker>

                            {/* HELP MARKERS */}
                            {nearbyHelps.map((help) => (
                                <Marker
                                    key={help.id}
                                    coordinate={{
                                        latitude: help.latitude,
                                        longitude: help.longitude,
                                    }}
                                    onPress={() => router.push(`/help/${help.id}`)}
                                >
                                    <View style={styles.customMarker}>
                                        <View style={[styles.markerBubble, { backgroundColor: primary }]}>
                                            <Ionicons
                                                name={getCategoryIcon(help.category) as any}
                                                size={20}
                                                color="#fff"
                                            />
                                        </View>
                                    </View>
                                </Marker>
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
                        <View style={{ gap: 12, paddingVertical: 12 }}>
                            {nearbyHelps.map((item) => (
                                <HelpCard
                                    key={item.id}
                                    data={item}
                                    onPress={() =>
                                        router.push({
                                            pathname: "/help/[id]",
                                            params: { id: item.id },
                                        })
                                    }
                                />
                            ))}
                        </View>
                    )}
                </ThemedView>
            </ScrollView>
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
    userMarkerOutline: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(37, 99, 235, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#fff',
    },
    userMarkerInner: {
        width: 16,
        height: 16,
        borderRadius: 28,
        backgroundColor: '#2563EB',
        borderWidth: 2,
        borderColor: '#fff',
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
        borderRadius: 20,
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
