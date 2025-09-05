// components/IconButton.tsx
import React, { forwardRef, memo } from "react";
import {
  Image,
  ImageSourcePropType,
  Insets,
  Pressable,
  StyleProp,
  View,
  ViewStyle,
  ActivityIndicator,
} from "react-native";

type IconButtonProps = {
  onPress?: () => void;
  source: ImageSourcePropType;           // your icon/image
  size?: number;                         // button outer size (square)
  iconSize?: number;                     // inner image size
  tintColor?: string;                    // optional image tint
  backgroundColor?: string;              // button bg (ghost by default)
  disabled?: boolean;
  loading?: boolean;                     // show spinner instead of icon
  hitSlop?: number | Insets;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;          // extra container styles
  accessibilityLabel?: string;
  testID?: string;
};

const IconButton = memo(
  forwardRef<View, IconButtonProps>(function IconButton(
    {
      onPress,
      source,
      size = 40,
      iconSize = 22,
      tintColor,
      backgroundColor,
      disabled = false,
      loading = false,
      hitSlop = 8,
      borderRadius,
      style,
      accessibilityLabel,
      testID,
    },
    ref
  ) {
    const radius = borderRadius ?? Math.round(size / 2); // round by default

    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        disabled={disabled || loading}
        hitSlop={hitSlop}
        android_ripple={
          backgroundColor
            ? { color: "rgba(0,0,0,0.08)", borderless: true }
            : { color: "rgba(0,0,0,0.08)", borderless: true }
        }
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        style={({ pressed }) => [
          {
            width: size,
            height: size,
            borderRadius: radius,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
              backgroundColor ?? "transparent", // ghost if not provided
            opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Image
            source={source}
            style={{
              width: iconSize,
              height: iconSize,
              tintColor,
              resizeMode: "contain",
            }}
            // For remote URIs with cache control on Expo:
            // defaultSource works on iOS; skip if not needed.
            // defaultSource={require("../assets/icon-placeholder.png")}
            fadeDuration={100}
          />
        )}
      </Pressable>
    );
  })
);

export default IconButton;
