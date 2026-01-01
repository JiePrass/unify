import { useEffect, useState } from "react"
import { FlatList, Image, StyleSheet, View } from "react-native"
import { useThemeColor } from "@/hooks/use-theme-color"
import { ThemedText } from "@/components/ui/themed-text"
import { ThemedView } from "@/components/ui/themed-view"
import { getUserBadges } from "@/lib/api/badge"
import { SafeAreaView } from "react-native-safe-area-context"
import HeaderScreen from "@/components/header-screen"

type Badge = {
    id: number
    name: string
    icon_url: string
    tier: string
    isObtained: boolean
    awardedAt: string | null
}

export default function BadgesScreen() {
    const [badges, setBadges] = useState<Badge[]>([])
    const [loading, setLoading] = useState(true)

    const background = useThemeColor({}, 'background');

    useEffect(() => {
        fetchBadges()
    }, [])

    const fetchBadges = async () => {
        try {
            const res = await getUserBadges()

            const sortedBadges = res.data.sort((a: Badge, b: Badge) => {
                if (a.isObtained === b.isObtained) return 0
                return a.isObtained ? -1 : 1
            })

            setBadges(sortedBadges)
        } catch (e) {
            console.log(e)
        } finally {
            setLoading(false)
        }
    }


    if (loading) {
        return (
            <ThemedView style={styles.center}>
                <ThemedText>Loading...</ThemedText>
            </ThemedView>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
            <HeaderScreen title="Lencana" />

            <FlatList
                data={badges}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                columnWrapperStyle={styles.row}
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.badgeCard,
                            !item.isObtained && styles.lockedBadge,
                        ]}
                    >
                        <Image source={{ uri: item.icon_url }} style={styles.icon} />

                        <ThemedText style={styles.name} numberOfLines={1}>
                            {item.name}
                        </ThemedText>

                        <ThemedText style={styles.tier}>
                            {item.tier}
                        </ThemedText>
                    </View>
                )}
            />
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 20
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    row: {
        justifyContent: "space-between",
        marginBottom: 16,
    },
    badgeCard: {
        width: "30%",
        alignItems: "center",
    },
    lockedBadge: {
        opacity: 0.35,
    },
    icon: {
        width: 72,
        height: 72,
        borderRadius: 16,
        marginBottom: 8,
    },
    name: {
        fontSize: 12,
        fontWeight: "600",
        textAlign: "center",
    },
    tier: {
        fontSize: 10,
        opacity: 0.6,
        textAlign: "center",
    },
})
