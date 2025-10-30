import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Svg, G, Path, Circle, Rect, Text as SvgText, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as d3 from 'd3-scale';
import * as d3Shape from 'd3-shape';
import { ChartTheme } from '@/src/component/Card/CardSensorPrimary/chartTheme'; // Adjust this path!

// Interface for a single point
interface DataPoint {
  value: number;
  label: string;
  dataPointText: string; // --- ADDED ---
}

// Interface for one series (e.g., "Temperature")
export interface D3ChartSeries {
  data: DataPoint[];
  lineColor: string;
  areaColor: string;
}

interface D3MultiLineChartProps {
  series: D3ChartSeries[]; // An array of series to plot
  height: number;
  maxValue: number;
  yAxisSuffix: string;
  theme: ChartTheme; 
  spacing: number;
  initialSpacing?: number;
}

const MARGIN = { top: 20, right: 20, bottom: 40, left: 40 };

const D3MultiLineChart: React.FC<D3MultiLineChartProps> = ({
  series,
  height,
  maxValue,
  yAxisSuffix,
  theme,
  spacing,
  initialSpacing = 0,
}) => {
  const xAxisData = series[0]?.data || [];
  // --- Create a stable array of domain labels ---
  const xDomain = useMemo(() => xAxisData.map(d => d.label), [xAxisData]);

  const { innerWidth, totalWidth } = useMemo(() => {
    const inner = (xAxisData.length > 0 ? xAxisData.length - 1 : 0) * spacing;
    const total = MARGIN.left + initialSpacing + inner + MARGIN.right;
    return { innerWidth: inner, totalWidth: total };
  }, [xAxisData.length, spacing, initialSpacing]);
  
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const { xScale, yScale } = useMemo(() => {
    const xScale = d3
      .scalePoint()
      .domain(xDomain) // Use the stable domain
      .range([0, innerWidth])
      .padding(0); 
    
    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([innerHeight, 0]);
      
    return { xScale, yScale };
  }, [xDomain, innerWidth, innerHeight, maxValue]); 

  // --- MODIFIED --- Use index `i` to get the correct x-position
  const lineGenerator = d3Shape
    .line<DataPoint>()
    .x((d, i) => xScale(xDomain[i]) ?? 0)
    .y(d => yScale(d.value))
    .curve(d3Shape.curveMonotoneX); 
  
  // --- MODIFIED --- Use index `i` to get the correct x-position
  const areaGenerator = d3Shape
    .area<DataPoint>()
    .x((d, i) => xScale(xDomain[i]) ?? 0)
    .y0(innerHeight) 
    .y1(d => yScale(d.value))
    .curve(d3Shape.curveMonotoneX);

  const yTicks = useMemo(() => {
    return yScale.ticks(5).map(value => ({ 
      value,
      yOffset: yScale(value),
    }));
  }, [yScale]);

  const xTicks = useMemo(() => {
    return xDomain.map((label, index) => ({
      label,
      index, // Get the index for a unique key
      xOffset: xScale(label),
    }));
  }, [xDomain, xScale]);
  
  if (xAxisData.length === 0) {
    return (
       <View style={{ width: totalWidth, height, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.backgroundColor }}>
         <SvgText fill={theme.textColor}>
           No log from the chosen time
         </SvgText>
       </View>
    )
  }

  return (
    <Svg width={totalWidth} height={height}>
      <Defs>
        {series.map((s, i) => (
          <LinearGradient key={i} id={`area-gradient-${i}`} x1="0" y1="0" x2="0" y2={innerHeight}>
            <Stop offset="0" stopColor={s.areaColor} stopOpacity="0.45" />
            <Stop offset="1" stopColor={s.areaColor} stopOpacity="0.05" />
          </LinearGradient>
        ))}
      </Defs>

      <Rect x={0} y={0} width={totalWidth} height={height} fill={theme.backgroundColor} />

      <G x={MARGIN.left} y={MARGIN.top}>
        
        {yTicks.map(tick => (
          <SvgText
            key={tick.value}
            x={-8} 
            y={tick.yOffset}
            dy="4"
            textAnchor="end"
            fill={theme.textColor}
            fontSize={10}
          >
            {tick.value} {yAxisSuffix}
          </SvgText>
        ))}

        <G x={initialSpacing}>
          {yTicks.map(tick => (
            <G key={tick.value} transform={`translate(0, ${tick.yOffset})`}>
              <Line
                x1={0}
                x2={innerWidth}
                stroke={theme.textColor} 
                strokeOpacity={0.2}
                strokeDasharray="4"
              />
            </G>
          ))}

          {xTicks.map(tick => (
            <Line
              key={`v-line-${tick.index}`}
              x1={tick.xOffset}
              x2={tick.xOffset}
              y1={0}
              y2={innerHeight}
              stroke={theme.textColor}
              strokeOpacity={0.2}
            />
          ))}

          {xTicks.map(tick => (
            <SvgText
              key={`x-label-${tick.index}`}
              x={tick.xOffset}
              y={innerHeight + 20} 
              textAnchor="middle"
              fill={theme.textColor}
              fontSize={10}
            >
              {tick.label}
            </SvgText>
          ))}
          
          {series.map((s, i) => (
            <G key={i}>
              <Path
                d={areaGenerator(s.data) || ''}
                fill={`url(#area-gradient-${i})`}
              />
              <Path
                d={lineGenerator(s.data) || ''}
                stroke={s.lineColor}
                strokeWidth={2}
                fill="none"
              />
              {/* --- MODIFIED --- Use index `j` to get correct x-position */}
              {s.data.map((d, j) => (
                <Circle
                  key={`circle-${i}-${j}`}
                  cx={xScale(xDomain[j])} 
                  cy={yScale(d.value)}
                  r={4}
                  fill={s.lineColor} 
                />
              ))}

              {/* --- NEW --- Loop to add data point text */}
              {s.data.map((d, j) => (
                d.dataPointText && (
                  <SvgText
                    key={`text-${i}-${j}`}
                    x={xScale(xDomain[j])} // Use index
                    y={yScale(d.value) - 8} // Position above point
                    textAnchor="middle"
                    fontSize={10}
                    fill={theme.textColor}
                  >
                    {d.dataPointText}
                  </SvgText>
                )
              ))}
            </G>
          ))}
        </G>
      </G>
    </Svg>
  );
};

export default D3MultiLineChart;