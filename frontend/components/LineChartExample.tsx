import { LegendKey } from '@/srcs/interfaces/graph';
import { useGraphToggle } from '@/srcs/utlis/graph';
import React from 'react';
import { View, useWindowDimensions, Pressable, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function LineChartToggleExample() {
  const { selected, toggleDataset, visibleDatasets, legendLabels } = useGraphToggle();
  const { width: screenWidth } = useWindowDimensions();
  type DatasetKey = 'sales' | 'revenue';

  const allDataSets: Record<
    DatasetKey,
    { label: string; data: number[]; color: (opacity?: number) => string }
  > = {
    sales: {
      label: 'Sales',
      data: [20, 45, 28, 80, 99, 43],
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    },
    revenue: {
      label: 'Revenue',
      data: [35, 22, 50, 40, 70, 65],
      color: (opacity = 1) => `rgba(34, 128, 176, ${opacity})`,
    },
  };

  const datasets = visibleDatasets(allDataSets, selected);
  const legends = legendLabels(allDataSets, selected);

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  return (
    <View style={{ gap: 8 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          columnGap: 8, // RN supports gap in newer versions; if not, use marginRight below.
          rowGap: 0,
        }}
      >
        {(['all', ...Object.keys(allDataSets)] as LegendKey[]).map((key) => {
          const isActive = !!selected[key];
          return (
            <Pressable
              key={key}
              onPress={() => toggleDataset(key)}
              style={{
                paddingHorizontal: 24,
                paddingVertical: 8,
                borderRadius: 9999,
                backgroundColor: isActive ? '#7c3aed' /* violet-600 */ : '#d1d5db' /* gray-300 */,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: isActive ? '#ffffff' : '#000000',
                }}
              >
                {key === 'all' ? 'All' : allDataSets[key as DatasetKey].label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {datasets.length > 0 ? (
        <LineChart
          data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: datasets,
            legend: legends,
          }}
          width={screenWidth - 36}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={{ borderRadius: 16 }}
        />
      ) : (
        <Text
          style={{
            textAlign: 'center',
            marginTop: 32,
            color: '#6b7280', // gray-500
          }}
        >
          No dataset selected
        </Text>
      )}
    </View>
  );
}
