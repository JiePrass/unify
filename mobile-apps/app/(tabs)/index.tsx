import { useMemo, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  useColorScheme,
  FlatList,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { getNearbyHelpRequests } from '@/lib/api/help';
import { HelpCard } from '@/components/card/help-card';
import { calculateDistanceKm } from "@/lib/utils/calculate-distance";
import { NearbyHelpState } from "@/components/nearby-help-state";

export default function HomeScreen() {
  const { user, loading } = useAuth();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  }, []);

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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
              Hi, {user?.full_name ?? 'User'} 👋
            </ThemedText>
            <ThemedText type="subtitle">
              {greeting}
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons
            name="notifications-outline"
            size={22}
            color={colors.icon}
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
        <ThemedText type="defaultSemiBold">
          Bantuan Terdekat
        </ThemedText>

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

/* ================= Reusable Quick Action ================= */
function QuickAction({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <TouchableOpacity
        style={[
          stylesStatic.quickActionCircle,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Ionicons name={icon} size={22} color={colors.icon} />
      </TouchableOpacity>
      <ThemedText
        style={{
          marginTop: 6,
          fontSize: 12,
          textAlign: 'center',
          color: colors.subText,
        }}
        numberOfLines={2}
      >
        {label}
      </ThemedText>
    </View>
  );
}

/* ================= Styles ================= */
const stylesStatic = StyleSheet.create({
  quickActionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
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
      backgroundColor: colors.card,
    },
    quickActions: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      marginTop: 12,
      gap: 8,
    },
    section: {
      flex: 1,
      paddingHorizontal: 16,
      marginTop: 20,
    },
  });
