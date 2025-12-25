import { useEffect, useRef, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ListRenderItem,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { io, Socket } from "socket.io-client";
import { useLocalSearchParams } from "expo-router";

import { useAuth } from "@/contexts/auth-context";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import HeaderScreen from "@/components/header-screen";

interface Message {
    id: number;
    sender_id: number;
    content: string;
    created_at: string;
}

export default function ChatScreen() {
    /* ===================== PARAM ===================== */
    const { helpDetail } = useLocalSearchParams<{ helpDetail: string }>();
    const help = JSON.parse(helpDetail);

    const { id: userId, token } = useAuth();

    /* ===================== THEME ===================== */
    const primary = useThemeColor({}, "primary");
    const background = useThemeColor({}, "background");
    const card = useThemeColor({}, "card");
    const text = useThemeColor({}, "text");
    const border = useThemeColor({}, "border");

    /* ===================== STATE ===================== */
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [chatRoomId, setChatRoomId] = useState<number | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const listRef = useRef<FlatList<Message>>(null);

    /* ===================== SOCKET ===================== */
    useEffect(() => {
        const socket = io(process.env.EXPO_PUBLIC_API_BASE_URL!, {
            auth: { token },
            transports: ["websocket"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("join_chat", {
                userId,
                helpId: help.id,
            });
        });

        socket.on("join_success", ({ chatRoomId }) => {
            setChatRoomId(chatRoomId);
        });

        socket.on("new_message", (msg: Message) => {
            setMessages((prev) => [...prev, msg]);
        });

        socket.on("join_error", console.error);
        socket.on("send_error", console.error);

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [help.id, userId, token]);

    /* ===================== HELPERS ===================== */
    const scrollToBottom = () => {
        listRef.current?.scrollToEnd({ animated: true });
    };

    const sendMessage = () => {
        if (!input.trim()) return;
        if (!socketRef.current || !chatRoomId) return;

        socketRef.current.emit("send_message", {
            userId,
            chatRoomId,
            content: input.trim(),
        });

        setInput("");
    };

    /* ===================== RENDER ITEM ===================== */
    const renderItem: ListRenderItem<Message> = ({ item }) => {
        const mine = item.sender_id === userId;

        return (
            <ThemedView
                style={[
                    styles.bubble,
                    mine ? styles.mine : styles.other,
                    { backgroundColor: mine ? primary : card },
                ]}
            >
                <ThemedText style={{ color: mine ? "#fff" : text }}>
                    {item.content}
                </ThemedText>

                <ThemedText style={styles.time}>
                    {new Date(item.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </ThemedText>
            </ThemedView>
        );
    };

    /* ===================== UI ===================== */
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: background }}>
            <HeaderScreen title="Chat" />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
            >
                {/* MESSAGE LIST */}
                <FlatList
                    ref={listRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    onContentSizeChange={scrollToBottom}
                    onLayout={scrollToBottom}
                    keyboardDismissMode="interactive"
                />

                {/* INPUT BAR */}
                <ThemedView style={[styles.inputBar, { borderColor: border }]}>
                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        placeholder="Ketik pesan…"
                        placeholderTextColor={border}
                        style={[styles.input, { color: text }]}
                        multiline
                    />

                    <TouchableOpacity
                        onPress={sendMessage}
                        disabled={!chatRoomId}
                        style={[
                            styles.sendBtn,
                            {
                                backgroundColor: chatRoomId
                                    ? primary
                                    : border,
                            },
                        ]}
                    >
                        <ThemedText style={{ color: "#fff" }}>
                            Kirim
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
    list: {
        padding: 12,
        paddingBottom: 8,
    },
    bubble: {
        maxWidth: "80%",
        padding: 10,
        borderRadius: 14,
        marginVertical: 4,
    },
    mine: {
        alignSelf: "flex-end",
        borderTopRightRadius: 4,
    },
    other: {
        alignSelf: "flex-start",
        borderTopLeftRadius: 4,
    },
    time: {
        fontSize: 10,
        opacity: 0.6,
        marginTop: 2,
        alignSelf: "flex-end",
    },
    inputBar: {
        flexDirection: "row",
        alignItems: "flex-end",
        padding: 8,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    sendBtn: {
        marginLeft: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
    },
});
