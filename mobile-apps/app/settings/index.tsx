import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { SettingsSection } from "@/components/setting-section";
import { SettingsItem } from "@/components/settings-item";
import { useAuth } from "@/contexts/auth-context";
import HeaderScreen from "@/components/header-screen";

export default function SettingsScreen() {
    const { logout, user } = useAuth();
    const router = useRouter();

    const background = useThemeColor({}, "background");

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: background }}>
            <HeaderScreen title="Pengaturan"></HeaderScreen>

            <ThemedView style={styles.container}>
                <View
                    style={styles.profileCard}
                >
                    <Image
                        source={
                            user?.avatar_url
                                ? { uri: user.avatar_url }
                                : require("@/assets/icons/avatar-placeholder.png")
                        }
                        style={styles.avatar}
                    />
                    <View style={{ flex: 1 }}>
                        <ThemedText type="subtitle">{user?.full_name || "User"}</ThemedText>
                        <ThemedText type="default">{user?.email || "example@email.com"}</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} />
                </View>

                {/* GENERAL */}
                <SettingsSection title="Pengaturan Umum">
                    <SettingsItem
                        icon="person-outline"
                        label="Informasi Pribadi"
                        onPress={() => router.push("/settings/edit-profile")}
                    />
                    <SettingsItem
                        icon="lock-closed-outline"
                        label="Keamanan"
                        onPress={() => router.push("/")}
                    />
                    <SettingsItem
                        icon="notifications-outline"
                        label="Notifikasi"
                        onPress={() => router.push("/")}
                    />
                </SettingsSection>

                <SettingsSection title="Akun">
                    <SettingsItem
                        icon="log-out-outline"
                        label="Logout"
                        danger
                        onPress={handleLogout}
                    />
                    <SettingsItem
                        icon="trash-outline"
                        label="Nonaktifkan Akun"
                        danger
                        onPress={() => router.push("/")}
                    />
                </SettingsSection>

            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },

    profileCard: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },

    section: {
        marginBottom: 24,
    },

    sectionTitle: {
        marginBottom: 8,
        opacity: 0.7,
    },

    item: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
    },

    itemText: {
        marginLeft: 12,
    },
});
