import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
import { router } from "expo-router";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function HeaderScreen({ title }: { title: string }) {
    const text = useThemeColor({}, "text");
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={24} color={text} />
            </TouchableOpacity>
            <ThemedText style={[styles.headerTitle, { color: text }]}>
                {title}
            </ThemedText>
            <View style={{ width: 24 }} />
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        height: 56,
        justifyContent: "space-between",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
});