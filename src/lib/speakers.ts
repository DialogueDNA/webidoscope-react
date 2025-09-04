import { User, Users, UserCheck, Crown, Star, Shield } from 'lucide-react';

export interface SpeakerConfig {
  icon: any;
  baseColor: string;
  name: string;
}

// Default speaker configurations with consistent colors and icons
export const defaultSpeakerConfigs: SpeakerConfig[] = [
  {
    icon: User,
    baseColor: 'hsl(214, 90%, 50%)', // Blue
    name: 'Speaker 1'
  },
  {
    icon: Users,
    baseColor: 'hsl(142, 71%, 45%)', // Green
    name: 'Speaker 2'
  },
  {
    icon: UserCheck,
    baseColor: 'hsl(280, 100%, 60%)', // Purple
    name: 'Speaker 3'
  },
  {
    icon: Crown,
    baseColor: 'hsl(25, 95%, 53%)', // Orange
    name: 'Speaker 4'
  },
  {
    icon: Star,
    baseColor: 'hsl(336, 84%, 57%)', // Pink
    name: 'Speaker 5'
  },
  {
    icon: Shield,
    baseColor: 'hsl(196, 100%, 47%)', // Cyan
    name: 'Speaker 6'
  }
];

export const getSpeakerConfig = (speakerName: string): SpeakerConfig => {
  // Extract speaker number from names like "Speaker 1", "Speaker 2", etc.
  const match = speakerName.match(/Speaker (\d+)/i);
  if (match) {
    const speakerIndex = parseInt(match[1]) - 1;
    if (speakerIndex < defaultSpeakerConfigs.length) {
      return {
        ...defaultSpeakerConfigs[speakerIndex],
        name: speakerName
      };
    }
  }

  // For custom named speakers, use hash to consistently assign colors
  const hash = speakerName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const configIndex = Math.abs(hash) % defaultSpeakerConfigs.length;
  return {
    ...defaultSpeakerConfigs[configIndex],
    name: speakerName
  };
};

export const getEmotionGlowColor = (dominantEmotion: string): string => {
  const emotion = dominantEmotion.toLowerCase();
  
  // Map emotions to glow colors
  if (['joy', 'happiness', 'positive', 'excited', 'pleased'].includes(emotion)) {
    return 'hsl(142, 71%, 45%)'; // Green glow for positive
  }
  
  if (['anger', 'sadness', 'fear', 'negative', 'frustrated', 'disappointed'].includes(emotion)) {
    return 'hsl(0, 84%, 57%)'; // Red glow for negative
  }
  
  // Default to gray for neutral/unknown emotions
  return 'hsl(210, 10%, 60%)'; // Gray glow for neutral
};

export const getDominantEmotion = (emotionData: any[], speakerName: string, currentTime: number): string | null => {
  if (!emotionData || !Array.isArray(emotionData) || currentTime === undefined) return null;
  
  // Find the most recent emotion entry for this speaker at the current time
  const speakerEntries = emotionData
    .filter(entry => 
      entry.speaker !== undefined && 
      entry.emotions && 
      Array.isArray(entry.emotions) &&
      entry.end_time <= currentTime
    )
    .sort((a, b) => b.end_time - a.end_time);
  
  if (speakerEntries.length === 0) return null;
  
  const latestEntry = speakerEntries[0];
  if (!latestEntry.emotions || latestEntry.emotions.length === 0) return null;
  
  // Find the emotion with the highest score
  const dominantEmotion = latestEntry.emotions.reduce((max, current) => 
    current.score > max.score ? current : max
  );
  
  return dominantEmotion.label || null;
};