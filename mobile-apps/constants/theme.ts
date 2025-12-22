import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#11181C",
    subText: "#5C6369",
    background: "#FFFFFF",

    // BRIGHT SOFT ORANGE
    primary: "#FFBE7D",
    secondary: "#FFE1BC",
    tint: "#FF9A3C",

    icon: "#5C6369",
    tabIconDefault: "#5C6369",
    tabIconSelected: "#FFFFFF",

    border: "#E2E2E2",
    card: "#FAFAFA",
    placeholder: "#8A8A8A",
    inputBackground: "#FFFFFF",

    error: "#E76F51",
    success: "#2A9D8F",
    warning: "#E9C46A",
    disabled: "#EEEEEE",

    buttonTextPrimary: "#2A2A2A",
  },

  dark: {
    text: "#ECEDEE",
    subText: "#AEB4B9",
    background: "#1E1E1E",

    primary: "#FFCAA0",
    secondary: "#EFB97F",
    tint: "#FFB26B",

    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#FFFFFF",

    border: "#2E2E2E",
    card: "#252525",
    placeholder: "#9FA3A7",
    inputBackground: "#2A2A2A",

    error: "#F28482",
    success: "#6FCF97",
    warning: "#E9C46A",
    disabled: "#555555",

    buttonTextPrimary: "#1F1F1F",
  },
};

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
