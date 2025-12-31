import { Image } from "expo-image";
import { ScrollView, View, StyleSheet, ActivityIndicator, Pressable, RefreshControl } from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

import { getUserProfile, getUserStats } from "@/lib/api/profile";
import { getHelpHistory } from "@/lib/api/help";

export default function ProfileScreen() {
    const background = useThemeColor({}, "background");
    const card = useThemeColor({}, "card");
    const icon = useThemeColor({}, "icon");

    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [profileRes, statsRes, historyRes] = await Promise.all([
                getUserProfile(),
                getUserStats(),
                getHelpHistory(),
            ]);

            setUser(profileRes);
            setStats(statsRes);
            setHistory(historyRes.data || []);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        setCurrentPage(1);
        fetchData();
    };

    if (loading && !user) {
        return (
            <View style={[styles.center, { backgroundColor: background }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView
            style={{ backgroundColor: background }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[icon]} />
            }
        >
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
                onPress={() => router.push("/settings")}
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

            {/* Help History */}
            <View style={styles.historySection}>
                <ThemedText type="subtitle" style={styles.historyTitle}>Riwayat Bantuan</ThemedText>

                {history.length === 0 ? (
                    <ThemedView style={styles.emptyCard}>
                        <Ionicons name="receipt-outline" size={48} color={icon} style={{ opacity: 0.5 }} />
                        <ThemedText style={styles.emptyText}>Belum ada riwayat bantuan</ThemedText>
                    </ThemedView>
                ) : (
                    <>
                        {history
                            .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                            .map((item) => (
                                <HistoryItem key={`${item.role}-${item.id}-${item.assignment_id || ''}`} item={item} cardColor={card} iconColor={icon} />
                            ))}

                        {/* Pagination Controls */}
                        {history.length > ITEMS_PER_PAGE && (
                            <View style={styles.paginationRow}>
                                <Pressable
                                    onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    style={[styles.paginationButton, { backgroundColor: card, opacity: currentPage === 1 ? 0.3 : 1 }]}
                                >
                                    <Ionicons name="chevron-back" size={20} color={icon} />
                                </Pressable>

                                <ThemedText style={styles.pageIndicator}>
                                    {currentPage} / {Math.ceil(history.length / ITEMS_PER_PAGE)}
                                </ThemedText>

                                <Pressable
                                    onPress={() => setCurrentPage(prev => Math.min(Math.ceil(history.length / ITEMS_PER_PAGE), prev + 1))}
                                    disabled={currentPage === Math.ceil(history.length / ITEMS_PER_PAGE)}
                                    style={[styles.paginationButton, { backgroundColor: card, opacity: currentPage === Math.ceil(history.length / ITEMS_PER_PAGE) ? 0.3 : 1 }]}
                                >
                                    <Ionicons name="chevron-forward" size={20} color={icon} />
                                </Pressable>
                            </View>
                        )}
                    </>
                )}
            </View>
        </ScrollView>
    );
}

function HistoryItem({ item, cardColor, iconColor }: { item: any; cardColor: string; iconColor: string }) {
    const isRequester = item.role === "REQUESTER";

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return '#10b981';
            case 'CANCELLED': return '#ef4444';
            case 'TIMEOUT': return '#f59e0b';
            case 'FAILED': return '#ef4444';
            default: return iconColor;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <ThemedView style={[styles.historyItem, { backgroundColor: cardColor }]}>
            <View style={styles.historyHeader}>
                <View style={[styles.roleBadge, { backgroundColor: isRequester ? '#3b82f620' : '#8b5cf620' }]}>
                    <ThemedText style={[styles.roleText, { color: isRequester ? '#3b82f6' : '#8b5cf6' }]}>
                        {isRequester ? 'Peminta' : 'Relawan'}
                    </ThemedText>
                </View>
                <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status}
                </ThemedText>
            </View>

            <ThemedText style={styles.historyItemTitle} numberOfLines={1}>{item.title}</ThemedText>

            <View style={styles.historyFooter}>
                <View style={styles.footerInfo}>
                    <Ionicons name="calendar-outline" size={14} color={iconColor} style={{ opacity: 0.6 }} />
                    <ThemedText style={styles.footerText}>{formatDate(item.date)}</ThemedText>
                </View>
                {item.counterpart && (
                    <View style={styles.footerInfo}>
                        <Ionicons name="person-outline" size={14} color={iconColor} style={{ opacity: 0.6 }} />
                        <ThemedText style={styles.footerText}>{item.counterpart.full_name}</ThemedText>
                    </View>
                )}
            </View>
        </ThemedView>
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
    historySection: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 120,
    },
    historyTitle: {
        marginBottom: 16,
    },
    emptyCard: {
        padding: 32,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    emptyText: {
        opacity: 0.6,
    },
    historyItem: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        gap: 8,
    },
    historyHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    roleText: {
        fontSize: 12,
        fontWeight: "600",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "700",
    },
    historyItemTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    historyFooter: {
        flexDirection: "row",
        gap: 16,
        marginTop: 4,
    },
    footerInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    footerText: {
        fontSize: 12,
        opacity: 0.6,
    },
    paginationRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
        gap: 16,
    },
    paginationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    pageIndicator: {
        fontSize: 14,
        fontWeight: "600",
    },
});
