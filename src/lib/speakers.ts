// lib/speakers.ts
import type { ComponentType } from "react";
import { User, Users, UserCheck, Crown, Star, Shield } from "lucide-react";

/* =============================
 * Types
 * ============================= */

export interface EmotionScore {
  label: string;         // e.g., "joy", "anger"
  score: number;         // 0..1
}

export interface EmotionEntry {
  speaker: string;       // must match transcript speaker label
  start_time?: number;   // in seconds (optional)
  end_time: number;      // in seconds (required)
  emotions: EmotionScore[];
}

export interface SpeakerConfig {
  icon: ComponentType<{ className?: string }>;
  baseColor: string;     // hsl(...) or var(--color-*)
  name: string;
}

/* =============================
 * Speaker configs (defaults)
 * ============================= */

export const defaultSpeakerConfigs: SpeakerConfig[] = [
  { icon: User,     baseColor: "hsl(214, 90%, 50%)", name: "Speaker 1" }, // Blue
  { icon: Users,    baseColor: "hsl(142, 71%, 45%)", name: "Speaker 2" }, // Green
  { icon: UserCheck,baseColor: "hsl(280,100%, 60%)", name: "Speaker 3" }, // Purple
  { icon: Crown,    baseColor: "hsl( 25, 95%, 53%)", name: "Speaker 4" }, // Orange
  { icon: Star,     baseColor: "hsl(336, 84%, 57%)", name: "Speaker 5" }, // Pink
  { icon: Shield,   baseColor: "hsl(196,100%, 47%)", name: "Speaker 6" }, // Cyan
];

/** Stable config by conventional name ("Speaker 1") or hashed fallback for custom names */
export const getSpeakerConfig = (speakerName: string): SpeakerConfig => {
  const match = speakerName.match(/Speaker\s+(\d+)/i);
  if (match) {
    const idx = Math.max(0, Math.min(Number(match[1]) - 1, defaultSpeakerConfigs.length - 1));
    return { ...defaultSpeakerConfigs[idx], name: speakerName };
  }
  // Hash fallback for custom names
  const hash = Array.from(speakerName).reduce((a, ch) => ((a << 5) - a) + ch.charCodeAt(0) | 0, 0);
  const idx = Math.abs(hash) % defaultSpeakerConfigs.length;
  return { ...defaultSpeakerConfigs[idx], name: speakerName };
};

/* =============================
 * Emotion → glow color
 * ============================= */

const POSITIVE = new Set(["joy","happiness","positive","excited","pleased","calm","content"]);
const NEGATIVE = new Set(["anger","angry","sadness","fear","negative","frustrated","disappointed","anxiety","stress"]);

export const getEmotionGlowColor = (dominantEmotion?: string | null): string => {
  if (!dominantEmotion) return "hsl(210, 10%, 60%)"; // neutral gray
  const e = dominantEmotion.toLowerCase();
  if (POSITIVE.has(e)) return "hsl(142, 71%, 45%)";  // green
  if (NEGATIVE.has(e)) return "hsl(  0, 84%, 57%)";  // red
  return "hsl(210, 10%, 60%)";                       // gray
};

/* =============================
 * Dominant emotion at time
 * ============================= */

/**
 * Returns the dominant emotion label for a given speaker at the current time.
 * - Prefers entries where start_time <= t <= end_time.
 * - If no bounded window exists, falls back to the latest entry with end_time <= t.
 */
export const getDominantEmotion = (
  emotionData: EmotionEntry[] | undefined,
  speakerName: string,
  currentTime: number
): string | null => {
  if (!emotionData || !Number.isFinite(currentTime)) return null;

  // Case-insensitive speaker match
  const target = speakerName.trim().toLowerCase();

  // First: windowed entries covering current time
  const covering = emotionData
    .filter(e =>
      e.speaker?.trim().toLowerCase() === target &&
      Array.isArray(e.emotions) && e.emotions.length > 0 &&
      (e.start_time ?? -Infinity) <= currentTime &&
      e.end_time >= currentTime
    )
    .sort((a, b) => (b.end_time - a.end_time)); // most recent window first

  const pool = covering.length > 0
    ? covering
    : emotionData
        .filter(e =>
          e.speaker?.trim().toLowerCase() === target &&
          Array.isArray(e.emotions) && e.emotions.length > 0 &&
          e.end_time <= currentTime
        )
        .sort((a, b) => (b.end_time - a.end_time)); // latest past entry

  if (pool.length === 0) return null;

  const latest = pool[0];
  const top = latest.emotions.reduce((max, cur) => (cur.score > max.score ? cur : max));
  return top.label ?? null;
};

/* =============================
 * Avatar ring style (glow)
 * ============================= */

/**
 * Returns inline styles for a soft outer glow around an avatar.
 * Use on a wrapper <div> of the Avatar.
 */
export const getAvatarGlowStyle = (baseColor: string, glowColor: string, intensity = 0.6): React.CSSProperties => {
  // Use twin shadow: subtle base ring + emotion glow
  const alpha = Math.max(0, Math.min(intensity, 1));
  return {
    boxShadow: `
      0 0 0 2px ${baseColor}20,
      0 0 14px 2px ${glowColor}${Math.round(alpha * 100).toString().padStart(2, "0")}
    ` as unknown as string, // allow in css var/HSL contexts; adjust if your TS config complains
    transition: "box-shadow 240ms ease"
  };
};
