
import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from 'recharts';

interface EmotionChartPoint {
  end_time: number;
  [emotionLabel: string]: number;
}

interface EmotionChartProps {
  data: EmotionChartPoint[];
  title: string;
  height?: number;
  currentTime?: number;
  isActiveSpeaker?: boolean;
}

const EmotionChart: React.FC<EmotionChartProps> = ({
  data,
  title,
  height = 200,
  currentTime,
  isActiveSpeaker = false
}) => {
  const maxEndTime = Math.max(...data.map(d => d.end_time as number));
  const getCurrentTimePosition = () => {
    if (currentTime === undefined || !data.length) return null;

    const timeData = data.map(point => ({
      ...point,
      timeValue: point.end_time || 0
    }));

    const closestPoint = timeData.reduce((closest, current) =>
      Math.abs(current.timeValue - currentTime) < Math.abs(closest.timeValue - currentTime)
        ? current
        : closest
    );

    return closestPoint.end_time;
  };

  const currentTimePosition = getCurrentTimePosition();

  // Styling based on speaker activity - muted palette
  const getLineStyle = (index: number) => {
    const baseHue = (index * 45) % 360; // More spread out hues
    if (isActiveSpeaker) {
      return {
        strokeWidth: 2.5,
        stroke: `hsl(${baseHue}, 65%, 55%)`,
        opacity: 0.9
      };
    } else {
      return {
        strokeWidth: 1.5,
        stroke: `hsl(${baseHue}, 35%, 65%)`,
        opacity: 0.6
      };
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-xl p-4 shadow-soft">
          <h4 className="font-heading text-sm font-medium text-foreground mb-2">
            Time: {formatTime(label)}
          </h4>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-mono text-muted-foreground">{entry.name}:</span>
              <span className="font-medium text-foreground">
                {(entry.value * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const chartOpacity = isActiveSpeaker ? 1 : 0.7;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={`creative-card transition-all duration-300 ${
        isActiveSpeaker ? 'ring-2 ring-primary shadow-highlight' : 'hover:shadow-soft'
      }`}
      style={{ opacity: chartOpacity }}
    >
      <div className="p-6">
        <h3 className={`font-heading text-lg font-medium mb-4 transition-all duration-300 ${
          isActiveSpeaker ? 'text-primary' : 'text-foreground'
        }`}>
          {title} {isActiveSpeaker && '🎤'}
        </h3>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="end_time"
              type="number"
              domain={[0, maxEndTime]}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={formatTime}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                fontSize: '12px',
                color: 'hsl(var(--muted-foreground))'
              }}
            />

            {currentTime !== undefined && (
              <ReferenceLine
                x={currentTime}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            )}

            {data.length > 0 &&
              Object.keys(data[0])
                .filter(key => key !== 'end_time')
                .map((key, i) => {
                  const lineStyle = getLineStyle(i);
                  return (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      strokeWidth={lineStyle.strokeWidth}
                      stroke={lineStyle.stroke}
                      opacity={lineStyle.opacity}
                      dot={false}
                      activeDot={{ r: 4, fill: lineStyle.stroke }}
                    />
                  );
                })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default EmotionChart;
