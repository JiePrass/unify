import { useMemo, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocation } from '@/contexts/location-context';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { getNearbyHelpRequests } from '@/lib/api/help';
import { HelpCard } from '@/components/cards/help-card';
import { NearbyHelpState } from "@/components/nearby-help-state";
import QuickAction from '@/components/quick-action-button';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { user, loading } = useAuth();
  const { location, loading: locationLoading, refreshLocation } = useLocation();

  const [nearbyHelps, setNearbyHelps] = useState<any[]>([]);
  const [loadingHelp, setLoadingHelp] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  }, []);

  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const icon = useThemeColor({}, 'icon');

  const fetchNearbyHelp = async () => {
    if (!location) return;
    try {
      setLoadingHelp(true);
      const { latitude, longitude } = location;

      const res = await getNearbyHelpRequests({
        latitude,
        longitude,
        radius: 5000,
      });

      setNearbyHelps(res.data ?? []);
    } catch (error) {
      console.error('Failed fetch nearby help:', error);
    } finally {
      setLoadingHelp(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (location) {
      fetchNearbyHelp();
    } else if (!locationLoading && !location) {
      setLoadingHelp(false);
    }
  }, [location, locationLoading]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshLocation();
    if (location) await fetchNearbyHelp();
    else setRefreshing(false);
  };

  if (loading) return null; // Auth loading

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ================= Header ================= */}
        <ThemedView style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={
                user?.avatar_url
                  ? { uri: user.avatar_url }
                  : require('@/assets/icons/avatar-placeholder.png')
              }
              style={styles.avatar}
            />

            <View>
              <ThemedText type="defaultSemiBold">
                Hi, {user?.full_name ?? 'User'}
              </ThemedText>
              <ThemedText type="subtitle">{greeting}</ThemedText>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: card }]}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={icon}
            />
          </TouchableOpacity>
        </ThemedView>

        {/* ================= Quick Actions ================= */}
        <ThemedView style={styles.quickActions}>
          <QuickAction icon="hand-left" label="Bantuan Aktif" />
          <QuickAction icon="megaphone" label="Minta Bantuan" />
          <QuickAction icon="analytics" label="Progress Misi" />
          <QuickAction icon="time" label="Riwayat" />
        </ThemedView>

        {/* ================= Bantuan Terdekat ================= */}
        <ThemedView style={{ paddingHorizontal: 16, marginTop: 20, flex: 1 }}>
          <View style={styles.contentHeader}>
            <ThemedText type="defaultSemiBold">
              Bantuan Terdekat
            </ThemedText>
            <ThemedText style={styles.link}>
              Lihat Semua
            </ThemedText>
          </View>

          {loadingHelp && <NearbyHelpState type="loading" />}

          {!loadingHelp && nearbyHelps.length === 0 && (
            <NearbyHelpState type="empty" />
          )}

          {!loadingHelp && nearbyHelps.length > 0 && (
            <View style={{ gap: 12, paddingVertical: 12 }}>
              {nearbyHelps.map((item) => (
                <HelpCard
                  key={item.id}
                  data={item}
                  onPress={() =>
                    router.push({
                      pathname: "/help/[id]",
                      params: { id: item.id },
                    })
                  }
                />
              ))}
            </View>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  content: {
    paddingHorizontal: 16,
    marginTop: 20,
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  link: {
    fontSize: 14,
  }
});

