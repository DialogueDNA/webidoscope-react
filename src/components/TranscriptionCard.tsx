import React from 'react';
import { cn } from '@/lib/utils';
import SpeakerAvatar from '@/components/SpeakerAvatar';
import { getDominantEmotion, type EmotionEntry } from '@/lib/speakers';

interface MessageProps {
  speaker: string;
  text: string;
  index: number;
  isHighlighted?: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
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
  containerRef,
  emotionData,
  currentTime,
}) => {
  const dominantEmotion = getDominantEmotion(emotionData || [], speaker, currentTime || 0);


  const messageRef = React.useRef<HTMLDivElement | null>(null);
  const didMountRef = React.useRef(false);

  React.useEffect(() => {

    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    if (!isHighlighted) return;

    const container = containerRef.current;
    const el = messageRef.current;
    if (!container || !el) return;


    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    const padding = 24;

    const above = eRect.top < cRect.top + padding;
    const below = eRect.bottom > cRect.bottom - padding;

    if (above || below) {
      const target = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
      container.scrollTo({
        top: Math.max(0, target),
        behavior: 'smooth',
      });
    }
  }, [isHighlighted, containerRef]);

  return (
    <div
      ref={messageRef}
      className={cn(
        'p-4 rounded-lg mb-3 animate-slide-in transition-all duration-300',
        isHighlighted
          ? 'bg-yellow-100 border-2 border-yellow-400 shadow-md'
          : 'bg-white border border-gray-100 shadow-sm'
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-start gap-3 mb-2">
        <SpeakerAvatar
          speakerName={speaker}
          emotionData={emotionData}
          currentTime={currentTime}
          size={32}
          className="shrink-0"
        />
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
  emotionData,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

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
    <div className="glass-card rounded-lg overflow-hidden h-full flex flex-col animate-fade-in">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>

      <div
        ref={containerRef}
        className="flex-1 p-4 overflow-y-auto max-h-[60vh] overscroll-contain"
        data-transcript-container
      >
        {messages.map((message, index) => (
          <Message
            key={index}
            speaker={message.speaker}
            text={message.text}
            containerRef={containerRef}
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
