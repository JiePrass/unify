import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/auth-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { getCurrentUser, loginUser } from "@/lib/api/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";


export default function LoginPage() {
    const textColor = useThemeColor({}, "text");
    const primaryColor = useThemeColor({}, "primary");
    const borderColor = useThemeColor({}, "border");
    const inputBackgroundColor = useThemeColor({}, "inputBackground");
    const iconColor = useThemeColor({}, "icon");
    const placeholderColor = useThemeColor({}, "placeholder");

    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");


    const handleLogin = async () => {
        if (!email || !password) {
            setErrorMessage("Isi semua field.");
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");

            const res = await loginUser({ email, password });

            await login(res.token);

            const me = await getCurrentUser();
            await login(res.token, me);

            router.replace("/(tabs)");
        } catch (error: any) {
            const message =
                error?.response?.data?.error ||
                error?.message ||
                "Terjadi kesalahan.";

            if (error?.response?.status === 401) {
                setErrorMessage("Email atau password salah.");
                return;
            }

            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.headerBlock}>
                <ThemedText type="title" style={styles.centerText}>
                    Selamat Datang Kembali di Unify!
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                    Masuk untuk melanjutkan membantu dan meminta bantuan masyarakat.
                </ThemedText>
            </View>

            {/* EMAIL */}
            <View
                style={[
                    styles.inputWrapper,
                    { backgroundColor: inputBackgroundColor, borderColor: borderColor },
                ]}
            >
                <ThemedTextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    placeholderTextColor={placeholderColor}
                    style={[styles.inputField, { color: textColor }]}
                />
            </View>

            {/* PASSWORD */}
            <View
                style={[
                    styles.inputWrapper,
                    { backgroundColor: inputBackgroundColor, borderColor: borderColor },
                ]}
            >
                <ThemedTextInput
                    placeholder="Kata Sandi"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={placeholderColor}
                    style={[styles.inputField, { color: textColor }]}
                />

                <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                >
                    <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={22}
                        color={iconColor}
                    />
                </TouchableOpacity>
            </View>

            {/* ERROR MESSAGE */}
            {errorMessage !== "" && (
                <ThemedText
                    style={{
                        color: "red",
                        marginTop: -16,
                        marginBottom: -16,
                        marginLeft: 4,
                        fontSize: 14,
                    }}
                >
                    {errorMessage}
                </ThemedText>
            )}


            {/* LOGIN BUTTON */}
            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor: primaryColor },
                    loading && { opacity: 0.6 },
                ]}
                onPress={handleLogin}
                disabled={loading}
            >
                <ThemedText style={[styles.buttonText, { color: textColor }]}>
                    {loading ? "Memproses..." : "Login"}
                </ThemedText>
            </TouchableOpacity>

            <Link href="/register" style={styles.link}>
                <ThemedText>Belum Punya Akun?</ThemedText> Daftar
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
        textAlign: "center",
    },

    orWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginVertical: 6,
    },

    line: {
        flex: 1,
        height: 1,
    },

    orText: {
        fontSize: 13,
    },

    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        paddingVertical: 14,
        borderRadius: 12,
        width: "100%",
    },

    googleIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },

    googleText: {
        fontWeight: "600",
        textAlign: "center",
    },

    link: {
        textAlign: "center",
        marginTop: 14,
        color: "#3498DB",
    },
});