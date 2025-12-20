import { Image } from "expo-image";
import { ScrollView, View, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

import { getUserProfile, getUserStats } from "@/lib/api/profile";

export default function ProfileScreen() {
    const background = useThemeColor({}, "background");
    const card = useThemeColor({}, "card");
    const icon = useThemeColor({}, "icon");

    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, statsRes] = await Promise.all([
                    getUserProfile(),
                    getUserStats(),
                ]);

                setUser(profileRes);
                setStats(statsRes);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: background }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView style={{ backgroundColor: background }}>
            {/* Header */}
            <View style={styles.header}>
                <Image
                    source={
                        user?.avatar_url
                            ? { uri: user.avatar_url }
                            : require("@/assets/icons/avatar-placeholder.png")
                    }
                    style={styles.cover}
                />

                {/* Avatar */}
                <View style={styles.avatarWrapper}>
                    <Image
                        source={
                            user?.avatar_url
                                ? { uri: user.avatar_url }
                                : require("@/assets/icons/avatar-placeholder.png")
                        }
                        style={styles.avatar}
                    />
                </View>
            </View>

            {/* Settings Button */}
            <Pressable
                onPress={() => router.push("/")}
                style={[styles.settingsButton, { backgroundColor: card }]}
                hitSlop={10}
            >
                <Ionicons name="settings-outline" size={22} style={{ color: icon }} />
            </Pressable>

            {/* Info */}
            <ThemedView style={styles.infoCard}>

                <ThemedText type="title">{user.full_name}</ThemedText>

                <View style={styles.subRow}>
                    <ThemedText type="subtitle" style={styles.textSub}>{user.email}</ThemedText>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <StatItem label="Bantuan Diminta" value={stats.help_created} />
                    <StatItem label="Bantuan Selesai" value={stats.help_completed} />
                    <StatItem label="Bantuan Diberikan" value={stats.help_helped} />
                </View>
            </ThemedView>
        </ScrollView>
    );
}

function StatItem({ label, value }: { label: string; value: number }) {
    return (
        <View style={styles.statItem}>
            <ThemedText style={styles.statsValue}>{value}</ThemedText>
            <ThemedText style={styles.statsLabel}>{label}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        height: 200,
    },
    cover: {
        width: "100%",
        height: "100%",
    },
    avatarWrapper: {
        position: "absolute",
        bottom: -50,
        alignSelf: "center",
        padding: 4,
        borderRadius: 60,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    settingsButton: {
        position: "absolute",
        right: 24,
        top: 210,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    infoCard: {
        marginTop: 60,
        marginHorizontal: 16,
        borderRadius: 20,
        padding: 16,
        alignItems: "center",
    },
    subRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 4,
    },
    textSub: {
        fontSize: 14,
        opacity: 0.8,
    },
    statsRow: {
        flexDirection: "row",
        marginTop: 32,
        width: "100%",
    },
    statItem: {
        flex: 1,
        alignItems: "center",
        gap: 6,
    },
    statsValue: {
        fontSize: 20,
        fontWeight: "600",
    },
    statsLabel: {
        fontSize: 14,
        opacity: 0.8,
    },
});
