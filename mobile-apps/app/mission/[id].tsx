import {
    View,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    FlatList,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import HeaderScreen from "@/components/header-screen";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Image } from "expo-image";
import { getMissionById, getUserMissions } from "@/lib/api/mission";
import { MissionCard } from "@/components/cards/mission-card";

const getMissionIconByCode = (code?: string) => {
    switch (code) {
        case "HELP_TAKEN":
            return "hand-left-outline";

        case "HELP_COMPLETED":
            return "checkmark-done-outline";

        case "HELP_REQUEST":
            return "help-circle-outline";

        case "LOGIN_STREAK":
            return "flame-outline";

        case "PROFILE_COMPLETED":
            return "person-circle-outline";

        default:
            return "ribbon-outline";
    }
};

export default function MissionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const missionId = Number(id);

    const background = useThemeColor({}, "background");
    const card = useThemeColor({}, "card");
    const tint = useThemeColor({}, "tint");
    const border = useThemeColor({}, "border");
    const subText = useThemeColor({}, "subText");

    const [detail, setDetail] = useState<any>(null);
    const [missions, setMissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!missionId) return;

        getMissionById(missionId)
            .then((res) => setDetail(res.data))
            .finally(() => setLoading(false));

        getUserMissions().then((res) => {
            setMissions(
                res.filter((m: any) => m.mission.id !== missionId)
            );
        });
    }, [missionId]);

    if (loading || !detail) {
        return (
            <SafeAreaView style={[styles.center, { backgroundColor: background }]}>
                <ActivityIndicator />
            </SafeAreaView>
        );
    }

    const progressPercent = Math.min(
        detail.progress_value / detail.mission.target_value,
        1
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: background }}>
            <HeaderScreen title="Detail Misi" />

            <ScrollView contentContainerStyle={styles.container}>
                {/* ===== HEADER CARD ===== */}
                <ThemedView style={[styles.headerCard, { backgroundColor: card }]}>
                    <View style={[styles.iconCircle, { borderColor: tint }]}>
                        <Ionicons
                            name={getMissionIconByCode(detail.mission.code)}
                            size={28}
                            color={tint}
                        />
                    </View>

                    <ThemedText type="title">
                        {detail.mission.title}
                    </ThemedText>

                    {/* Meta Info */}
                    <View style={styles.metaRow}>
                        <ThemedText style={[styles.metaText, { color: subText }]}>
                            {detail.mission.category} • {detail.mission.reward_points}
                        </ThemedText>
                        <Image
                            source={require("@/assets/icons/unify-coin.png")}
                            style={styles.coinIcon}
                        />
                    </View>

                    {/* Progress */}
                    <View style={styles.progressRow}>
                        <ThemedText style={{ color: subText }}>
                            Progress Saat Ini
                        </ThemedText>
                        <ThemedText>
                            {Math.round(progressPercent * 100)}%
                        </ThemedText>
                    </View>

                    <View style={[styles.progressTrack, { backgroundColor: border }]}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${progressPercent * 100}%`,
                                    backgroundColor: tint,
                                },
                            ]}
                        />
                    </View>
                </ThemedView>

                {/* ===== INFORMASI MISI ===== */}
                <ThemedView style={[styles.infoCard, { backgroundColor: card }]}>
                    <ThemedText type="defaultSemiBold">
                        Informasi Misi
                    </ThemedText>
                    <ThemedText style={{ color: subText }}>
                        {detail.mission.description}
                    </ThemedText>
                </ThemedView>

                {/* ===== REWARD ===== */}
                {detail.mission.rewardBadge && (
                    <ThemedView style={[styles.infoCard, { backgroundColor: card }]}>
                        <ThemedText type="defaultSemiBold">
                            Reward
                        </ThemedText>

                        {/* Badge Preview */}
                        <View style={styles.badgeRow}>
                            <Image
                                source={{ uri: detail.mission.rewardBadge.icon_url }}
                                style={styles.badgeIcon}
                                contentFit="cover"
                            />
                            <View>
                                <ThemedText type="defaultSemiBold">
                                    {detail.mission.rewardBadge.name}
                                </ThemedText>
                                <ThemedText style={{ color: subText }}>
                                    {detail.mission.rewardBadge.tier}
                                </ThemedText>
                            </View>
                        </View>
                    </ThemedView>
                )}

                {/* ===== MISI LAINNYA ===== */}
                <ThemedText type="defaultSemiBold">
                    Misi Lainnya
                </ThemedText>

                <FlatList
                    data={missions}
                    keyExtractor={(item) => String(item.id)}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <MissionCard
                            id={item.mission.id}
                            title={item.mission.title}
                            description={item.mission.description}
                            code={item.mission.code}
                            progress={item.progress_value}
                            target={item.mission.target_value}
                            rewardPoints={item.mission.reward_points}
                            hasBadge={!!item.mission.reward_badge_id}
                        />
                    )}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 16,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    headerCard: {
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        gap: 8,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },

    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },

    metaText: {
        fontSize: 13,
    },

    coinIcon: {
        width: 12,
        height: 12
    },

    rewardRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 4,
    },

    badgeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginTop: 8,
    },

    badgeIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },

    progressRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 12,
    },
    progressTrack: {
        height: 6,
        width: "100%",
        borderRadius: 6,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 6,
    },

    infoCard: {
        borderRadius: 16,
        padding: 16,
        gap: 8,
    },
});
