
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface EmotionChartProps {
  data: {
    name: string;
    value: number;
  }[];
  title: string;
  height?: number;
}

const EmotionChart: React.FC<EmotionChartProps> = ({ data, title, height = 200 }) => {
  return (
    <div className="p-6 glass-card rounded-lg card-hover animate-fade-in">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#888" />
          <YAxis tick={{ fontSize: 12 }} stroke="#888" />
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
