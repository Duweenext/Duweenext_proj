import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../tailwind.config';

const fullConfig = resolveConfig(tailwindConfig as any);

export const theme= fullConfig.theme as any;

export const themeStyle = {
  fontSize: {
    xs: 12,
    data_text: 14,
    description: 16,
    descriptionL: 18,
    header2: 20,
    header1: 24,
    "2xl": 28,
  },
  fontFamily: {
    regular: "roboto-condensed-regular",
    medium: "roboto-condensed-medium",
    semibold: "roboto-condensed-semibold",
    bold: "roboto-condensed-bold",
  },
    colors: {
    primary: "#1A736A",
    secondary: "#95E7E7",
    background1: "#D9D9D9",
    background2: "#a7c957",
    background3: '',
    fail: "#F77979",
    warning: "#F2BC79",
    success: "#A6F98D",
    white: "#FFFFFF",
    black: "#000000",
  },
  spacing: {
    xxs:2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  };