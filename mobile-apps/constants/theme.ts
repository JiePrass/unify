import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    subText: "#687076",
    background: "#fefefe",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,

    // Updated primary & secondary
    primary: "#A9C7FF",
    secondary: "#7FAAF5",

    border: "#CCCCCC",
    card: "#fafafa",
    placeholder: "#888888",
    inputBackground: "#FFFFFF",
    error: "#E63946",
    success: "#27AE60",
    warning: "#F2C94C",
    disabled: "#E0E0E0",
    buttonTextPrimary: "#2b2b2b",
  },

  dark: {
    text: "#ECEDEE",
    subText: "#A1A8AD",
    background: "#1e1e1e",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,

    border: "#333333",
    card: "#252525",
    placeholder: "#AAAAAA",
    inputBackground: "#2A2A2A",
    error: "#E57373",
    success: "#6FCF97",
    warning: "#F2C94C",
    disabled: "#555555",

    // Keep your existing dark palette
    primary: "#5EABD6",
    secondary: "#345366",

    buttonTextPrimary: "#FFFFFF",
  },
};

// SF Pro font usage
export const Fonts = Platform.select({
  ios: {
    sans: "SF Pro Text",
    serif: "SF Pro Display",
    rounded: "SF Pro Rounded",
    mono: "SF Mono",
  },
  web: {
    sans: "'SF Pro Text', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "'SF Pro Display', Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, sans-serif",
    mono: "'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
  },
  default: {
    sans: "SF Pro Text",
    serif: "serif",
    rounded: "sans-serif",
    mono: "monospace",
  },
});