import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  View,
  Image,
  FlatList,
  RefreshControl
} from "react-native";
import { router } from "expo-router";
import { useThemeColor } from "@/hooks/use-theme-color";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/contexts/auth-context";
import { MissionCard } from "@/components/cards/mission-card";
import { getUserMissions } from "@/lib/api/mission";

export default function MissionScreen() {
  const { user, loading } = useAuth();

  const primary = useThemeColor({}, 'primary');
  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');

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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]}>
      <ThemedView style={styles.container}>
        <FlatList
          data={missions}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primary]} />
          }
          ListHeaderComponent={
            <>
              {/* Header */}
              <ThemedView style={styles.header}>
                {/* Left: Point */}
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
                    resizeMode="cover"
                  />
                </Pressable>
              </ThemedView>

              {/* Action Buttons */}
              <ThemedView style={styles.actionRow}>
                <Pressable
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: card,
                      borderColor: border,
                    },
                  ]}
                  onPress={() => router.push("/")}
                >
                  <Ionicons
                    name="ribbon"
                    size={32}
                    color={primary}
                  />
                  <ThemedText type="defaultSemiBold">Lencana</ThemedText>
                </Pressable>

                <Pressable
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: card,
                      borderColor: border,
                    },
                  ]}
                  onPress={() => router.push("/leaderboard")}
                >
                  <Ionicons
                    name="trophy"
                    size={32}
                    color={primary}
                  />
                  <ThemedText type="defaultSemiBold">
                    Papan Peringkat
                  </ThemedText>
                </Pressable>
              </ThemedView>

              <ThemedText type="defaultSemiBold" style={{ marginBottom: 12 }}>Daftar Misi</ThemedText>
            </>
          }
          renderItem={({ item }) => (
            <MissionCard
              title={item.mission.title}
              description={item.mission.description}
              category={item.mission.category}
              progress={item.progress_value}
              target={item.mission.target_value}
              rewardPoints={item.mission.reward_points}
              hasBadge={!!item.mission.reward_badge_id}
            />
          )}
          ListEmptyComponent={
            loadingMissions ? <ActivityIndicator style={{ marginTop: 20 }} /> : null
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    marginBottom: 20,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  coinIcon: {
    width: 50,
    height: 50,
  },
  avatarWrapper: {
    width: 54,
    height: 54,
    borderRadius: 28,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },

  /* Action Buttons */
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

  /* Mission */
  missionContainer: {
    paddingBottom: 20
  },
});
