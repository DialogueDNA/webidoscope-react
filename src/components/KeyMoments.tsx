import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface KeyMomentsProps {
  emotionData: any[];
  onMomentClick: (timestamp: number) => void;
}

interface Peak {
  timestamp: number;
  emotion: string;
  score: number;
  speaker: string;
  text: string;
}

const KeyMoments: React.FC<KeyMomentsProps> = ({ emotionData, onMomentClick }) => {
  const detectPeaks = React.useMemo(() => {
    if (!emotionData || !Array.isArray(emotionData)) return [];

    const peaks: Peak[] = [];
    const threshold = 0.7;
    const minDistance = 8; // seconds

    emotionData.forEach((entry) => {
      if (!entry.emotions || !Array.isArray(entry.emotions)) return;
      
      entry.emotions.forEach((emotion: any) => {
        if (emotion.score >= threshold) {
          const timestamp = entry.start_time || 0;
          
          // Check if this peak is far enough from existing peaks
          const tooClose = peaks.some(p => 
            Math.abs(p.timestamp - timestamp) < minDistance
          );
          
          if (!tooClose) {
            peaks.push({
              timestamp,
              emotion: emotion.label,
              score: emotion.score,
              speaker: entry.speaker || 'Unknown',
              text: (entry.text || '').substring(0, 100)
            });
          }
        }
      });
    });

    return peaks
      .sort((a, b) => b.score - a.score) // Sort by highest score first
      .slice(0, 10); // Limit to top 10 peaks
  }, [emotionData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      joy: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      anger: 'text-red-600 bg-red-50 border-red-200',
      sadness: 'text-blue-600 bg-blue-50 border-blue-200',
      fear: 'text-purple-600 bg-purple-50 border-purple-200',
      surprise: 'text-orange-600 bg-orange-50 border-orange-200',
      disgust: 'text-green-600 bg-green-50 border-green-200'
    };
    return colors[emotion.toLowerCase()] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (detectPeaks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <TrendingUp className="h-8 w-8 mr-3" />
        <p>No significant emotional peaks detected in this session.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Emotional Peaks</h3>
        <span className="text-sm text-muted-foreground">({detectPeaks.length} moments)</span>
      </div>

      <div className="grid gap-3">
        {detectPeaks.map((peak, index) => (
          <Card 
            key={`${peak.timestamp}-${index}`}
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
            onClick={() => onMomentClick(peak.timestamp)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatTime(peak.timestamp)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEmotionColor(peak.emotion)}`}>
                      {peak.emotion}
                    </span>
                    <span className="text-sm font-medium">
                      {Math.round(peak.score * 100)}%
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-sm font-medium text-foreground">
                      {peak.speaker}:
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {peak.text}
                    {peak.text.length >= 100 && '...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default KeyMoments;