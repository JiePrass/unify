import { Colors } from "@/constants/theme";
import { StyleSheet, TextInput, TextInputProps, useColorScheme } from "react-native";

export function ThemedTextInput(props: TextInputProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    return (
        <TextInput
            placeholderTextColor={theme.placeholder}
            style={[
                styles.input,
                {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.inputBackground,
                },
                props.style,
            ]}
            {...props}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
});