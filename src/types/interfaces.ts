/** ========= RAW TYPES (shape as returned by BE JSON over access_url) ========= */

/** 1) Transcription */
export type RawWriter = string | number;

export interface RawTextSegment {
  text: string;
  writer?: RawWriter | null;
  start_time?: number | null;
  end_time?: number | null;
  language?: string | null;
}
export type RawTranscription = RawTextSegment[];

/** 2) Emotions */
export interface RawEmotionAnalyzerOutput {
  emotions_intensity_dict: Record<string, number>;
  whom?: RawWriter | null;
  start_time?: number | null;
  end_time?: number | null;
}

export interface RawEmotionAnalyzerBundle {
  text?: RawEmotionAnalyzerOutput | null;
  audio?: RawEmotionAnalyzerOutput | null;
  mixed?: RawEmotionAnalyzerOutput | null;
  whom?: RawWriter | null;
  transcription?: RawTextSegment | null;
  start_time?: number | null;
  end_time?: number | null;
}
export type RawEmotions = RawEmotionAnalyzerBundle[];

/** 3) Summary */
export interface RawSummaryOutput {
  summary: string;
  per_speaker?: Record<string, string> | null;
  bullets?: string[] | null;
  usage?: Record<string, number> | null;
}

/** ========= UI-FRIENDLY TYPES (camelCase) ========= */

/** 1) Transcription */
export interface TranscriptSegment {
  text: string;
  writer?: RawWriter;
  start_time?: number;  // (seconds)
  end_time?: number;    // (seconds)
  language?: string;
}
export type Transcript = TranscriptSegment[];

/** 2) Emotions */
export interface EmotionOutput {
  scores: Record<string, number>; // normalized from emotions_intensity_dict
  who?: RawWriter;
  start_time?: number;
  end_time?: number;
}

export interface EmotionBundle {
  text?:  EmotionOutput;
  audio?: EmotionOutput;
  mixed?: EmotionOutput;
  who?: RawWriter;
  segment?: TranscriptSegment;   // normalized from "transcription"
  start_time?: number;
  end_time?: number;
}
export type Emotions = EmotionBundle[];

/** 3) Summary */
export interface Summary {
  summary: string;
  perSpeaker?: Record<string, string>;
  bullets?: string[];
  usage?: Record<string, number>;
}
