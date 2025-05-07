import { LegendKey } from '@/srcs/interfaces/graph';
import { useGraphToggle } from '@/srcs/utlis/graph';
import React, { useState } from 'react';
import { View, useWindowDimensions, Pressable, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function LineChartToggleExample() {
    const { selected, toggleDataset, visibleDatasets, legendLabels } = useGraphToggle();
    const { width: screenWidth } = useWindowDimensions();
    type DatasetKey = 'sales' | 'revenue';

    const allDataSets: Record<DatasetKey, { label: string; data: number[]; color: (opacity?: number) => string }> = {
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
        <View className='gap-2'>
            <View className="flex-row justify-start space-x-3 gap-2">
                {(['all', ...Object.keys(allDataSets)] as LegendKey[]).map((key) => (
                    <Pressable
                        key={key}
                        onPress={() => toggleDataset(key)}
                        className={`px-6 py-2 rounded-full ${selected[key] ? 'bg-violet-600' : 'bg-gray-300'}`}
                    >
                        <Text className={`text-sm ${selected[key] ? 'text-white' : 'text-black'}`}>
                            {key === 'all' ? 'All' : allDataSets[key].label}
                        </Text>
                    </Pressable>
                ))}
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
                <Text className="text-center mt-8 text-gray-500">No dataset selected</Text>
            )}
        </View>
    );
}
