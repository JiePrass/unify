import { StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface Props {
    mine: boolean;
    content: string;
    time: string;
}

export default function ChatBubble({ mine, content, time }: Props) {
    const primary = useThemeColor({}, "primary");
    const card = useThemeColor({}, "card");
    const text = useThemeColor({}, "text");

    return (
        <View style={[styles.container, mine ? styles.mine : styles.other]}>
            <ThemedView
                style={[
                    styles.bubble,
                    {
                        backgroundColor: mine ? primary : card,
                        borderTopRightRadius: mine ? 0 : 16,
                        borderTopLeftRadius: mine ? 16 : 0,
                    },
                ]}
            >
                <ThemedText style={{ color: text }}>{content}</ThemedText>
            </ThemedView>

            <ThemedText
                style={[
                    styles.time,
                    mine ? styles.timeMine : styles.timeOther,
                ]}
            >
                {time}
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 4
    },
    bubble: {
        maxWidth: "80%",
        padding: 10,
        borderRadius: 16,
    },
    mine: {
        alignSelf: "flex-end",
    },
    other: {
        alignSelf: "flex-start",
    },
    time: {
        fontSize: 10,
        opacity: 0.6,
        marginTop: 2,
    },
    timeMine: {
        alignSelf: "flex-end", // kanan
        marginRight: 4,
    },
    timeOther: {
        alignSelf: "flex-start", // kiri
        marginLeft: 4,
    },
});
