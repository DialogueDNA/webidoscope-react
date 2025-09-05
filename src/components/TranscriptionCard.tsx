import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import SpeakerAvatar from '@/components/SpeakerAvatar';
import { getDominantEmotion, type EmotionEntry } from '@/lib/speakers';

interface MessageProps {
  speaker: string;
  text: string;
  index: number;
  isHighlighted?: boolean;
  emotionData?: EmotionEntry[];
  currentTime?: number;
  start_time?: number;
  end_time?: number;
}

const Message: React.FC<MessageProps> = ({
  speaker,
  text,
  index,
  isHighlighted = false,
  emotionData,
  currentTime,
  start_time,
  end_time
}) => {
  const dominantEmotion = getDominantEmotion(emotionData || [], speaker, currentTime || 0);
  const messageRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to highlighted message
  React.useEffect(() => {
    if (isHighlighted && messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isHighlighted]);

  return (
    <motion.div
      ref={messageRef}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        scale: isHighlighted ? 1.01 : 1,
      }}
      transition={{ 
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      className={cn(
        "rounded-xl mb-4 transition-all duration-300 relative overflow-hidden",
        isHighlighted
          ? "creative-gradient-highlight"
          : "bg-card border border-border shadow-card hover:shadow-soft"
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Left gold rail for active message */}
      {isHighlighted && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
      )}
      
      <div className="p-5">
        <div className="flex items-start gap-4 mb-3">
          <SpeakerAvatar
            speakerName={speaker}
            emotionData={emotionData}
            currentTime={currentTime}
            size={36}
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground mb-1">{speaker}</div>
            {dominantEmotion && (
              <div className="text-xs text-muted-foreground capitalize font-mono">
                {dominantEmotion}
              </div>
            )}
          </div>
        </div>
        
        {/* Thin gold vertical rail between avatar and text */}
        <div className="flex gap-4">
          <div className="w-9 flex justify-center">
            <div className="w-px bg-border h-full" />
          </div>
          <div className="flex-1 text-foreground leading-relaxed">
            {text}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface TranscriptionCardProps {
  messages: {
    speaker: string;
    text: string;
    start_time?: number;
    end_time?: number;
  }[];
  title: string;
  currentTime?: number;
  emotionData?: EmotionEntry[];
}

const TranscriptionCard: React.FC<TranscriptionCardProps> = ({
  messages,
  title,
  currentTime,
  emotionData
}) => {
  const getCurrentMessageIndex = () => {
    if (currentTime === undefined || !messages.length) return -1;
    
    // Find the message that should be active based on actual timestamps
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      
      // If message has timestamps, use them for precise timing
      if (message.start_time !== undefined && message.end_time !== undefined) {
        if (currentTime >= message.start_time && currentTime <= message.end_time) {
          return i;
        }
      }
    }
    
    // If no message is currently active, find the last message that has ended
    let lastEndedIndex = -1;
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      if (message.end_time !== undefined && currentTime > message.end_time) {
        lastEndedIndex = i;
      }
    }
    
    return lastEndedIndex;
  };

  const currentMessageIndex = getCurrentMessageIndex();

  return (
    <div className="creative-card creative-section-accent h-full flex flex-col">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-heading text-lg font-medium text-foreground">{title}</h3>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-1">
        {messages.map((message, index) => (
          <Message
            key={index}
            speaker={message.speaker}
            text={message.text}
            index={index}
            isHighlighted={index === currentMessageIndex}
            emotionData={emotionData}
            currentTime={currentTime}
            start_time={message.start_time}
            end_time={message.end_time}
          />
        ))}
      </div>
    </div>
  );
};

export default TranscriptionCard;
