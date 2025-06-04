import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from 'recharts';

interface EmotionChartPoint {
  end_time: string;
  [emotionLabel: string]: number | string;
}

interface EmotionChartProps {
  data: EmotionChartPoint[];
  title: string;
  height?: number;
  currentTime?: number;
}

const EmotionChart: React.FC<EmotionChartProps> = ({
  data,
  title,
  height = 200,
  currentTime
}) => {
  const getCurrentTimePosition = () => {
    if (currentTime === undefined || !data.length) return null;

    const timeData = data.map(point => ({
      ...point,
      timeValue: parseFloat(point.end_time) || 0
    }));

    const closestPoint = timeData.reduce((closest, current) =>
      Math.abs(current.timeValue - currentTime) < Math.abs(closest.timeValue - currentTime)
        ? current
        : closest
    );

    return closestPoint.end_time;
  };

  const currentTimePosition = getCurrentTimePosition();

  return (
    <div className="p-6 glass-card rounded-lg card-hover animate-fade-in">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="end_time" tick={{ fontSize: 12 }} stroke="#888" />
          <YAxis tick={{ fontSize: 12 }} stroke="#888" />
          <Tooltip />
          <Legend />

          {currentTimePosition && (
            <ReferenceLine
              x={currentTimePosition}
              stroke="#ff6b6b"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}

          {data.length > 0 &&
            Object.keys(data[0])
              .filter(key => key !== 'end_time')
              .map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  strokeWidth={2}
                  stroke={`hsl(${(i * 60) % 360}, 70%, 45%)`}
                  dot={false}
                />
              ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmotionChart;
