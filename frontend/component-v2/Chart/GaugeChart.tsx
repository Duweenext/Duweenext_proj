import { theme } from "@/theme";
import React, { useMemo } from "react";
import { View, Text, useWindowDimensions } from "react-native";
import Svg, { G, Circle } from "react-native-svg";

type Props = {
  title: string;
  value: number;
  unit?: string;
  min?: number;
  max?: number;
  color?: string;
  trackColor?: string;
  showValue?: boolean;
  columns?: number;
  spacing?: number;
  extraHorizontalPadding?: number
};

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

const HalfCircleGauge: React.FC<Props> = ({
  title,
  value,
  unit,
  min = 0,
  max = 100,
  color = "#22c55e",
  trackColor = "#E5E7EB",
  showValue = true,
  columns = 3,
  spacing = 8,
  extraHorizontalPadding = theme.spacing.md * 2
}) => {
  const { width: screenWidth } = useWindowDimensions();

  // Calculate gauge size
  const totalSpacing = spacing * (columns - 1);
  const availableWidth = screenWidth - theme.spacing.md * 2 - totalSpacing - extraHorizontalPadding;
  const size = availableWidth / columns;

  // 🔹 Dynamic radius factor based on screen width
  // Smaller screen → smaller factor (arc appears larger)
  const baseRadiusFactor = 2.9;
  const radiusFactor =
    screenWidth < 360
      ? baseRadiusFactor - 0.3 // make arc bigger on small screens
      : screenWidth > 768
      ? baseRadiusFactor + 0.2 // make arc smaller on tablets
      : baseRadiusFactor;

  const strokeWidth = size * 0.1;
  const r = (size - strokeWidth) / radiusFactor;
  const center = size / 2;
  const halfCirc = Math.PI * r;

  const pct = useMemo(() => {
    const norm = (value - min) / (max - min || 1);
    return clamp(norm, 0, 1);
  }, [value, min, max]);

  const dashArray = `${halfCirc}, ${halfCirc}`;
  const dashOffset = halfCirc * (1 - pct);

  // 🔹 Dynamic text offset based on screen width
  const baseTextOffset = 0.05;
  const textOffset =
    screenWidth < 360
      ? baseTextOffset + 0.03 // push text down a bit more on small screens
      : screenWidth > 768
      ? baseTextOffset - 0.02 // lift text slightly on big screens
      : baseTextOffset;

  // Text scaling
  const titleFont = size * 0.15;
  const valueFont = size * 0.18;
  const unitFont = size * 0.12;

  return (
    <View style={{ width: size, alignItems: "center" }}>
      {/* Title */}
      <Text
        style={{
          fontSize: titleFont,
          fontWeight: "700",
          fontFamily: theme.fontFamily.regular,
        }}
      >
        {title}
      </Text>

      {/* Gauge */}
      <View style={{ width: size, height: size / 2, overflow: "hidden" }}>
        <Svg width={size} height={size}>
          <G rotation={180} origin={`${center}, ${center}`}>
            {/* Track */}
            <Circle
              cx={center}
              cy={center}
              r={r}
              stroke={trackColor}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={dashArray}
              strokeLinecap="butt"
            />
            {/* Progress */}
            <Circle
              cx={center}
              cy={center}
              r={r}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
            />
          </G>
        </Svg>
      </View>

      {/* Value inside */}
      {showValue && (
        <Text
          style={{
            position: "absolute",
            top: size * 0.45,
            transform: [{ translateY: size * textOffset }],
            fontFamily: theme.fontFamily.medium,
            fontSize: valueFont,
          }}
        >
          {Number.isFinite(value) ? value : "-"}
        </Text>
      )}

      {/* Unit */}
      <Text
        style={{
          marginTop: 2,
          fontSize: unitFont,
          fontWeight: "600",
          color: "#4B5563",
          minHeight: unitFont * 1.5,
        }}
      >
        {unit ?? ""}
      </Text>
    </View>
  );
};

export default HalfCircleGauge;
