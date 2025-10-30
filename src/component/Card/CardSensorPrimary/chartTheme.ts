// This file is (e.g.) src/utils/chartTheme.ts

// 1. Define the new theme structure for our D3 chart
export interface ChartTheme {
  backgroundColor: string; // Background of the SVG
  textColor: string;       // Color for axes, labels, and data point text
  lineColor: string;       // Color for the line and data points
  areaColor: string;       // Color for the area fill (under the line)
  areaOpacity: number;     // Opacity for the area fill
}

// 2. Map your old themes to the new structure
const defaultTheme: ChartTheme = {
  backgroundColor: "#181818",
  textColor: "white",
  lineColor: "#00BFFF", // From old lineGradientStartColor
  areaColor: "rgb(84,219,234)", // From old startFillColor
  areaOpacity: 0.4,
};

const lightTheme: ChartTheme = {
  backgroundColor: "#f5f5f5",
  textColor: "#424242",
  lineColor: "#1976d2", // From old lineGradientEndColor
  areaColor: "rgb(30, 144, 255)", // From old startFillColor
  areaOpacity: 0.4,
};

const summerTheme: ChartTheme = {
  backgroundColor: "#fff3e0",
  textColor: "#bf360c",
  lineColor: "#f57c00", // From old lineGradientEndColor
  areaColor: "rgb(255, 111, 0)", // From old startFillColor
  areaOpacity: 0.4,
};

const greenishTheme: ChartTheme = {
  backgroundColor: "#e8f5e9",
  textColor: "#2e7d32",
  lineColor: "#388e3c", // From old lineGradientEndColor
  areaColor: "rgb(76, 175, 80)", // From old startFillColor
  areaOpacity: 0.4,
};

// 3. Export the themes in the same way as before
// (SensorBoardExpand.tsx won't even know anything changed)
export const chart_themes = {
  default: { name: 'Default', styles: defaultTheme },
  light: { name: 'Light', styles: lightTheme },
  summer: { name: 'Summer', styles: summerTheme },
  greenish: { name: 'Greenish', styles: greenishTheme },
};

export type ThemeKey = keyof typeof chart_themes;