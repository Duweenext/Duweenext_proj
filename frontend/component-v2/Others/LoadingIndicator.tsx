// components/common/LoadingSpinner.tsx
import React from "react";
import { ActivityIndicator, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import {theme} from '@/theme'

interface LoadingSpinnerProps {
  size?: "small" | "large" | number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  /** Optional text label under the spinner */
  message?: string;
  /** Optional text color */
  textColor?: string;
  /** Optional font size */
  textSize?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  color = "#111827", // default dark gray
  style,
  message,
  textColor = "#111827",
  textSize = 14,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {message ? (
        <Text style={[styles.text, { color: textColor, fontSize: textSize ,fontFamily: theme.fontFamily.regular}]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
};

export default LoadingSpinner;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    marginTop: 8,
    textAlign: "center",
  },
});
