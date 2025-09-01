import React from 'react';
import EmotionChart from './EmotionChart';
import { cn } from '@/lib/utils';
import type { Emotions, EmotionBundle } from '@/types/interfaces';

type EmotionChartPoint = {
  end_time: number;                 // נשמר כדי לא לשבור את EmotionChart
  [emotionLabel: string]: number;   // ערכים באחוזים (0-100)
};

interface EmotionChartsGridProps {
  emotionData: Emotions;            // <-- מקבל את Emotions מה-mappers
  currentTime?: number;
  selectedEmotions: string[];
  className?: string;
}

const speakerKeyOf = (bundle: EmotionBundle): string => {
  const who = bundle.who ?? bundle.segment?.writer ?? 'Unknown';
  const key = typeof who === 'number' ? String(who) : String(who || 'Unknown');
  // נשמור את המפתח עצמו (ללא "Speaker ") כי EmotionChart מכותר בעצמו
  return key.replace(/^Speaker\s*/i, '').trim() || 'Unknown';
};

const endTimeOf = (bundle: EmotionBundle): number =>
  (bundle.end_time ?? bundle.segment?.end_time ?? 0) || 0;

const scoresOf = (bundle: EmotionBundle): Record<string, number> => {
  // סדר עדיפויות: mixed > audio > text
  const src =
    bundle.mixed?.scores ??
    bundle.audio?.scores ??
    bundle.text?.scores ??
    {};
  return src;
};

const buildChartData = (
  emotionData: Emotions,
  selectedEmotions: string[]
): Record<string, EmotionChartPoint[]> => {
  const acc: Record<string, EmotionChartPoint[]> = {};

  for (const b of emotionData || []) {
    const spk = speakerKeyOf(b);
    const t1 = endTimeOf(b);
    const scores = scoresOf(b);

    const point: EmotionChartPoint = { end_time: Number(t1.toFixed(2)) };

    // נשמור רק את הרגשות המסומנים
    for (const label of selectedEmotions) {
      const v = scores[label] ?? scores[label.toLowerCase()];
      if (typeof v === 'number') {
        point[label.toLowerCase()] = Number((v * 100).toFixed(2)); // לאחוזים
      }
    }

    if (!acc[spk]) acc[spk] = [];
    acc[spk].push(point);
  }

  // אפשר למיין לפי הזמן
  for (const k of Object.keys(acc)) {
    acc[k].sort((a, b) => a.end_time - b.end_time);
  }

  return acc;
};

const EmotionChartsGrid: React.FC<EmotionChartsGridProps> = ({
  emotionData = [],
  currentTime,
  selectedEmotions,
  className,
}) => {
  const chartData = React.useMemo(
    () => buildChartData(emotionData, selectedEmotions),
    [emotionData, selectedEmotions]
  );

  const speakers = Object.keys(chartData);
  const speakerCount = speakers.length;

  const getActiveSpeaker = (): string | null => {
    if (currentTime == null || !emotionData.length) return null;
    const active = emotionData.find(
      (b) => (b.start_time ?? b.segment?.start_time ?? 0) <= currentTime &&
             currentTime <= (b.end_time ?? b.segment?.end_time ?? 0)
    );
    return active ? speakerKeyOf(active) : null;
  };

  const activeSpeaker = getActiveSpeaker();

  const getGridCols = () => {
    if (speakerCount === 1) return 'grid-cols-1';
    if (speakerCount === 2) return 'grid-cols-1 lg:grid-cols-2';
    if (speakerCount === 3) return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
    return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4';
  };

  if (!speakerCount) {
    return <div className="text-center text-gray-500 py-8">No emotion data available</div>;
  }

  return (
    <div className={cn('grid gap-4', getGridCols(), className)}>
      {speakers.map((speaker) => {
        const isActiveSpeaker = activeSpeaker === speaker;
        return (
          <div key={speaker} className="w-full">
            <EmotionChart
              data={chartData[speaker]}
              title={`Speaker ${speaker} - Emotional Analysis`}
              height={250}
              currentTime={currentTime}
              isActiveSpeaker={isActiveSpeaker}
            />
          </div>
        );
      })}
    </div>
  );
};

export default EmotionChartsGrid;
