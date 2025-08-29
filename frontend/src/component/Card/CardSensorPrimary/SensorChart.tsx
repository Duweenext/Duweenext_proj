import React, { useState, useEffect, useMemo } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView,
  Dimensions 
} from 'react-native';
import { LineChart } from "react-native-gifted-charts";
import { useSensor } from '@/src/api/hooks/useSensor';

interface SensorChartProps {
  boardId: number;
  sensorType: 'temperature' | 'ph' | 'ec' | string;
  title?: string;
  initialResolution?: 'year' | 'month' | 'week' | 'day' | 'hour';
}

interface ChartDataPoint {
  value: number;
  label: string;
  labelTextStyle?: any;
  dataPointText?: string;
  textShiftY?: number;
  textShiftX?: number;
  textColor?: string;
  textFontSize?: number;
}

const SensorChart: React.FC<SensorChartProps> = ({ 
  boardId,
  sensorType,
  title,
  initialResolution = 'day'
}) => {
  const screenWidth = Dimensions.get('window').width;

  // API Hook
  const { 
    loading, 
    aggregatedSensorData, 
    getAggregatedSensorData, 
    getDefaultDateRange 
  } = useSensor();

  // State
  const [resolution, setResolution] = useState<'year' | 'month' | 'week' | 'day' | 'hour'>(initialResolution);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch data when resolution changes
  useEffect(() => {
    const fetchData = async () => {
      if (!boardId || !sensorType) return;
      
      setError(null);
      const dateRange = getDefaultDateRange(resolution);
      
      try {
        const response = await getAggregatedSensorData(
          sensorType,
          boardId,
          dateRange.startDate,
          dateRange.endDate,
          resolution
        );
        
        if (response.status === 'success' && response.data) {
          console.log(`✅ Fetched ${response.data.length} data points for ${sensorType}`);
        }
      } catch (err) {
        console.error('❌ Error fetching chart data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      }
    };

    fetchData();
  }, [boardId, sensorType, resolution]);

  // Convert backend data to Gifted Charts format
  useEffect(() => {
    if (aggregatedSensorData && aggregatedSensorData.length > 0) {
      const convertedData: ChartDataPoint[] = aggregatedSensorData.map((point, index) => {
        let value: number;
        
        // Extract sensor value based on type
        switch (sensorType) {
          case 'temperature':
            value = point.temperature || 0;
            break;
          case 'ph':
            value = point.ph || 0;
            break;
          case 'ec':
            value = point.ec || 0;
            break;
          default:
            value = 0;
        }

        // Format label based on resolution
        let label: string;
        const date = new Date(point.start_time);
        
        switch (resolution) {
          case 'hour':
            label = date.getHours().toString().padStart(2, '0');
            break;
          case 'day':
            label = `${date.getMonth() + 1}/${date.getDate()}`;
            break;
          case 'week':
            const weekNum = Math.ceil(date.getDate() / 7);
            label = `W${weekNum}`;
            break;
          case 'month':
            label = date.toLocaleDateString('en-US', { month: 'short' });
            break;
          case 'year':
            label = date.getFullYear().toString();
            break;
          default:
            label = point.time_label || `${index + 1}`;
        }

        return {
          value: value,
          label: label,
          labelTextStyle: { 
            color: '#666', 
            fontSize: 10,
            fontWeight: '500'
          },
          dataPointText: value.toFixed(1),
          textShiftY: -10,
          textShiftX: 0,
          textColor: getChartConfig().color,
          textFontSize: 10,
        };
      });
      
      setChartData(convertedData);
      console.log(`📊 Converted ${convertedData.length} points for chart`);
    } else {
      setChartData([]);
    }
  }, [aggregatedSensorData, sensorType, resolution]);

  // Chart configuration based on sensor type
  const getChartConfig = () => {
    switch (sensorType) {
      case 'temperature':
        return {
          color: '#FF6B6B',
          gradientColor: '#FFE6E6',
          unit: '°C',
          yAxisMin: 0,
          yAxisMax: 50,
          stepValue: 10
        };
      case 'ph':
        return {
          color: '#4ECDC4',
          gradientColor: '#E6FFFE',
          unit: 'pH',
          yAxisMin: 0,
          yAxisMax: 14,
          stepValue: 2
        };
      case 'ec':
        return {
          color: '#45B7D1',
          gradientColor: '#E6F7FF',
          unit: 'μS/cm',
          yAxisMin: 0,
          yAxisMax: 2000,
          stepValue: 400
        };
      default:
        return {
          color: '#1A736A',
          gradientColor: '#E8F5F3',
          unit: '',
          yAxisMin: 0,
          yAxisMax: 100,
          stepValue: 20
        };
    }
  };

  const chartConfig = getChartConfig();
  const displayTitle = title || `${sensorType.charAt(0).toUpperCase() + sensorType.slice(1)} Sensor`;

  // Calculate dynamic spacing based on data length
  const calculateSpacing = () => {
    const availableWidth = screenWidth - 80; // Account for padding
    const dataPoints = chartData.length;
    if (dataPoints <= 5) return availableWidth / dataPoints;
    if (dataPoints <= 10) return 60;
    if (dataPoints <= 20) return 40;
    return 30; // For many data points
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A736A" />
        <Text style={styles.loadingText}>Loading {sensorType} data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>❌ Error Loading Data</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            // Trigger refetch by changing resolution momentarily
            const currentRes = resolution;
            setResolution('day');
            setTimeout(() => setResolution(currentRes), 100);
          }}
        >
          <Text style={styles.retryText}>🔄 Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (chartData.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataTitle}>📊 No Data Available</Text>
        <Text style={styles.noDataMessage}>
          No {sensorType} data found for the selected {resolution} period
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.chartTitle}>{displayTitle}</Text>
        <Text style={styles.dataInfo}>
          {chartData.length} data points • {resolution.toUpperCase()} view
        </Text>
      </View>

      {/* Resolution Selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.resolutionContainer}
        contentContainerStyle={styles.resolutionContent}
      >
        {['hour', 'day', 'week', 'month', 'year'].map((res) => (
          <TouchableOpacity
            key={res}
            style={[
              styles.resolutionButton,
              resolution === res && styles.resolutionButtonActive
            ]}
            onPress={() => setResolution(res as any)}
          >
            <Text style={[
              styles.resolutionText,
              resolution === res && styles.resolutionTextActive
            ]}>
              {res.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chart Container */}
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={280}
          spacing={calculateSpacing()}
          
          // ✅ Chart appearance
          color={chartConfig.color}
          thickness={3}
          startFillColor={chartConfig.gradientColor}
          endFillColor="transparent"
          startOpacity={0.4}
          endOpacity={0.1}
          areaChart={true}
          
          // ✅ Y-axis configuration
          yAxisColor="#E0E0E0"
          yAxisThickness={1}
          yAxisTextStyle={{ color: '#666', fontSize: 11 }}
          yAxisLabelSuffix={chartConfig.unit}
          noOfSections={Math.ceil((chartConfig.yAxisMax - chartConfig.yAxisMin) / chartConfig.stepValue)}
          maxValue={chartConfig.yAxisMax}
          stepValue={chartConfig.stepValue}
          
          // ✅ X-axis configuration
          xAxisColor="#E0E0E0"
          xAxisThickness={1}
          xAxisLabelTextStyle={{ color: '#666', fontSize: 10, fontWeight: '500' }}
          
          // ✅ Data points
          hideDataPoints={false}
          dataPointsColor={chartConfig.color}
          dataPointsRadius={4}
          dataPointsWidth={2}
          
          // ✅ Grid
          rulesType="solid"
          rulesColor="#F0F0F0"
          showVerticalLines={false}
          
          // ✅ Interactions (this is the magic - built-in swipe!)
          scrollToEnd={true}
          initialSpacing={10}
          
          // ✅ Labels and values
          textShiftY={-8}
          textFontSize={11}
          textColor={chartConfig.color}
          
          // ✅ Animation
          animationDuration={1200}
          animateOnDataChange={true}
        />
      </View>

      {/* Chart Info */}
      <View style={styles.infoContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Latest Value</Text>
          <Text style={[styles.statValue, { color: chartConfig.color }]}>
            {chartData.length > 0 ? `${chartData[chartData.length - 1].value.toFixed(1)}${chartConfig.unit}` : 'N/A'}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Average</Text>
          <Text style={[styles.statValue, { color: chartConfig.color }]}>
            {chartData.length > 0 
              ? `${(chartData.reduce((sum, point) => sum + point.value, 0) / chartData.length).toFixed(1)}${chartConfig.unit}`
              : 'N/A'
            }
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Data Points</Text>
          <Text style={[styles.statValue, { color: chartConfig.color }]}>
            {chartData.length}
          </Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructions}>
          ↔️ Swipe chart to navigate • 👆 Tap data points for values • 🔘 Change time period above
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A736A',
    marginBottom: 5,
  },
  dataInfo: {
    fontSize: 12,
    color: '#666',
  },
  resolutionContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resolutionContent: {
    paddingHorizontal: 15,
  },
  resolutionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  resolutionButtonActive: {
    backgroundColor: '#1A736A',
  },
  resolutionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  resolutionTextActive: {
    color: 'white',
  },
  chartContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  instructions: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 10,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
    borderRadius: 12,
    margin: 10,
    padding: 20,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    margin: 10,
    padding: 20,
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 8,
  },
  noDataMessage: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default React.memo(SensorChart);