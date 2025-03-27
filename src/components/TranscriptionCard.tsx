
import React from 'react';
import { cn } from '@/lib/utils';

interface MessageProps {
  speaker: string;
  text: string;
  index: number;
}

const Message: React.FC<MessageProps> = ({ speaker, text, index }) => {
  return (
    <div 
      className={cn(
        "p-4 rounded-lg mb-3 animate-slide-in",
        "bg-white border border-gray-100 shadow-sm"
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="font-medium text-sm mb-1">{speaker}:</div>
      <div className="text-gray-700">{text}</div>
    </div>
  );
};

interface TranscriptionCardProps {
  messages: {
    speaker: string;
    text: string;
  }[];
  title: string;
}

const TranscriptionCard: React.FC<TranscriptionCardProps> = ({ messages, title }) => {
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
          />
        ))}
      </div>
    </div>
  );
};

export default TranscriptionCard;
