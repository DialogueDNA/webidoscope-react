
import React from 'react';
import EmotionChart from './EmotionChart';
import { cn } from '@/lib/utils';

interface EmotionChartPoint {
  start_time: string;
  [emotionLabel: string]: number | string;
}

interface EmotionChartsGridProps {
  chartData: { [speaker: string]: EmotionChartPoint[] };
  currentTime?: number;
  selectedEmotions: string[];
  className?: string;
}

const EmotionChartsGrid: React.FC<EmotionChartsGridProps> = ({
  chartData,
  currentTime,
  selectedEmotions,
  className
}) => {
  const speakers = Object.keys(chartData);
  const speakerCount = speakers.length;

  // Determine grid layout based on speaker count and screen size
  const getGridCols = () => {
    if (speakerCount === 1) return "grid-cols-1";
    if (speakerCount === 2) return "grid-cols-1 lg:grid-cols-2";
    if (speakerCount === 3) return "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
    return "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";
  };

  // Filter chart data to only include selected emotions
  const filterChartData = (data: EmotionChartPoint[]): EmotionChartPoint[] => {
    return data.map(point => {
      const filteredPoint: EmotionChartPoint = { start_time: point.start_time };
      
      selectedEmotions.forEach(emotion => {
        if (emotion in point) {
          filteredPoint[emotion] = point[emotion];
        }
      });
      
      return filteredPoint;
    });
  };

  if (speakerCount === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No emotion data available
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", getGridCols(), className)}>
      {speakers.map((speaker) => (
        <div key={speaker} className="w-full">
          <EmotionChart
            data={filterChartData(chartData[speaker])}
            title={`${speaker} - Emotional Analysis`}
            height={250}
            currentTime={currentTime}
          />
        </div>
      ))}
    </div>
  );
};

export default EmotionChartsGrid;
