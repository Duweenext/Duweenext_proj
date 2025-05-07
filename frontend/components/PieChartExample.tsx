import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function PieChartExample() {
    const data = [
        {
            name: 'Seoul',
            population: 21500000,
            color: '#FF6384',
            legendFontColor: '#7F7F7F',
            legendFontSize: 15
        },
        {
            name: 'Toronto',
            population: 2800000,
            color: '#36A2EB',
            legendFontColor: '#7F7F7F',
            legendFontSize: 15
        },
        {
            name: 'New York',
            population: 8538000,
            color: '#FFCE56',
            legendFontColor: '#7F7F7F',
            legendFontSize: 15
        },
        {
            name: 'Moscow',
            population: 11920000,
            color: '#4BC0C0',
            legendFontColor: '#7F7F7F',
            legendFontSize: 15
        }
    ];

    const chartConfig = {
        backgroundGradientFrom: '#1E2923',
        backgroundGradientTo: '#08130D',
        color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
        strokeWidth: 2
    };

    return (
        <View className="py-4 my-2 rounded-lg bg-gray-100">
            <Text className="text-lg font-bold mb-2 text-center">Population by City</Text>
            <PieChart
                data={data}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
            />
        </View>
    );
}