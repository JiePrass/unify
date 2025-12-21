import { View, StyleSheet, useColorScheme } from "react-native";
import { ThemedText } from "@/components/themed-text";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";

type MissionCardProps = {
    title: string;
    description: string;
    category: string;
    progress: number;
    target: number;
    rewardPoints: number;
    hasBadge: boolean;
};

const getCategoryIcon = (category: string) => {
    switch (category) {
        case "GENERAL":
            return "hand-left-outline";
        case "EMERGENCY":
            return "alert-circle-outline";
        default:
            return "flag-outline";
    }
};

export function MissionCard({
    title,
    description,
    category,
    progress,
    target,
    rewardPoints,
    hasBadge,
}: MissionCardProps) {
    const scheme = useColorScheme() ?? "light";
    const theme = Colors[scheme];

    const progressPercent = Math.min(progress / target, 1);

    return (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
            {/* Left Icon (centered) */}
            <View style={styles.iconWrapper}>
                <View
                    style={[
                        styles.iconBox,
                        { backgroundColor: theme.primary },
                    ]}
                >
                    <Ionicons
                        name={getCategoryIcon(category)}
                        size={28}
                        color={theme.buttonTextPrimary}
                    />
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <ThemedText type="defaultSemiBold">{title}</ThemedText>

                <ThemedText style={{ color: theme.subText }}>
                    {description}
                </ThemedText>

                {/* Meta */}
                <View style={styles.metaRow}>

                    <View style={styles.metaItems}>
                        <View style={styles.metaItem}>
                            <Image
                                source={require("@/assets/icons/unify-coin.png")}
                                style={styles.coinIcon}
                            />
                            <ThemedText>{rewardPoints} Poin</ThemedText>
                        </View>

                        {hasBadge && (
                            <View style={styles.metaItem}>
                                <Ionicons
                                    name="ribbon"
                                    size={14}
                                    color={theme.tint}
                                />
                                <ThemedText>Lencana</ThemedText>
                            </View>
                        )}
                    </View>

                    <ThemedText>
                        {progress}/{target}
                    </ThemedText>
                </View>

                <View
                    style={[
                        styles.progressTrack,
                        { backgroundColor: theme.border },
                    ]}
                >
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${progressPercent * 100}%`,
                                backgroundColor: theme.success,
                            },
                        ]}
                    />
                </View>
            </View>
        </View>
    );
}

const ICON_SIZE = 56;

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        padding: 14,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: "center",
    },

    /* Icon */
    iconWrapper: {
        height: ICON_SIZE,
        justifyContent: "center",
        marginRight: 12,
    },
    iconBox: {
        width: ICON_SIZE,
        height: ICON_SIZE,
        borderRadius: ICON_SIZE / 2,
        alignItems: "center",
        justifyContent: "center",
    },

    /* Content */
    content: {
        flex: 1,
    },

    metaRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 6,
        justifyContent: "space-between",
    },
    metaItems: {
        flexDirection: "row",
        gap: 12,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    coinIcon: {
        width: 16,
        height: 16,
    },

    /* Progress */
    progressTrack: {
        height: 6,
        borderRadius: 6,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 6,
    },
});
