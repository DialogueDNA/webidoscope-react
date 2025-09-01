import React from 'react';
import { cn } from '@/lib/utils';
import type { Transcript, TranscriptSegment } from '@/types/interfaces';

interface MessageProps {
  speaker: string;
  text: string;
  index: number;
  isHighlighted?: boolean;
}

const Message: React.FC<MessageProps> = ({ speaker, text, index, isHighlighted = false }) => {
  return (
    <div
      className={cn(
        'p-4 rounded-lg mb-3 animate-slide-in transition-all duration-300',
        isHighlighted
          ? 'bg-yellow-100 border-2 border-yellow-400 shadow-md'
          : 'bg-white border border-gray-100 shadow-sm'
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="font-medium text-sm mb-1">{speaker}:</div>
      <div className="text-gray-700 whitespace-pre-wrap">{text}</div>
    </div>
  );
};

interface TranscriptionCardProps {
  segments: Transcript;           // <-- במקום messages הישנים
  title?: string;
  currentTime?: number;
}

const labelFor = (writer: TranscriptSegment['writer']): string => {
  if (typeof writer === 'number') return `Speaker ${writer}`;
  if (typeof writer === 'string' && writer.trim()) return writer;
  return 'Speaker';
};

const TranscriptionCard: React.FC<TranscriptionCardProps> = ({
  segments,
  title = '',
  currentTime,
}) => {
  const currentIndex = React.useMemo(() => {
    if (currentTime == null || !segments.length) return -1;
    const idx = segments.findIndex((s) => {
      const t0 = s.start_time ?? 0;
      const t1 = s.end_time ?? Number.POSITIVE_INFINITY;
      return t0 <= currentTime && currentTime <= t1;
    });
    return idx >= 0 ? idx : -1;
  }, [segments, currentTime]);

  return (
    <div className="glass-card rounded-lg overflow-hidden h-full flex flex-col animate-fade-in">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {segments.map((seg, index) => (
          <Message
            key={index}
            speaker={labelFor(seg.writer)}
            text={seg.text}
            index={index}
            isHighlighted={index === currentIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default TranscriptionCard;
