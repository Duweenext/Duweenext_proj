import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function BarChartExample() {
    const data = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [
            {
                data: [20, 45, 28, 80, 99, 43],
            }
        ]
    };

    const chartConfig = {
        backgroundColor: '#1cc910',
        backgroundGradientFrom: '#eff3ff',
        backgroundGradientTo: '#efefef',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16
        },
        barPercentage: 0.6,
    };

    return (
        <View className="py-4 my-2 rounded-lg bg-gray-100">
            <Text className="text-lg font-bold mb-2 text-center">Weekly Activity</Text>
            <BarChart
                data={data}
                width={screenWidth - 32}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={chartConfig}
                style={{
                    marginVertical: 8,
                    borderRadius: 16, // must still be inline
                }}
            />
        </View>
    );
}
