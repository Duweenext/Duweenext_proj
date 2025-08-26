import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { theme } from '@/theme';
import {
  VictoryChart,
  VictoryLine,
  VictoryTheme,
  VictoryAxis,
  VictoryScatter,
  VictoryLabel,
} from "victory-native";

interface SensorChartProps {
  data: { day: string; value: number; x: number; y: number }[];
  title?: string;
}

const SensorChart: React.FC<SensorChartProps> = ({ 
  data, 
  title = "Summary Graph of Temperature" 
}) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth * 1.15 - 40; 
  
  return (
    <View>
      <Text style={styles.chartTitle}>{title}</Text>
      
      <View style={styles.chartWrapper}>
        <VictoryChart
          theme={VictoryTheme.material}
          height={300}
          width={chartWidth}
          domain={{ y: [4, 9] }}
        >
          <VictoryAxis
            dependentAxis={false}
            tickFormat={(x) => `Day${x}`}
            style={{
              tickLabels: { fontSize: 12, padding: 5, fill: "#666" },
              grid: { stroke: "transparent" }
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `${t}°C`}
            style={{
              tickLabels: { fontSize: 12, padding: 5, fill: "#666" },
              grid: { stroke: "#f0f0f0", strokeWidth: 1 }
            }}
          />

          <VictoryLine
            data={data}
            x="x"
            y="y"
            style={{
              data: { stroke: "#1A736A", strokeWidth: 3 }
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 }
            }}
          />

          <VictoryScatter
            data={data}
            x="x"
            y="y"
            size={6}
            style={{
              data: { fill: "#1A736A", stroke: "#ffffff", strokeWidth: 2 }
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 }
            }}
            labelComponent={<VictoryLabel dy={-15} style={{ fontSize: 11, fill: "#1A736A", fontWeight: "bold" }} />}
            labels={({ datum }) => `${datum.y}°C`}
          />
        </VictoryChart>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartTitle: {
    fontSize: theme.fontSize.header2,
    fontFamily: theme.fontFamily.medium,
    color: '#1A736A',
    marginBottom: theme.spacing.md,
  },
  chartWrapper: {
    height: 320,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    // padding: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SensorChart;
