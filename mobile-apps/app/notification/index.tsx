import { useState, useCallback, useMemo, useEffect } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemedText } from '@/components/ui/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
    getNotifications,
    markNotificationRead,
    deleteNotification,
} from '@/lib/api/notification';
import HeaderScreen from '@/components/header-screen';

type NotificationType = 'HELP' | 'MISSION' | 'BADGE' | 'CHAT' | 'SYSTEM';

interface Notification {
    id: number;
    user_id: string;
    title: string;
    body: string;
    type: NotificationType;
    is_read: boolean;
    created_at: string;
}

const getIconName = (type: NotificationType) => {
    switch (type) {
        case 'HELP':
            return 'hand-left';
        case 'MISSION':
            return 'clipboard';
        case 'BADGE':
            return 'medal';
        case 'CHAT':
            return 'chatbox-ellipses';
        case 'SYSTEM':
            return 'settings';
        default:
            return 'notifications';
    }
};

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
};

const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};

const isThisWeek = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && !isToday(dateString);
};

export default function NotificationScreen() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const background = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const subTextColor = useThemeColor({}, 'subText');

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await getNotifications();
            setNotifications(res.notifications || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await markNotificationRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteNotification(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const groupedNotifications = useMemo(() => {
        const today: Notification[] = [];
        const thisWeek: Notification[] = [];
        const older: Notification[] = [];

        notifications.forEach((n) => {
            if (isToday(n.created_at)) {
                today.push(n);
            } else if (isThisWeek(n.created_at)) {
                thisWeek.push(n);
            } else {
                older.push(n);
            }
        });

        return [
            { title: 'Hari Ini', data: today },
            { title: 'Minggu Ini', data: thisWeek },
            { title: 'Sebelumnya', data: older },
        ].filter((group) => group.data.length > 0);
    }, [notifications]);

    const renderLeftActions = (id: number) => {
        return (
            <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => handleDelete(id)}
            >
                <Ionicons name="trash-outline" size={24} color="white" />
            </TouchableOpacity>
        );
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <Swipeable
            renderLeftActions={() => renderLeftActions(item.id)}
            friction={2}
            leftThreshold={40}
        >
            <TouchableOpacity
                style={[styles.notificationCard, { backgroundColor: cardColor }]}
                onPress={() => handleMarkAsRead(item.id)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: background }]}>
                    <Ionicons name={getIconName(item.type)} size={24} color={primaryColor} />
                </View>

                <View style={styles.textContainer}>
                    <View style={styles.cardHeader}>
                        <ThemedText style={styles.title} type="defaultSemiBold">
                            {item.title}
                        </ThemedText>
                        <ThemedText style={[styles.time, { color: primaryColor }]}>
                            {formatTime(item.created_at)}
                        </ThemedText>
                    </View>
                    <ThemedText style={[styles.body, { color: subTextColor }]} numberOfLines={2}>
                        {item.body}
                    </ThemedText>
                </View>

                {!item.is_read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        </Swipeable>
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: background }}>
                <Stack.Screen
                    options={{
                        headerShown: false,
                    }}
                />

                {/* Custom Header */}
                <HeaderScreen title="Notifikasi" />

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={primaryColor} />
                    </View>
                ) : (
                    <FlatList
                        data={groupedNotifications}
                        keyExtractor={(item) => item.title}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        renderItem={({ item }) => (
                            <View style={styles.section}>
                                <ThemedText style={styles.sectionTitle} type="defaultSemiBold">
                                    {item.title}
                                </ThemedText>
                                {item.data.map((notification) => (
                                    <View key={notification.id} style={styles.itemWrapper}>
                                        {renderItem({ item: notification })}
                                    </View>
                                ))}
                            </View>
                        )}
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <Ionicons name="notifications-off-outline" size={64} color={subTextColor} />
                                <ThemedText style={{ color: subTextColor, marginTop: 16 }}>
                                    Belum ada notifikasi
                                </ThemedText>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        marginBottom: 12,
    },
    itemWrapper: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
    },
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        // Shadow for light mode
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        flex: 1,
        marginRight: 8,
    },
    time: {
        fontSize: 12,
        fontWeight: '500',
    },
    body: {
        fontSize: 13,
        lineHeight: 18,
    },
    unreadDot: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF3B30',
    },
    deleteAction: {
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
    },
});
