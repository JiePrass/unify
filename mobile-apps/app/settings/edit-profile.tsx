import { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { getUserProfile, updateUserProfile } from "@/lib/api/profile";
import HeaderScreen from "@/components/header-screen";
import { Ionicons } from "@expo/vector-icons";

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <View style={{ marginBottom: 16 }}>
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 6 }}>
                {label}
            </ThemedText>
            {children}
        </View>
    );
}

export default function EditProfileScreen() {
    const [initial, setInitial] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState<string | null>(null);

    const [dirty, setDirty] = useState(false);
    const primary = useThemeColor({}, "primary");
    const border = useThemeColor({}, "border");
    const background = useThemeColor({}, "background");
    const text = useThemeColor({}, "text");

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const res = await getUserProfile();
        const user = res;

        setInitial(user);
        setFullName(user.full_name);
        setPhone(user.phone ?? "");
        setEmail(user.email);
        setAvatar(user.avatar_url ?? null);
    };

    const pickAvatar = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
            setDirty(true);
        }
    };

    const checkDirty = (
        nextFullName = fullName,
        nextPhone = phone
    ) => {
        if (!initial) return false;

        return (
            nextFullName !== initial.full_name ||
            nextPhone !== (initial.phone ?? "") ||
            avatar !== initial.avatar_url
        );
    };

    const handleSubmit = async () => {
        if (loading) return;

        try {
            setLoading(true);

            await updateUserProfile({
                full_name: fullName,
                phone,
                avatar,
            });

            setDirty(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: background }}>
            <HeaderScreen title="Edit Profil" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <ThemedView style={styles.container}>

                    {/* Avatar */}
                    <Pressable onPress={pickAvatar} style={styles.avatarWrapper}>
                        <Image
                            source={
                                avatar
                                    ? { uri: avatar }
                                    : require("@/assets/icons/avatar-placeholder.png")
                            }
                            style={styles.avatar}
                        />

                        {/* Edit Icon */}
                        <View style={[styles.editIcon, { borderColor: border, backgroundColor: background }]}>
                            <Pressable onPress={pickAvatar} hitSlop={10}>
                                <Ionicons name="create-outline" size={20} color={text} />
                            </Pressable>
                        </View>
                    </Pressable>

                    {/* Full Name */}
                    <Field label="Nama Lengkap">
                        <TextInput
                            value={fullName}
                            onChangeText={(v) => {
                                setFullName(v);
                                setDirty(checkDirty(v, phone));
                            }}
                            style={[styles.input, { borderColor: border, color: text }]}
                        />
                    </Field>

                    {/* Email (Readonly) */}
                    <Field label="Email">
                        <TextInput
                            value={email}
                            editable={false}
                            style={[
                                styles.input,
                                styles.disabledInput,
                                { borderColor: border, color: text },
                            ]}
                        />
                    </Field>

                    {/* Phone */}
                    <Field label="Nomor Telepon">
                        <TextInput
                            value={phone}
                            keyboardType="phone-pad"
                            onChangeText={(v) => {
                                setPhone(v);
                                setDirty(checkDirty(fullName, v));
                            }}
                            style={[styles.input, { borderColor: border, color: text }]}
                        />
                    </Field>

                    {/* Submit */}
                    {dirty && (
                        <Pressable
                            onPress={handleSubmit}
                            disabled={loading}
                            style={[
                                styles.button,
                                {
                                    backgroundColor: primary,
                                    opacity: loading ? 0.6 : 1,
                                },
                            ]}
                        >
                            {loading ? (
                                <ThemedText style={styles.buttonText}>
                                    Menyimpan...
                                </ThemedText>
                            ) : (
                                <ThemedText style={styles.buttonText}>
                                    Simpan Perubahan
                                </ThemedText>
                            )}
                        </Pressable>
                    )}

                </ThemedView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    avatarWrapper: {
        alignItems: "center",
        marginBottom: 32,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
    },
    editIcon: {
        position: "absolute",
        bottom: -4,
        right: 150,
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: 28,
        borderWidth: 1,
    },
    input: {
        height: 44,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    disabledInput: {
        opacity: 0.8,
    },
    button: {
        marginTop: 24,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
    },
    buttonText: {
        color: "#FFF",
        fontWeight: "600",
    },
});
