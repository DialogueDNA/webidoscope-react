import * as React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  getSpeakerConfig,
  getDominantEmotion,
  getEmotionGlowColor,
  getAvatarGlowStyle,
} from "@/lib/speakers";

export type EmotionEntry = {
  speaker: string;
  start_time?: number;
  end_time: number;
  emotions: { label: string; score: number }[];
};

interface SpeakerAvatarProps {
  speakerName: string;
  emotionData?: EmotionEntry[];
  currentTime?: number;
  size?: number; // px, default 32 (h-8 w-8)
  className?: string;
}

const SpeakerAvatar: React.FC<SpeakerAvatarProps> = ({
  speakerName,
  emotionData,
  currentTime = 0,
  size = 32,
  className,
}) => {
  const cfg = getSpeakerConfig(speakerName);
  const dominant = getDominantEmotion(emotionData ?? [], speakerName, currentTime);
  const glowColor = getEmotionGlowColor(dominant ?? undefined);
  const ringStyle = getAvatarGlowStyle(cfg.baseColor, glowColor, 0.6);
  const Icon = cfg.icon;

  return (
    <div
      style={ringStyle}
      className={`inline-flex rounded-full p-[2px] ${className ?? ""}`}
      aria-label={`Avatar for ${speakerName}${dominant ? `, emotion ${dominant}` : ""}`}
    >
      <Avatar
        className="border transition-all duration-300"
        style={{ height: size, width: size, borderColor: glowColor }}
      >
        {/* אם יהיו תמונות אמיתיות אפשר לשים כאן */}
        <AvatarImage src={undefined} alt={speakerName} />
        <AvatarFallback
            className="flex items-center justify-center"
            style={{ backgroundColor: cfg.baseColor }}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default SpeakerAvatar;
