import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
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
  
  // ✅ Gesture state management
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [lastScale, setLastScale] = useState(1);
  const [lastTranslateX, setLastTranslateX] = useState(0);
  const [lastTranslateY, setLastTranslateY] = useState(0);

  // ✅ Animated values for smooth interactions
  const animatedScale = useRef(new Animated.Value(1)).current;
  const animatedTranslateX = useRef(new Animated.Value(0)).current;
  const animatedTranslateY = useRef(new Animated.Value(0)).current;

  // ✅ Pinch gesture handler for zoom
  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: animatedScale } }],
    { useNativeDriver: true }
  );

  const onPinchHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      // ✅ Save the final scale when pinch ends
      const newScale = Math.max(0.5, Math.min(lastScale * event.nativeEvent.scale, 3));
      setLastScale(newScale);
      setScale(newScale);
      
      // ✅ Reset animated value
      animatedScale.setValue(1);
      
      // ✅ Animate to final position
      Animated.spring(animatedScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  // ✅ Pan gesture handler for dragging
  const onPanGestureEvent = Animated.event(
    [{ 
      nativeEvent: { 
        translationX: animatedTranslateX,
        translationY: animatedTranslateY,
      } 
    }],
    { useNativeDriver: true }
  );

  const onPanHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      // ✅ Save the final translation when pan ends
      const newTranslateX = lastTranslateX + event.nativeEvent.translationX;
      const newTranslateY = lastTranslateY + event.nativeEvent.translationY;
      
      // ✅ Apply boundaries to prevent over-panning
      const maxTranslateX = (scale - 1) * chartWidth * 0.5;
      const maxTranslateY = (scale - 1) * 150; // Half chart height
      
      const boundedX = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
      const boundedY = Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY));
      
      setLastTranslateX(boundedX);
      setLastTranslateY(boundedY);
      setTranslateX(boundedX);
      setTranslateY(boundedY);
      
      // ✅ Reset animated values
      animatedTranslateX.setValue(0);
      animatedTranslateY.setValue(0);
    }
  };

  // ✅ Calculate combined transform for the chart
  const chartTransform = [
    { translateX: Animated.add(animatedTranslateX, lastTranslateX) },
    { translateY: Animated.add(animatedTranslateY, lastTranslateY) },
    { scale: Animated.multiply(animatedScale, lastScale) },
  ];

  // ✅ Double tap to reset zoom and pan
  const handleDoubleTab = () => {
    setScale(1);
    setLastScale(1);
    setTranslateX(0);
    setTranslateY(0);
    setLastTranslateX(0);
    setLastTranslateY(0);
    
    // ✅ Animate reset
    Animated.parallel([
      Animated.spring(animatedScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(animatedTranslateX, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(animatedTranslateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View>
      <Text style={styles.chartTitle}>{title}</Text>
      
      <View style={styles.chartContainer}>
        <PanGestureHandler
          onGestureEvent={onPanGestureEvent}
          onHandlerStateChange={onPanHandlerStateChange}
          minPointers={1}
          maxPointers={1}
          enabled={scale > 1} // ✅ Only allow pan when zoomed in
        >
          <Animated.View>
            <PinchGestureHandler
              onGestureEvent={onPinchGestureEvent}
              onHandlerStateChange={onPinchHandlerStateChange}
            >
              <Animated.View style={styles.chartWrapper}>
                <Animated.View
                  style={[
                    styles.chartInner,
                    { transform: chartTransform }
                  ]}
                >
                  <VictoryChart
                    theme={VictoryTheme.material}
                    height={300}
                    width={chartWidth}
                    domain={{ y: [4, 9] }}
                    padding={{ left: 60, top: 20, right: 40, bottom: 60 }}
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
                      labelComponent={
                        <VictoryLabel 
                          dy={-15} 
                          style={{ fontSize: 11, fill: "#1A736A", fontWeight: "bold" }} 
                        />
                      }
                      labels={({ datum }) => `${datum.y}°C`}
                    />
                  </VictoryChart>
                </Animated.View>
              </Animated.View>
            </PinchGestureHandler>
          </Animated.View>
        </PanGestureHandler>
        
        {/* ✅ Instructions overlay */}
        <View style={styles.instructionsOverlay}>
          <Text style={styles.instructions}>
            📌 Pinch to zoom • 👆 Drag to pan • 🔄 Double tap to reset
          </Text>
          <Text style={styles.zoomIndicator}>
            Zoom: {(lastScale * 100).toFixed(0)}%
          </Text>
        </View>
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
  chartContainer: {
    position: 'relative',
    height: 320,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden', // ✅ Prevent chart from overflowing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartWrapper: {
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartInner: {
    // ✅ This view will be transformed
  },
  instructionsOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
    zIndex: 1,
  },
  instructions: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  zoomIndicator: {
    fontSize: 12,
    color: '#1A736A',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default SensorChart;