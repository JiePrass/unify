import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function QuickAction({
    icon,
    label,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
}) {
    const primary = useThemeColor({}, "primary");
    const border = useThemeColor({}, "border");
    const card = useThemeColor({}, "card");
    const subText = useThemeColor({}, "subText");

    return (
        <View style={{ flex: 1, alignItems: 'center' }}>
            <TouchableOpacity
                style={[
                    stylesStatic.quickActionCircle,
                    { backgroundColor: card, borderColor: border },
                ]}
            >
                <Ionicons name={icon} size={22} color={primary} />
            </TouchableOpacity>
            <ThemedText
                style={{
                    marginTop: 6,
                    fontSize: 12,
                    textAlign: 'center',
                    color: subText,
                }}
                numberOfLines={2}
            >
                {label}
            </ThemedText>
        </View>
    );
}

const stylesStatic = StyleSheet.create({
    quickActionCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
});