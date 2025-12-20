import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, useColorScheme, View, StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
import { Colors } from "@/constants/theme";

export default function QuickAction({
    icon,
    label,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
}) {
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];

    return (
        <View style={{ flex: 1, alignItems: 'center' }}>
            <TouchableOpacity
                style={[
                    stylesStatic.quickActionCircle,
                    { backgroundColor: colors.card, borderColor: colors.border },
                ]}
            >
                <Ionicons name={icon} size={22} color={colors.icon} />
            </TouchableOpacity>
            <ThemedText
                style={{
                    marginTop: 6,
                    fontSize: 12,
                    textAlign: 'center',
                    color: colors.subText,
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