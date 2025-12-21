import { StyleSheet, View, TouchableOpacity, useColorScheme } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";

type HelpCardProps = {
    data: {
        id: number;
        title: string;
        description: string;
        category: string;
        status: string;
        created_at: string;
    };
    onPress?: () => void;
};

export const getCategoryIcon = (category: string) => {
    switch (category) {
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

const getStatusColor = (status: string, colors: any) => {
    switch (status.toUpperCase()) {
        case "IN_PROGRESS":
            return "#F59E0B";
        case "TAKEN":
            return "#7f0ee9ff";
        case "OPEN":
            return colors.primary;
        case "COMPLETED":
            return "#22C55E";
        case "CANCELLED":
            return "#EF4444";
        default:
            return colors.subText;
    }
};

export function HelpCard({ data, onPress }: HelpCardProps & { data: any }) {
    const colorScheme = useColorScheme() ?? "light";
    const colors = Colors[colorScheme];

    const statusColor = getStatusColor(data.status, colors);

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
            <ThemedView style={[styles.card, { backgroundColor: colors.card }]}>
                {/* Icon */}
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: colors.primary + "20" },
                    ]}
                >
                    <Ionicons
                        name={getCategoryIcon(data.category)}
                        size={24}
                        color={colors.primary}
                    />
                </View>

                {/* Content */}
                <View style={styles.wrapper}>
                    <ThemedText
                        type="defaultSemiBold"
                        numberOfLines={1}
                        style={styles.title}
                    >
                        {data.title}
                    </ThemedText>

                    <ThemedText
                        type="subtitle"
                        numberOfLines={1}
                        style={styles.description}
                    >
                        {data.description}
                    </ThemedText>

                    {/* Meta */}
                    <View style={styles.meta}>
                        {/* Status */}
                        <View style={styles.metaItem}>
                            <Ionicons
                                name="ellipse"
                                size={10}
                                color={statusColor}
                            />
                            <ThemedText
                                style={[styles.statusText, { color: statusColor }]}
                            >
                                {data.status}
                            </ThemedText>
                        </View>

                        {/* Category */}
                        <ThemedText style={styles.badgeText}>
                            {data.category.toUpperCase()}
                        </ThemedText>


                        {/* Distance */}
                        <View style={styles.metaItem}>
                            <Ionicons
                                name="location-outline"
                                size={12}
                                color={colors.subText}
                            />
                            <ThemedText style={styles.metaText}>
                                {data.distance_km ?? "—"} km
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {/* Chevron */}
                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.icon}
                />
            </ThemedView>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 16,
        marginBottom: 12,
        gap: 12,
    },
    iconContainer: {
        width: 54,
        height: 54,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    wrapper: {
        flex: 1,
        gap: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: "600",
    },
    description: {
        fontSize: 12,
        opacity: 0.8,
    },
    meta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 6,
        flexWrap: "wrap",
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 28,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: "600",
        opacity: 0.8,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    metaText: {
        fontSize: 11,
        opacity: 0.7,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "600",
    },
});

