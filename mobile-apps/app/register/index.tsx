import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { registerUser } from "@/lib/api/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, router } from "expo-router";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function RegisterPage() {
    const textColor = useThemeColor({}, "text");
    const primaryColor = useThemeColor({}, "primary");
    const borderColor = useThemeColor({}, "border");
    const inputBackgroundColor = useThemeColor({}, "inputBackground");
    const iconColor = useThemeColor({}, "icon");
    const placeholderColor = useThemeColor({}, "placeholder");
    const subTextColor = useThemeColor({}, "subText");

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [emailError, setEmailError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const updateForm = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (key === "email") setEmailError(null);
    };

    const handleRegister = async () => {
        setPasswordError(null);

        if (!form.full_name || !form.email || !form.password || !form.confirmPassword) {
            setEmailError(null);
            return;
        }

        if (form.password !== form.confirmPassword) {
            setPasswordError("Konfirmasi kata sandi tidak cocok.");
            return;
        }

        try {
            setLoading(true);

            await registerUser({
                full_name: form.full_name,
                email: form.email,
                password: form.password
            });

            router.push({
                pathname: "/verify-email",
                params: { email: form.email },
            });

        } catch (error: any) {
            const msg = error?.response?.data?.error;

            if (msg?.toLowerCase().includes("email")) {
                setEmailError("Email sudah terpakai.");
                return;
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.headerBlock}>
                <ThemedText type="title" style={[styles.centerText, { color: textColor }]}>
                    Selamat Datang Di Unify!
                </ThemedText>
                <ThemedText style={[styles.subtitle, { color: subTextColor }]}>
                    Daftar untuk membantu dan meminta bantuan masyarakat.
                </ThemedText>
            </View>

            {/* FULL NAME */}
            <View style={[styles.inputWrapper, { backgroundColor: inputBackgroundColor, borderColor }]}>
                <ThemedTextInput
                    placeholder="Nama Lengkap"
                    value={form.full_name}
                    onChangeText={(v) => updateForm("full_name", v)}
                    placeholderTextColor={placeholderColor}
                    style={[styles.inputField, { color: textColor }]}
                />
            </View>

            {/* EMAIL */}
            <View>
                <View
                    style={[
                        styles.inputWrapper,
                        { backgroundColor: inputBackgroundColor, borderColor },
                        emailError && { borderColor: "red" }
                    ]}
                >
                    <ThemedTextInput
                        placeholder="Email"
                        value={form.email}
                        onChangeText={(v) => updateForm("email", v)}
                        autoCapitalize="none"
                        placeholderTextColor={placeholderColor}
                        style={[styles.inputField, { color: textColor }]}
                    />
                </View>

                {emailError && (
                    <ThemedText style={{ color: "red", marginTop: 4, marginLeft: 4, fontSize: 13 }}>
                        {emailError}
                    </ThemedText>
                )}
            </View>

            {/* PASSWORD */}
            <View style={[
                styles.inputWrapper,
                { backgroundColor: inputBackgroundColor, borderColor }
            ]}>
                <ThemedTextInput
                    placeholder="Kata Sandi"
                    value={form.password}
                    onChangeText={(v) => updateForm("password", v)}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={placeholderColor}
                    style={[styles.inputField, { color: textColor }]}
                />
                <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                >
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color={iconColor} />
                </TouchableOpacity>
            </View>

            {/* CONFIRM PASSWORD */}
            <View>
                <View style={[
                    styles.inputWrapper,
                    { backgroundColor: inputBackgroundColor, borderColor },
                    passwordError && { borderColor: "red" }
                ]}>
                    <ThemedTextInput
                        placeholder="Konfirmasi Kata Sandi"
                        value={form.confirmPassword}
                        onChangeText={(v) => updateForm("confirmPassword", v)}
                        secureTextEntry={!showPassword}
                        placeholderTextColor={placeholderColor}
                        style={[styles.inputField, { color: textColor }]}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                    >
                        <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color={iconColor} />
                    </TouchableOpacity>
                </View>

                {passwordError && (
                    <ThemedText style={{ color: "red", marginTop: 4, marginLeft: 4, fontSize: 13 }}>
                        {passwordError}
                    </ThemedText>
                )}
            </View>

            {/* REGISTER BUTTON */}
            <TouchableOpacity
                style={[styles.button, { backgroundColor: primaryColor }, loading && { opacity: 0.6 }]}
                onPress={handleRegister}
                disabled={loading}
            >
                <ThemedText style={[styles.buttonText, { color: "#fff" }]}>
                    {loading ? "Memproses..." : "Daftar"}
                </ThemedText>
            </TouchableOpacity>

            <Link href="/login" style={styles.link}>
                <ThemedText>Sudah punya akun? </ThemedText> Masuk
            </Link>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 32,
        gap: 24,
    },
    headerBlock: {
        alignItems: "center",
        marginBottom: 12,
    },
    centerText: {
        textAlign: "center",
    },
    subtitle: {
        textAlign: "center",
        marginTop: 4,
        fontSize: 14,
        opacity: 0.7,
    },
    inputWrapper: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
        height: 52,
    },
    inputField: {
        flex: 1,
        height: "100%",
        fontSize: 16,
    },
    eyeButton: {
        paddingLeft: 8,
        paddingRight: 4,
    },
    button: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        width: "100%",
    },
    buttonText: {
        fontWeight: "600",
    },
    link: {
        textAlign: "center",
        marginTop: 14,
        color: "#3498DB",
    },
});
