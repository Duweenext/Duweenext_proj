// src/tokens.ts
export const tokens = {
  colors: {
    primary: "#1A736A",
    secondary: "#95E7E7",
    background1: "#D9D9D9",
    background2: "#a7c957",
    overlayBackground: 'rgba(0,0,0,0.45)',
    background3: '',
    fail: "#F77979",
    warning: "#F2BC79",
    success: "#A6F98D",
    white: "#FFFFFF",
    black: "#000000",
  },
  fontFamily: {
    regular: "roboto-condensed-regular",
    medium: "roboto-condensed-medium",
    semibold: "roboto-condensed-semibold",
    bold: "roboto-condensed-bold",
  },
  fontSize: {
    xs: 12,
    data_text: 14,
    description: 16,
    header2: 20,
    header1: 24,
    "2xl": 28,
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
  
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
  },
};
export type Tokens = typeof tokens;