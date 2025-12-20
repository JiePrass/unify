import { StyleSheet, View, ActivityIndicator, useColorScheme } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";

type Props = {
    type: "loading" | "empty";
};

export function NearbyHelpState({ type }: Props) {
    const colorScheme = useColorScheme() ?? "light";
    const colors = Colors[colorScheme];

    if (type === "loading") {
        return (
            <View style={styles.container}>
                <View
                    style={[
                        styles.iconWrapper,
                        { backgroundColor: colors.card },
                    ]}
                >
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>

                <ThemedText type="defaultSemiBold" style={styles.title}>
                    Mencari Bantuan Terdekat
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    Mohon tunggu sebentar...
                </ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.iconWrapper,
                    { backgroundColor: colors.card },
                ]}
            >
                <Ionicons
                    name="infinite-outline"
                    size={28}
                    color={colors.icon}
                />
            </View>

            <ThemedText type="defaultSemiBold" style={styles.title}>
                Belum Ada Bantuan
            </ThemedText>

            <ThemedText type="subtitle" style={styles.subtitle}>
                Saat ini belum ada bantuan di sekitarmu
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 48,
        paddingHorizontal: 24,
    },
    iconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    title: {
        textAlign: "center",
    },
    subtitle: {
        textAlign: "center",
        marginTop: 4,
        opacity: 0.8,
    },
});
