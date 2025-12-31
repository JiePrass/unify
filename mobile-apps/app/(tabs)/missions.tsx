import { MissionCard } from "@/components/cards/mission-card";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { useAuth } from "@/contexts/auth-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { getUserMissions } from "@/lib/api/mission";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MissionScreen() {
  const { user } = useAuth();

  const primary = useThemeColor({}, "primary");
  const background = useThemeColor({}, "background");
  const card = useThemeColor({}, "card");
  const border = useThemeColor({}, "border");

  const [missions, setMissions] = useState<any[]>([]);
  const [loadingMissions, setLoadingMissions] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMissions = async () => {
    try {
      setLoadingMissions(true);
      const data = await getUserMissions();
      setMissions(data);
    } finally {
      setLoadingMissions(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMissions();
  };

  /* ===============================
     KLASIFIKASI MISI
  =============================== */
  const {
    completedMissions,
    inProgressMissions,
    availableMissions,
  } = useMemo(() => {
    const completed: any[] = [];
    const inProgress: any[] = [];
    const available: any[] = [];

    missions.forEach((item) => {
      const progress = item.progress_value;
      const target = item.mission.target_value;

      if (progress >= target) {
        completed.push(item);
      } else if (progress > 0) {
        inProgress.push(item);
      } else {
        available.push(item);
      }
    });

    return {
      completedMissions: completed,
      inProgressMissions: inProgress,
      availableMissions: available,
    };
  }, [missions]);

  /* ===============================
     RENDER SECTION
  =============================== */
  const renderMissionSection = (title: string, data: any[]) => {
    if (data.length === 0) return null;

    return (
      <View style={{ marginBottom: 24 }}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          {title}
        </ThemedText>

        {data.map((item) => (
          <MissionCard
            key={item.id}
            id={item.mission.id}
            title={item.mission.title}
            description={item.mission.description}
            code={item.mission.code}
            progress={item.progress_value}
            target={item.mission.target_value}
            rewardPoints={item.mission.reward_points}
            hasBadge={!!item.mission.reward_badge_id}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]}>
      <ThemedView style={styles.container}>
        <FlatList
          data={[1]} // dummy, karena isi pakai ListHeaderComponent
          keyExtractor={() => "mission-root"}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[primary]}
            />
          }
          renderItem={null}
          ListHeaderComponent={
            <>
              {/* HEADER */}
              <ThemedView style={styles.header}>
                <View style={styles.pointRow}>
                  <Image
                    source={require("@/assets/icons/unify-coin.png")}
                    style={styles.coinIcon}
                    resizeMode="contain"
                  />
                  <View>
                    <ThemedText type="subtitle">Total Poin</ThemedText>
                    <ThemedText type="title">
                      {user?.points ?? 0}
                    </ThemedText>
                  </View>
                </View>

                <Pressable
                  onPress={() => router.push("/profile")}
                  style={styles.avatarWrapper}
                >
                  <Image
                    source={
                      user?.avatar_url
                        ? { uri: user.avatar_url }
                        : require("@/assets/icons/avatar-placeholder.png")
                    }
                    style={styles.avatarImage}
                  />
                </Pressable>
              </ThemedView>

              {/* ACTION BUTTON */}
              <ThemedView style={styles.actionRow}>
                <Pressable
                  style={[
                    styles.actionButton,
                    { backgroundColor: card, borderColor: border },
                  ]}
                  onPress={() => router.push("/badges")}
                >
                  <Ionicons name="ribbon" size={32} color={primary} />
                  <ThemedText type="defaultSemiBold">Lencana</ThemedText>
                </Pressable>

                <Pressable
                  style={[
                    styles.actionButton,
                    { backgroundColor: card, borderColor: border },
                  ]}
                  onPress={() => router.push("/leaderboard")}
                >
                  <Ionicons name="trophy" size={32} color={primary} />
                  <ThemedText type="defaultSemiBold">
                    Papan Peringkat
                  </ThemedText>
                </Pressable>
              </ThemedView>

              {/* MISI */}
              {loadingMissions ? (
                <ActivityIndicator style={{ marginTop: 20 }} />
              ) : (
                <>
                  {renderMissionSection(
                    "Misi Sedang Berjalan",
                    inProgressMissions
                  )}

                  {renderMissionSection(
                    "Misi Tersedia",
                    availableMissions
                  )}

                  {renderMissionSection(
                    "Misi Selesai",
                    completedMissions
                  )}
                </>
              )}
            </>
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}

/* ===============================
  STYLES
=============================== */
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 16 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  coinIcon: { width: 50, height: 50 },

  avatarWrapper: {
    width: 54,
    height: 54,
    borderRadius: 28,
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    height: 96,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },

  sectionTitle: {
    marginBottom: 12,
  },
});
