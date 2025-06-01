
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';

/**
 * Props for the EmotionChart component.
 * @property data - Array of data points, each with a name (x-axis) and value (y-axis).
 * @property title - Title displayed above the chart.
 * @property height - Optional height of the chart in pixels (default: 200).
 * @property currentTime - Current playback time to highlight on the chart.
 */
interface EmotionChartProps {
  data: {
    name: string;   // Label for the x-axis (e.g., time or category)
    value: number;  // Value for the y-axis (e.g., emotion score)
  }[];
  title: string;
  height?: number;
  currentTime?: number;
}

/**
 * EmotionChart displays a responsive line chart using the recharts library.
 * It visualizes an array of data points with a title and optional current time indicator.
 */
const EmotionChart: React.FC<EmotionChartProps> = ({ 
  data, 
  title, 
  height = 200, 
  currentTime 
}) => {
  // Find the closest data point to the current time for highlighting
  const getCurrentTimePosition = () => {
    if (currentTime === undefined || !data.length) return null;
    
    // Convert time names to numbers for comparison
    const timeData = data.map(point => ({
      ...point,
      timeValue: parseFloat(point.name) || 0
    }));
    
    const closestPoint = timeData.reduce((closest, current) => 
      Math.abs(current.timeValue - currentTime) < Math.abs(closest.timeValue - currentTime)
        ? current
        : closest
    );
    
    return closestPoint.name;
  };

  const currentTimePosition = getCurrentTimePosition();

  return (
    // Container with styling for padding, rounded corners, and animation
    <div className="p-6 glass-card rounded-lg card-hover animate-fade-in">
      {/* Chart title */}
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      {/* Responsive chart container */}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          {/* Grid lines */}
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          {/* X-axis using 'name' from data */}
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#888" />
          {/* Y-axis using 'value' from data */}
          <YAxis tick={{ fontSize: 12 }} stroke="#888" />
          
          {/* Current time indicator */}
          {currentTimePosition && (
            <ReferenceLine 
              x={currentTimePosition} 
              stroke="#ff6b6b" 
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}
          
          {/* Line representing the data */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#000"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6, stroke: "#000", strokeWidth: 2, fill: "#fff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmotionChart;
