import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { resendVerifyEmail, verifyEmail } from "@/lib/api/auth";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function VerifyEmailPage() {
    const { email } = useLocalSearchParams<{ email: string }>();

    const textColor = useThemeColor({}, "text");
    const subTextColor = useThemeColor({}, "subText");
    const borderColor = useThemeColor({}, "border");
    const inputBg = useThemeColor({}, "inputBackground");
    const primaryColor = useThemeColor({}, "primary");

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputsRef = useRef<TextInput[]>([]);
    const [loading, setLoading] = useState(false);

    const [timer, setTimer] = useState(120); // 2 menit

    // Timer countdown
    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (value: string, index: number) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputsRef.current[index + 1].focus();
        }
    };

    const handleBackspace = (value: string, index: number) => {
        if (!value && index > 0) {
            inputsRef.current[index - 1].focus();
        }
    };

    const handleVerify = async () => {
        const finalOtp = otp.join("");

        if (finalOtp.length !== 6) {
            Alert.alert("Peringatan", "Masukkan 6 digit kode OTP.");
            return;
        }

        try {
            setLoading(true);
            const res = await verifyEmail({ email, otp: finalOtp });

            Alert.alert("Berhasil", res.message);

            router.replace({
                pathname: "/login",
            });

        } catch (err: any) {
            Alert.alert("Gagal", err.response?.data?.error || "OTP tidak valid.");
        } finally {
            setLoading(false);
        }
    };


    const handleResend = async () => {
        try {
            const res = await resendVerifyEmail(email);
            Alert.alert("Terkirim", res.message);
            setTimer(120); // reset timer
        } catch (err: any) {
            Alert.alert("Gagal", err.response?.data?.error || "Tidak dapat mengirim ulang.");
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={{ textAlign: "center", color: textColor }}>
                Verifikasi Email
            </ThemedText>

            <ThemedText style={{ textAlign: "center", color: subTextColor }}>
                Kode OTP telah dikirim ke {email}
            </ThemedText>

            {/* OTP BOXES */}
            <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(r) => {
                            inputsRef.current[index] = r!;
                        }}
                        value={digit}
                        onChangeText={(v) => handleChange(v, index)}
                        onKeyPress={({ nativeEvent }) =>
                            nativeEvent.key === "Backspace" &&
                            handleBackspace(digit, index)
                        }
                        maxLength={1}
                        keyboardType="numeric"
                        style={[
                            styles.otpBox,
                            {
                                borderColor: borderColor,
                                backgroundColor: inputBg,
                                color: textColor,
                            },
                        ]}
                    />
                ))}
            </View>

            {/* VERIFY BUTTON */}
            <TouchableOpacity
                style={[styles.button, { backgroundColor: primaryColor }]}
                onPress={handleVerify}
                disabled={loading}
            >
                <ThemedText style={styles.buttonText}>
                    {loading ? "Memproses..." : "Verifikasi"}
                </ThemedText>
            </TouchableOpacity>

            {/* RESEND OTP */}
            <View style={{ marginTop: 12, alignItems: "center" }}>
                {timer > 0 ? (
                    <ThemedText style={{ color: subTextColor }}>
                        Kirim ulang dalam {Math.floor(timer / 60)}:
                        {String(timer % 60).padStart(2, "0")}
                    </ThemedText>
                ) : (
                    <TouchableOpacity onPress={handleResend}>
                        <ThemedText style={[styles.resendText]}>
                            Kirim Ulang Kode
                        </ThemedText>
                    </TouchableOpacity>
                )}
            </View>
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
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    otpBox: {
        width: 48,
        height: 56,
        borderWidth: 1.5,
        borderRadius: 12,
        fontSize: 20,
        textAlign: "center",
    },
    button: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    resendText: {
        fontWeight: "600",
        fontSize: 15,
        textDecorationLine: "underline",
        color: "#3498DB",
    },
});