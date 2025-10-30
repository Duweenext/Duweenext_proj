import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Svg, G, Path, Circle, Rect, Text as SvgText, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as d3 from 'd3-scale';
import * as d3Shape from 'd3-shape';
import { ChartTheme } from './chartTheme'; // Adjust path if needed

interface DataPoint {
  value: number;
  label: string;
  dataPointText: string;
}

interface D3LineChartProps {
  data: DataPoint[];
  height: number;
  maxValue: number;
  yAxisSuffix: string;
  theme: ChartTheme; 
  spacing: number;
  initialSpacing?: number;
}

const MARGIN = { top: 20, right: 20, bottom: 40, left: 40 };

const D3LineChart: React.FC<D3LineChartProps> = ({
  data,
  height,
  maxValue,
  yAxisSuffix,
  theme,
  spacing,
  initialSpacing = 0, 
}) => {
  const { innerWidth, totalWidth } = useMemo(() => {
    const inner = (data.length > 0 ? data.length - 1 : 0) * spacing;
    const total = MARGIN.left + initialSpacing + inner + MARGIN.right;
    return { innerWidth: inner, totalWidth: total };
  }, [data.length, spacing, initialSpacing]);
  
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const { xScale, yScale } = useMemo(() => {
    const xScale = d3
      .scalePoint()
      .domain(data.map(d => d.label)) // Labels can be duplicates
      .range([0, innerWidth])
      .padding(0); 
    
    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([innerHeight, 0]);
      
    return { xScale, yScale };
  }, [data, innerWidth, innerHeight, maxValue]); 

  const { linePath, areaPath } = useMemo(() => {
    const lineGenerator = d3Shape
      .line<DataPoint>()
      // --- MODIFIED --- Use index `i` to get x position
      .x((d, i) => xScale(xScale.domain()[i]) ?? 0)
      .y(d => yScale(d.value))
      .curve(d3Shape.curveMonotoneX); 
    const areaGenerator = d3Shape
      .area<DataPoint>()
      // --- MODIFIED --- Use index `i` to get x position
      .x((d, i) => xScale(xScale.domain()[i]) ?? 0)
      .y0(innerHeight) 
      .y1(d => yScale(d.value))
      .curve(d3Shape.curveMonotoneX);
    return {
      linePath: lineGenerator(data) || '',
      areaPath: areaGenerator(data) || '',
    };
  }, [data, xScale, yScale, innerHeight]);

  const yTicks = useMemo(() => {
    return yScale.ticks(5).map(value => ({ 
      value,
      yOffset: yScale(value),
    }));
  }, [yScale]);

  // --- MODIFIED --- Get index for a unique key
  const xTicks = useMemo(() => {
    if (!xScale.domain()) {
      return [];
    }
    return xScale.domain().map((label, index) => ({
      label,
      index,
      xOffset: xScale(label),
    }));
  }, [xScale]);

  if (data.length === 0) {
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
        <LinearGradient id="area-gradient" x1="0" y1="0" x2="0" y2={innerHeight}>
          <Stop offset="0" stopColor={theme.areaColor} stopOpacity="0.45" />
          <Stop offset="1" stopColor={theme.areaColor} stopOpacity="0.05" />
        </LinearGradient>
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

          {/* --- MODIFIED --- Use index `i` for key */}
          {data.map((d, i) => (
            <Line
              key={`v-line-${i}`}
              x1={xScale(xScale.domain()[i])}
              x2={xScale(xScale.domain()[i])}
              y1={0}
              y2={innerHeight}
              stroke={theme.textColor}
              strokeOpacity={0.2}
            />
          ))}

          {/* --- MODIFIED --- Use tick.index for key */}
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
          
          <Path
            d={areaPath}
            fill="url(#area-gradient)"
          />
          
          <Path
            d={linePath}
            stroke={theme.lineColor} 
            strokeWidth={2}
            fill="none"
          />

          {/* --- MODIFIED --- Use index `i` for key */}
          {data.map((d, i) => (
            <Circle
              key={`circle-${i}`}
              cx={xScale(xScale.domain()[i])}
              cy={yScale(d.value)}
              r={4}
              fill={theme.lineColor} 
            />
          ))}

          {/* --- MODIFIED --- Use index `i` for key */}
          {data.map((d, i) => (
            d.dataPointText && (
              <SvgText
                key={`text-${i}`}
                x={xScale(xScale.domain()[i])}
                y={yScale(d.value) - 8} 
                textAnchor="middle"
                fontSize={10}
                fill={theme.textColor}
              >
                {d.dataPointText}
              </SvgText>
            )
          ))}
        </G>
      </G>
    </Svg>
  );
};

export default D3LineChart;