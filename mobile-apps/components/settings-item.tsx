import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ReactNode } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface Props {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress?: () => void;
    right?: ReactNode;
    danger?: boolean;
}

export function SettingsItem({
    icon,
    label,
    onPress,
    right,
    danger = false,
}: Props) {

    const text = useThemeColor({}, "text");
    const color = danger ? "#EF4444" : text;

    return (
        <TouchableOpacity style={styles.item} onPress={onPress}>
            <Ionicons name={icon} size={20} color={color} />
            <ThemedText style={[styles.label, danger && styles.danger]}>
                {label}
            </ThemedText>

            <View style={{ flex: 1 }} />

            {right ?? (
                <Ionicons name="chevron-forward" size={18} color={color} />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    item: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
    },
    label: {
        marginLeft: 12,
    },
    danger: {
        color: "#EF4444",
    },
});
