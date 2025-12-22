import { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ThemedText } from "@/components/themed-text";
import { getGlobalLeaderboard } from "@/lib/api/leaderboard";
import HeaderScreen from "@/components/header-screen";

type LeaderboardUser = {
    rank: number;
    id: number;
    full_name: string;
    avatar_url: string | null;
    points: number;
};

export default function LeaderboardScreen() {
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [myRank, setMyRank] = useState<any>(null);

    const background = useThemeColor({}, "background");
    const card = useThemeColor({}, "card");

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await getGlobalLeaderboard();
            setLeaderboard(res.data.leaderboard);
            setMyRank(res.data.my_rank);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    const topThree = leaderboard.slice(0, 3);
    const others = leaderboard.slice(3);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
            {/* Header */}
            <HeaderScreen title="Leaderboard" />

            {/* Podium */}
            <View style={styles.podiumRow}>
                {renderPodium(topThree[1], 2)}
                {renderPodium(topThree[0], 1, true)}
                {renderPodium(topThree[2], 3)}
            </View>

            {/* List */}
            <FlatList
                data={others}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <ThemedText style={styles.rank}>{item.rank}</ThemedText>

                        <Image
                            source={
                                item.avatar_url
                                    ? { uri: item.avatar_url }
                                    : require("@/assets/icons/avatar-placeholder.png")
                            }
                            style={styles.avatar}
                        />

                        <ThemedText style={styles.name} numberOfLines={1}>
                            {item.full_name}
                        </ThemedText>

                        <View style={styles.pointRow}>
                            <ThemedText style={styles.points}>
                                {myRank.points}
                            </ThemedText>
                            <Image
                                source={require("@/assets/icons/unify-coin.png")}
                                style={{ width: 16, height: 16 }}
                            />
                        </View>
                    </View>
                )
                }
            />

            {/* My Rank */}
            {myRank && (
                <View style={[styles.myRankFloating, { backgroundColor: card }]}>
                    <View>
                        <ThemedText type="subtitle">
                            Peringkatmu
                        </ThemedText>
                        <ThemedText type="title">
                            #{myRank.rank}
                        </ThemedText>
                    </View>

                    <View style={styles.pointRow}>
                        <ThemedText type="title">
                            {myRank.points}
                        </ThemedText>
                        <Image
                            source={require("@/assets/icons/unify-coin.png")}
                            style={{ width: 32, height: 32 }}
                        />
                    </View>
                </View>
            )}
        </SafeAreaView >
    );
}

function renderPodium(
    user: LeaderboardUser | undefined,
    rank: number,
    highlight = false
) {
    if (!user) return <View style={{ width: 90 }} />;

    return (
        <View style={[styles.podiumItem, highlight && styles.first]}>
            <Image
                source={
                    user.avatar_url
                        ? { uri: user.avatar_url }
                        : require("@/assets/icons/avatar-placeholder.png")
                }
                style={highlight ? styles.avatarBig : styles.avatarMedium}
            />
            <ThemedText numberOfLines={1}>{user.full_name}</ThemedText>
            <View style={styles.pointRow}>
                <ThemedText style={styles.podiumPoints}>
                    {user.points}
                </ThemedText>
                <Image
                    source={require("@/assets/icons/unify-coin.png")}
                    style={{ width: 24, height: 24 }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
    },

    podiumRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end",
        marginVertical: 16,
    },

    podiumItem: {
        alignItems: "center",
        width: 90,
    },

    podiumPoints: {
        fontWeight: "600",
        fontSize: 20
    },

    first: {
        marginBottom: 16,
    },

    avatarBig: {
        width: 72,
        height: 72,
        borderRadius: 36,
        marginBottom: 8,
    },

    avatarMedium: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginBottom: 8,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    pointRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    rank: { width: 24 },

    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 12,
    },

    name: { flex: 1 },

    points: { fontWeight: "600" },

    myRankFloating: {
        position: "absolute",
        bottom: 16,
        left: 16,
        right: 16,

        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        padding: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },

        elevation: 6,
    },

});
