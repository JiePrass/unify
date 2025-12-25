import { useEffect, useRef, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    ListRenderItem,
    ActivityIndicator,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { io, Socket } from "socket.io-client";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import HeaderScreen from "@/components/header-screen";
import ChatBubble from "@/components/chat-buble";
import ChatInput from "@/components/chat-input";

interface Message {
    id: number;
    sender_id: number;
    content: string;
    created_at: string;
    optimistic?: boolean;
}

export default function ChatScreen() {
    const { helpDetail } = useLocalSearchParams<{ helpDetail: string }>();
    const help = JSON.parse(helpDetail);
    const { id: userId, token } = useAuth();

    const background = useThemeColor({}, "background");

    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState("");
    const [chatRoomId, setChatRoomId] = useState<number | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const listRef = useRef<FlatList<Message>>(null);

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

        socket.on("join_success", ({ chatRoomId, messages }) => {
            setChatRoomId(chatRoomId);
            setMessages(messages);
            setLoading(false);
            requestAnimationFrame(scrollToBottom);
        });

        socket.on("new_message", (msg: Message) => {
            setMessages((prev) => {
                const index = prev.findIndex(
                    (m) =>
                        m.optimistic &&
                        m.sender_id === msg.sender_id &&
                        m.content === msg.content
                );

                if (index !== -1) {
                    const updated = [...prev];
                    updated[index] = msg;
                    return updated;
                }

                return [...prev, msg];
            });

            requestAnimationFrame(scrollToBottom);
        });

        socket.on("join_error", (err) => {
            console.error(err);
            setLoading(false);
        });

        socket.on("send_error", console.error);

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [help.id, userId, token]);

    const tempId = () => -Date.now();

    const scrollToBottom = () => {
        listRef.current?.scrollToEnd({ animated: true });
    };

    const sendMessage = () => {
        if (!input.trim()) return;
        if (!socketRef.current || !chatRoomId) return;

        const content = input.trim();

        const optimisticMessage: Message = {
            id: tempId(),
            sender_id: userId,
            content,
            created_at: new Date().toISOString(),
            optimistic: true,
        };

        setMessages((prev) => [...prev, optimisticMessage]);
        requestAnimationFrame(scrollToBottom);

        socketRef.current.emit("send_message", {
            userId,
            chatRoomId,
            content,
        });

        setInput("");
    };

    const renderItem: ListRenderItem<Message> = ({ item }) => (
        <ChatBubble
            mine={item.sender_id === userId}
            content={item.content}
            time={new Date(item.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })}
        />
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: background }}>
            <HeaderScreen title="Pesan" />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
            >
                {loading ? (
                    <View style={styles.loading}>
                        <ActivityIndicator size="small" />
                        <ThemedText style={styles.loadingText}>
                            Memuat percakapan…
                        </ThemedText>
                    </View>
                ) : (
                    <FlatList
                        ref={listRef}
                        data={messages}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.list}
                        onContentSizeChange={scrollToBottom}
                        keyboardDismissMode="interactive"
                    />
                )}

                <ChatInput
                    value={input}
                    onChange={setInput}
                    onSend={sendMessage}
                    disabled={!chatRoomId || !input.trim()}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    list: {
        padding: 12,
        paddingBottom: 8,
    },
    loading: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 8,
        opacity: 0.7,
        fontSize: 13,
    },

});
