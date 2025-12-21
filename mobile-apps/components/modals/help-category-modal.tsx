import {
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
    Pressable,
    Animated,
    Easing,
    Dimensions,
} from "react-native";
import { useEffect, useRef } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeColor } from "@/hooks/use-theme-color";

const SCREEN_HEIGHT = Dimensions.get("window").height;

const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
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

export default function HelpCategoryModal({
    visible,
    categories,
    onSelect,
    onClose,
}: {
    visible: boolean;
    categories: { key: string; label: string }[];
    onSelect: (value: string) => void;
    onClose: () => void;
}) {
    const card = useThemeColor({}, "card");
    const text = useThemeColor({}, "text");
    const border = useThemeColor({}, "border");

    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(sheetTranslateY, {
                    toValue: 0,
                    duration: 260,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(sheetTranslateY, {
                    toValue: SCREEN_HEIGHT,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [overlayOpacity, sheetTranslateY, visible]);

    if (!visible) return null;

    return (
        <Modal visible transparent animationType="none">
            {/* FADE OVERLAY */}
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
                <Animated.View
                    style={[
                        styles.overlay,
                        { opacity: overlayOpacity },
                    ]}
                />
            </Pressable>

            {/* BOTTOM SHEET */}
            <Animated.View
                style={[
                    styles.sheet,
                    {
                        backgroundColor: card,
                        transform: [{ translateY: sheetTranslateY }],
                    },
                ]}
            >
                <FlatList
                    data={categories}
                    keyExtractor={(item) => item.key}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.item, { borderBottomColor: border }]}
                            onPress={() => {
                                onSelect(item.key);
                                onClose();
                            }}
                        >
                            <Ionicons
                                name={getCategoryIcon(item.key)}
                                size={20}
                                color={text}
                                style={{ marginRight: 12 }}
                            />
                            <Text style={{ color: text }}>{item.label}</Text>
                        </TouchableOpacity>
                    )}
                />
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    sheet: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 16,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
});
