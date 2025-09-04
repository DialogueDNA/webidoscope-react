import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Smile, 
  Frown, 
  Heart, 
  TrendingUp, 
  Clock,
  BarChart3
} from 'lucide-react';

interface MetricsCardsProps {
  emotionData: any[];
  duration: number;
}

interface Metrics {
  averagePositive: number;
  averageNegative: number;
  peakCount: number;
  calmRatio: number;
  dominantEmotion: string;
  emotionalVariability: number;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ emotionData, duration }) => {
  const metrics = React.useMemo((): Metrics => {
    if (!emotionData || !Array.isArray(emotionData) || emotionData.length === 0) {
      return {
        averagePositive: 0,
        averageNegative: 0,
        peakCount: 0,
        calmRatio: 0,
        dominantEmotion: 'neutral',
        emotionalVariability: 0
      };
    }

    const positiveEmotions = ['joy', 'happiness', 'excitement', 'love'];
    const negativeEmotions = ['anger', 'sadness', 'fear', 'disgust', 'anxiety'];
    const calmEmotions = ['calm', 'neutral', 'contentment'];

    let totalPositive = 0;
    let totalNegative = 0;
    let totalCalm = 0;
    let peakCount = 0;
    let totalEntries = 0;
    const emotionCounts: Record<string, number> = {};
    const emotionScores: number[] = [];

    emotionData.forEach((entry) => {
      if (!entry.emotions || !Array.isArray(entry.emotions)) return;

      entry.emotions.forEach((emotion: any) => {
        const label = emotion.label.toLowerCase();
        const score = emotion.score;
        
        emotionScores.push(score);
        emotionCounts[label] = (emotionCounts[label] || 0) + 1;
        totalEntries++;

        if (positiveEmotions.includes(label)) {
          totalPositive += score;
        } else if (negativeEmotions.includes(label)) {
          totalNegative += score;
        } else if (calmEmotions.includes(label)) {
          totalCalm += score;
        }

        // Count as peak if score > 0.7
        if (score > 0.7) {
          peakCount++;
        }
      });
    });

    const avgPositive = totalEntries > 0 ? (totalPositive / totalEntries) * 100 : 0;
    const avgNegative = totalEntries > 0 ? (totalNegative / totalEntries) * 100 : 0;
    const calmRatio = totalEntries > 0 ? (totalCalm / totalEntries) * 100 : 0;

    // Find dominant emotion
    const dominantEmotion = Object.entries(emotionCounts).reduce((a, b) =>
      emotionCounts[a[0]] > emotionCounts[b[0]] ? a : b
    )?.[0] || 'neutral';

    // Calculate emotional variability (standard deviation of scores)
    const mean = emotionScores.length > 0 ? emotionScores.reduce((a, b) => a + b, 0) / emotionScores.length : 0;
    const variance = emotionScores.length > 0 
      ? emotionScores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / emotionScores.length 
      : 0;
    const emotionalVariability = Math.sqrt(variance) * 100;

    return {
      averagePositive: Math.round(avgPositive),
      averageNegative: Math.round(avgNegative),
      peakCount,
      calmRatio: Math.round(calmRatio),
      dominantEmotion,
      emotionalVariability: Math.round(emotionalVariability)
    };
  }, [emotionData]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const getEmotionIcon = (emotion: string) => {
    const icons: Record<string, React.ReactNode> = {
      joy: <Smile className="h-4 w-4" />,
      happiness: <Smile className="h-4 w-4" />,
      anger: <Frown className="h-4 w-4" />,
      sadness: <Frown className="h-4 w-4" />,
      love: <Heart className="h-4 w-4" />,
      fear: <TrendingUp className="h-4 w-4" />
    };
    return icons[emotion.toLowerCase()] || <BarChart3 className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Positive Emotions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Emotions</CardTitle>
            <Smile className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.averagePositive}%</div>
            <p className="text-xs text-muted-foreground">Average intensity</p>
          </CardContent>
        </Card>

        {/* Negative Emotions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Negative Emotions</CardTitle>
            <Frown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.averageNegative}%</div>
            <p className="text-xs text-muted-foreground">Average intensity</p>
          </CardContent>
        </Card>

        {/* Emotional Peaks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emotional Peaks</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.peakCount}</div>
            <p className="text-xs text-muted-foreground">High-intensity moments</p>
          </CardContent>
        </Card>

        {/* Calm Ratio */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calm Ratio</CardTitle>
            <Heart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.calmRatio}%</div>
            <p className="text-xs text-muted-foreground">Time spent calm</p>
          </CardContent>
        </Card>

        {/* Session Duration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(duration)}</div>
            <p className="text-xs text-muted-foreground">Total session time</p>
          </CardContent>
        </Card>

        {/* Dominant Emotion */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dominant Emotion</CardTitle>
            {getEmotionIcon(metrics.dominantEmotion)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{metrics.dominantEmotion}</div>
            <p className="text-xs text-muted-foreground">Most frequent emotion</p>
          </CardContent>
        </Card>
      </div>

      {/* Emotional Variability */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Emotional Variability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{metrics.emotionalVariability}%</div>
              <p className="text-sm text-muted-foreground">
                {metrics.emotionalVariability > 50 
                  ? 'High emotional fluctuation throughout the session' 
                  : 'Relatively stable emotional state'}
              </p>
            </div>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                style={{ width: `${Math.min(metrics.emotionalVariability, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsCards;