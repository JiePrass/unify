import { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Marker } from "react-native-maps";
import { UnifiedMapView } from "@/components/unified-map-view";
import * as Location from "expo-location";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useLocation } from "@/contexts/location-context";
import HelpCategoryModal from "@/components/modals/help-category-modal";
import { createHelpRequest } from "@/lib/api/help";
import { ThemedText } from "@/components/themed-text";
import HeaderScreen from "@/components/header-screen";

type UserLocation = {
    latitude: number;
    longitude: number;
};

const CATEGORIES = [
    { key: "fisik", label: "Fisik" },
    { key: "medis", label: "Medis" },
    { key: "transportasi", label: "Transportasi" },
    { key: "logistik", label: "Logistik" },
    { key: "keamanan", label: "Keamanan" },
    { key: "lainnya", label: "Lainnya" },
];

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

export default function CreateHelpScreen() {
    const router = useRouter();

    const background = useThemeColor({}, "background");
    const card = useThemeColor({}, "card");
    const primary = useThemeColor({}, "primary");
    const subText = useThemeColor({}, "subText");
    const border = useThemeColor({}, "border");
    const text = useThemeColor({}, "text");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("fisik");
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const { location: initialLocation, loading: loadingContext } = useLocation();

    const [location, setLocation] = useState<UserLocation | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (initialLocation && !location) {
            setLocation({
                latitude: initialLocation.latitude,
                longitude: initialLocation.longitude,
            });
        }
    }, [initialLocation]);

    const isValid =
        title.trim().length > 0 &&
        description.trim().length > 0 &&
        location !== null &&
        !submitting;

    const handleSubmit = async () => {
        if (!location || submitting) return;

        setSubmitting(true);

        try {
            const payload = {
                title: title.trim(),
                description: description.trim(),
                category,
                latitude: location.latitude,
                longitude: location.longitude,
            };

            await createHelpRequest(payload);

            Alert.alert("Berhasil", "Permintaan bantuan berhasil dikirim");
            router.back();
        } catch (err: any) {
            Alert.alert(
                "Gagal",
                err?.response?.data?.message ?? "Terjadi kesalahan"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
            {/* HEADER */}
            <HeaderScreen title="Minta Bantuan" />

            {/* MAP */}
            <UnifiedMapView
                loading={loadingContext && !location}
                containerStyle={styles.mapWrapper}
                style={styles.map}
                initialRegion={
                    location
                        ? {
                            ...location,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        }
                        : undefined
                }
            >
                {location && (
                    <Marker
                        coordinate={location}
                        draggable
                        onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
                    />
                )}
            </UnifiedMapView>

            {/* FORM */}
            <View style={styles.form}>
                <ThemedText style={styles.label}>
                    Judul Bantuan
                </ThemedText>
                <TextInput
                    style={[styles.input, { borderColor: border, color: text }]}
                    placeholder="Masukan judul singkat bantuan Anda"
                    placeholderTextColor={subText}
                    value={title}
                    onChangeText={setTitle}
                />

                <ThemedText style={styles.label}>
                    Deskripsi
                </ThemedText>
                <TextInput
                    style={[
                        styles.input,
                        styles.textArea,
                        { borderColor: border, color: text },
                    ]}
                    placeholder="Jelaskan kondisi dan kebutuhan Anda"
                    placeholderTextColor={subText}
                    multiline
                    value={description}
                    onChangeText={setDescription}
                />

                <ThemedText style={styles.label}>
                    Kategori
                </ThemedText>
                <TouchableOpacity
                    style={[
                        styles.categoryButton,
                        { borderColor: border, backgroundColor: card },
                    ]}
                    onPress={() => setShowCategoryModal(true)}
                >
                    <Ionicons
                        name={getCategoryIcon(category)}
                        size={20}
                        color={primary}
                        style={{ marginRight: 8 }}
                    />
                    <ThemedText style={{ color: text }}>
                        {category.toUpperCase()}
                    </ThemedText>
                </TouchableOpacity>

                {/* SUBMIT */}
                <TouchableOpacity
                    disabled={!isValid}
                    onPress={handleSubmit}
                    style={[
                        styles.submitButton,
                        { backgroundColor: isValid ? primary : border },
                    ]}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <ThemedText style={styles.submitText}>
                            Kirim Permintaan Bantuan
                        </ThemedText>
                    )}
                </TouchableOpacity>
            </View>

            <HelpCategoryModal
                visible={showCategoryModal}
                categories={CATEGORIES}
                onSelect={setCategory}
                onClose={() => setShowCategoryModal(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    mapWrapper: {
        height: 220,
        width: "100%",
    },
    map: {
        height: 220,
        width: "100%",
    },
    form: {
        padding: 16,
    },
    label: {
        marginBottom: 6,
        fontWeight: "500",
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    categoryButton: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
    },
    submitButton: {
        marginTop: 24,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
    },
    submitText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
});
