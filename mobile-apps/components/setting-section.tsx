import { View, StyleSheet } from "react-native";
import { ReactNode } from "react";
import { ThemedText } from "@/components/themed-text";

interface Props {
    title: string;
    children: ReactNode;
}

export function SettingsSection({ title, children }: Props) {
    return (
        <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.title}>
                {title}
            </ThemedText>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    title: {
        marginBottom: 8,
        opacity: 0.7,
    },
});
