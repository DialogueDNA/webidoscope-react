
import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getSpeakerConfig, getEmotionGlowColor, getDominantEmotion } from '@/lib/speakers';

interface MessageProps {
  speaker: string;
  text: string;
  index: number;
  isHighlighted?: boolean;
  emotionData?: any[];
  currentTime?: number;
}

const Message: React.FC<MessageProps> = ({ speaker, text, index, isHighlighted = false, emotionData, currentTime }) => {
  const speakerConfig = getSpeakerConfig(speaker);
  const dominantEmotion = getDominantEmotion(emotionData || [], speaker, currentTime || 0);
  const glowColor = dominantEmotion ? getEmotionGlowColor(dominantEmotion) : 'transparent';
  
  const IconComponent = speakerConfig.icon;
  
  return (
    <div 
      className={cn(
        "p-4 rounded-lg mb-3 animate-slide-in transition-all duration-300",
        isHighlighted 
          ? "bg-yellow-100 border-2 border-yellow-400 shadow-md" 
          : "bg-white border border-gray-100 shadow-sm"
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-start gap-3 mb-2">
        <div 
          className="relative"
          style={{
            filter: dominantEmotion ? `drop-shadow(0 0 8px ${glowColor})` : 'none',
            transition: 'filter 300ms ease-in-out'
          }}
        >
          <Avatar className="h-8 w-8 border-2 transition-all duration-300" style={{ borderColor: glowColor }}>
            <AvatarFallback 
              className="text-xs font-semibold text-white"
              style={{ backgroundColor: speakerConfig.baseColor }}
              aria-label={`Avatar for ${speaker}`}
            >
              <IconComponent size={14} />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-900">{speaker}</div>
          {dominantEmotion && (
            <div className="text-xs text-gray-500 capitalize">{dominantEmotion}</div>
          )}
        </div>
      </div>
      <div className="text-gray-700 ml-11">{text}</div>
    </div>
  );
};

interface TranscriptionCardProps {
  messages: {
    speaker: string;
    text: string;
  }[];
  title: string;
  currentTime?: number;
  emotionData?: any[];
}

const TranscriptionCard: React.FC<TranscriptionCardProps> = ({ 
  messages, 
  title, 
  currentTime,
  emotionData 
}) => {
  // Simple logic to highlight current message based on time
  // This assumes each message represents roughly equal time segments
  const getCurrentMessageIndex = () => {
    if (currentTime === undefined || !messages.length) return -1;
    
    // Estimate message duration (this could be improved with actual timestamps)
    const estimatedDurationPerMessage = 30; // 30 seconds per message
    const currentMessageIndex = Math.floor(currentTime / estimatedDurationPerMessage);
    
    return Math.min(currentMessageIndex, messages.length - 1);
  };

  const currentMessageIndex = getCurrentMessageIndex();

  return (
    <div className="glass-card rounded-lg overflow-hidden h-full flex flex-col animate-fade-in">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <Message 
            key={index}
            speaker={message.speaker}
            text={message.text}
            index={index}
            isHighlighted={index === currentMessageIndex}
            emotionData={emotionData}
            currentTime={currentTime}
          />
        ))}
      </div>
    </div>
  );
};

export default TranscriptionCard;
