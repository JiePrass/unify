import React from "react";
import { StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import MapView, { MapViewProps } from "react-native-maps";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useThemeColor } from "@/hooks/use-theme-color";
import { ThemedText } from "@/components/themed-text";

interface UnifiedMapViewProps extends MapViewProps {
    loading?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}

export const UnifiedMapView: React.FC<UnifiedMapViewProps> = ({
    loading = false,
    containerStyle,
    style,
    children,
    ...props
}) => {
    const card = useThemeColor({}, "card");
    const subText = useThemeColor({}, "subText");

    return (
        <View style={[styles.container, { backgroundColor: card }, containerStyle]}>
            {loading ? (
                <View style={styles.skeleton}>
                    <Ionicons name="map" size={40} color={subText} />
                    <ThemedText type="subtitle">Memuat peta…</ThemedText>
                </View>
            ) : (
                <MapView style={[StyleSheet.absoluteFill, style]} {...props}>
                    {children}
                </MapView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
    },
    skeleton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: "100%",
        height: "100%",
    },
});
