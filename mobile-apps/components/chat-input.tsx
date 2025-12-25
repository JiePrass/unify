import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";

interface ChatInputProps {
    value: string;
    onChange: (text: string) => void;
    onSend: () => void;
    disabled?: boolean;
}

export default function ChatInput({
    value,
    onChange,
    onSend,
    disabled = false,
}: ChatInputProps) {
    const primary = useThemeColor({}, "primary");
    const border = useThemeColor({}, "border");
    const card = useThemeColor({}, "card");

    return (
        <ThemedView
            style={[
                styles.container,
                { borderColor: border, backgroundColor: card },
            ]}
        >
            <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Ketik pesan…"
                placeholderTextColor={border}
                style={styles.input}
                multiline
                returnKeyType="send"
                onSubmitEditing={onSend}
            />

            <TouchableOpacity
                onPress={onSend}
                disabled={disabled}
                activeOpacity={0.8}
                style={[
                    styles.sendBtn,
                    {
                        backgroundColor: primary,
                    },
                ]}
            >
                <Ionicons
                    name="paper-plane"
                    size={24}
                    color="#ffff"
                />
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-end",
        padding: 8,
        marginHorizontal: 12,
        marginTop: 12,
        borderRadius: 28,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
});
