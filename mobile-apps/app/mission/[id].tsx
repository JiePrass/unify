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
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

import { getMissionById, getUserMissions } from "@/lib/api/mission";
import { MissionCard } from "@/components/cards/mission-card";

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
    const [loadingMissions, setLoadingMissions] = useState(true);

    console.log(missions)

    useEffect(() => {
        if (!missionId) return;

        getMissionById(missionId)
            .then((res) => setDetail(res.data))
            .finally(() => setLoading(false));

        getUserMissions()
            .then((missions) => {
                setMissions(
                    missions.filter(
                        (m: any) => m.mission.id !== missionId
                    )
                );
            })
            .finally(() => setLoadingMissions(false));
    }, [missionId]);

    if (loading) {
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
                        <Ionicons name="book-outline" size={26} color={tint} />
                    </View>

                    <ThemedText type="title">
                        {detail.mission.title}
                    </ThemedText>

                    <ThemedText
                        style={{ color: subText, textAlign: "center" }}
                    >
                        {detail.mission.description}
                    </ThemedText>

                    <View style={styles.progressLabel}>
                        <ThemedText style={{ color: subText }}>
                            Progress Saat Ini
                        </ThemedText>
                        <ThemedText>
                            {Math.round(progressPercent * 100)}%
                        </ThemedText>
                    </View>

                    <View
                        style={[
                            styles.progressTrack,
                            { backgroundColor: border },
                        ]}
                    >
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

                {/* ===== MISI LAINNYA ===== */}
                <View style={styles.sectionHeader}>
                    <ThemedText type="defaultSemiBold">
                        Misi Lainnya
                    </ThemedText>
                </View>

                <FlatList
                    data={missions}
                    keyExtractor={(item) => String(item.id)}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <MissionCard
                            id={item.mission.id}
                            title={item.mission.title}
                            description={item.mission.description}
                            category={item.mission.category}
                            progress={item.progress_value}
                            target={item.mission.target_value}
                            rewardPoints={item.mission.reward_points}
                            hasBadge={!!item.mission.reward_badge_id}
                        />
                    )}
                    ListEmptyComponent={
                        loadingMissions ? (
                            <ActivityIndicator style={{ marginTop: 16 }} />
                        ) : null
                    }
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
        gap: 10,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },

    progressLabel: {
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

    sectionHeader: {
        marginTop: 8,
    },
});
