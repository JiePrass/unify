import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import HeaderScreen from "@/components/header-screen";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { getHelpHistory } from "@/lib/api/help";
import { HelpCard } from "@/components/cards/help-card";
import { Image } from "expo-image";

export default function HistoryHelpScreen() {
    const router = useRouter();
    const background = useThemeColor({}, "background");
    const subText = useThemeColor({}, "subText");
    const primary = useThemeColor({}, "primary");
    const card = useThemeColor({}, "card");
    const border = useThemeColor({}, "border");

    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await getHelpHistory();
            setHistory(res?.data ?? []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    const renderItem = ({ item }: { item: any }) => {
        return (
            <HelpCard
                data={item}
                onPress={() => router.push(`/help/${item.id}`)}
                showStatusBadge
            />
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={64} color={subText} />
            <ThemedText style={{ color: subText, marginTop: 12 }}>
                Belum ada riwayat bantuan
            </ThemedText>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
            <HeaderScreen title="Riwayat Bantuan" />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={primary} />
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.assignment_id ? `assign-${item.assignment_id}` : `req-${item.id}`}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        gap: 12,
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 60,
    },
});
