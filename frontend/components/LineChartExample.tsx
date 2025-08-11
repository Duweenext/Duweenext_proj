import { SensorLegendKey, SensorDatasetKey, AllDataSets } from '@/src/interfaces/graph';
import { useSensorGraphToggle } from '@/src/utlis/graph';
import React from 'react';
import { View, useWindowDimensions, Pressable, Text } from 'react-native';
// import { LineChart } from 'react-native-chart-kit';

export default function LineChartToggleExample() {
    const { selected, toggleDataset, visibleDatasets, legendLabels } = useSensorGraphToggle();
    const { width: screenWidth } = useWindowDimensions();

    const allDataSets: AllDataSets<SensorDatasetKey> = {
        pH: {
            label: 'pH',
            data: [20, 45, 28, 80, 99, 43],
            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        },
        Temperature: {
            label: 'Temperature',
            data: [35, 22, 50, 40, 70, 65],
            color: (opacity = 1) => `rgba(34, 128, 176, ${opacity})`,
        },
        EC: {
            label: 'EC',
            data: [20, 45, 28, 80, 99, 43],
            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
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

    const allAlertData = [
        { type: 'pH', value: 33, date: 'March, 2025' },
        // { type: 'pH', value: 29, date: 'February, 2025' },
        { type: 'Temperature', value: 38, date: 'March, 2025' },
        // { type: 'Temperature', value: 42, date: 'February, 2025' },
        { type: 'EC', value: 36, date: 'March, 2025' },
        // { type: 'EC', value: 31, date: 'February, 2025' },
    ];

    // Filter alert data based on selected filters
    const getFilteredAlertData = () => {
        if (selected.all) {
            return allAlertData; // Show all alerts when "all" is selected
        }
        
        // Show only alerts for selected sensor types
        return allAlertData.filter(alert => {
            const sensorKey = alert.type as SensorDatasetKey;
            return selected[sensorKey];
        });
    };

    const filteredAlertData = getFilteredAlertData();

    return (
        <View style={{ gap: 14 }}>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    columnGap: 8,
                    rowGap: 0,
                }}
            >
                {(['all', ...Object.keys(allDataSets)] as SensorLegendKey[]).map((key) => {
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
                                marginRight: 2,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: isActive ? '#ffffff' : '#000000',
                                }}
                            >
                                {key === 'all' ? 'All' : allDataSets[key as SensorDatasetKey].label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>


            {datasets.length > 0 ? (
                <View style={{flex: 1}}>
                    <View style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 16,
                    }}>
                        {filteredAlertData.length > 0 ? (
                            filteredAlertData.map((alert, index) => (
                                <AlertItem
                                    key={index}
                                    type={alert.type}
                                    value={alert.value}
                                    date={alert.date}
                                />
                            ))
                        ) : (
                            <Text style={{ 
                                textAlign: 'center', 
                                color: '#6b7280', 
                                fontSize: 14,
                                paddingVertical: 12 
                            }}>
                                No alerts for selected sensors
                            </Text>
                        )}
                    </View>
                    {/* <LineChart
                        data={{
                            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                            datasets: datasets,
                            legend: legends,
                        }}
                        width={screenWidth - 80}
                        height={220}
                        chartConfig={chartConfig}
                        bezier
                        style={{ borderRadius: 16 }}
                    /> */}
                </View>
            ) : (
                <Text
                    style={{
                        textAlign: 'center',
                        marginTop: 32,
                        color: '#6b7280',
                    }}
                >
                    No dataset selected
                </Text>
            )}
        </View>
    );
}


const AlertItem = ({ type, value, date }: { type: string; value: number; date: string }) => {
    const getAlertColor = (alertType: string) => {
        switch (alertType) {
            case 'pH': return '#ef4444'; // red
            case 'Temperature': return '#f97316'; // orange
            case 'EC': return '#eab308'; // yellow
            default: return '#6b7280'; // gray
        }
    };

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: getAlertColor(type),
                    marginRight: 8
                }}
            />
            <Text style={{ fontSize: 14, color: '#374151', flex: 1 }}>
                Alert {type}: {value}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>{date}</Text>
        </View>
    );
};