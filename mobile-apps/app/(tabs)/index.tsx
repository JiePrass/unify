import { useMemo, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { getNearbyHelpRequests } from '@/lib/api/help';
import { HelpCard } from '@/components/card/help-card';
import { calculateDistanceKm } from "@/lib/utils/calculate-distance";
import { NearbyHelpState } from "@/components/nearby-help-state";
import QuickAction from '@/components/quick-action-button';

export default function HomeScreen() {
  const { user, loading } = useAuth();

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

  const [nearbyHelps, setNearbyHelps] = useState<any[]>([]);
  const [loadingHelp, setLoadingHelp] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    const fetchNearbyHelp = async () => {
      try {
        setLoadingHelp(true);

        const { status } =
          await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLoadingHelp(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

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
      }
    };

    fetchNearbyHelp();
  }, []);

  if (loading) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: background }}>
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
        <QuickAction icon="hand-left-outline" label="Bantuan Aktif" />
        <QuickAction icon="megaphone-outline" label="Minta Bantuan" />
        <QuickAction icon="analytics-outline" label="Progress Misi" />
        <QuickAction icon="time-outline" label="Riwayat" />
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
          <FlatList
            data={nearbyHelps}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              const distance =
                userLocation
                  ? calculateDistanceKm(
                    userLocation.latitude,
                    userLocation.longitude,
                    item.latitude,
                    item.longitude
                  )
                  : null;

              return (
                <HelpCard
                  data={{
                    ...item,
                    distance_km: distance ? distance.toFixed(1) : null,
                  }}
                  onPress={() => {
                    console.log("Open help:", item.id);
                  }}
                />
              );
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 12,
              paddingBottom: 24,
            }}
          />
        )}
      </ThemedView>

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

