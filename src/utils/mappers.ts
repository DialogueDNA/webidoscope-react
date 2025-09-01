import type {
  // Raw
  RawTextSegment, RawTranscription,
  RawEmotionAnalyzerOutput, RawEmotionAnalyzerBundle, RawEmotions,
  RawSummaryOutput,
  // UI
  TranscriptSegment, Transcript,
  EmotionOutput, EmotionBundle, Emotions,
  Summary,
} from '@/types/interfaces';

/** Small safe getters to tolerate snake_case/camelCase or null/undefined. */
const num = (v: unknown): number | undefined => {
  if (v == null) return undefined;
  const n = typeof v === 'string' ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : undefined;
};
const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);
const rec = <T>(v: unknown): Record<string, T> | undefined =>
  v && typeof v === 'object' ? (v as Record<string, T>) : undefined;

/** ===================== Transcription mappers ===================== */

export function mapTextSegment(raw?: RawTextSegment | null): TranscriptSegment | undefined {
  if (!raw) return undefined;
  return {
    text: String(raw.text ?? ''),
    writer: raw.writer ?? undefined,
    start_time: num((raw as any).t0 ?? raw.start_time),
    end_time: num((raw as any).t1 ?? raw.end_time),
    language: str(raw.language),
  };
}

export function mapTranscription(raw: unknown): Transcript {
  // raw is expected to be RawTranscription = RawTextSegment[]
  if (!Array.isArray(raw)) return [];
  const out: Transcript = [];
  for (const seg of raw as RawTranscription) {
    const m = mapTextSegment(seg);
    if (m && m.text) out.push(m);
  }
  return out;
}

/** ===================== Emotions mappers ===================== */

export function mapEmotionOutput(raw?: RawEmotionAnalyzerOutput | null): EmotionOutput | undefined {
  if (!raw) return undefined;
  const scores = rec<number>((raw as any).scores) // tolerate camelCase
             ?? rec<number>(raw.emotions_intensity_dict)
             ?? {};
  return {
    scores,
    who: raw.whom ?? undefined,
    start_time: num((raw as any).t0 ?? raw.start_time),
    end_time: num((raw as any).t1 ?? raw.end_time),
  };
}

export function mapEmotionBundle(raw?: RawEmotionAnalyzerBundle | null): EmotionBundle | undefined {
  if (!raw) return undefined;
  return {
    text:  mapEmotionOutput(raw.text  ?? undefined),
    audio: mapEmotionOutput(raw.audio ?? undefined),
    mixed: mapEmotionOutput(raw.mixed ?? undefined),
    who: raw.whom ?? undefined,
    segment: mapTextSegment(raw.transcription ?? undefined),
    start_time: num((raw as any).t0 ?? raw.start_time),
    end_time: num((raw as any).t1 ?? raw.end_time),
  };
}

export function mapEmotions(raw: unknown): Emotions {
  // raw is expected to be RawEmotions = RawEmotionAnalyzerBundle[]
  if (!Array.isArray(raw)) return [];
  const out: Emotions = [];
  for (const bundle of raw as RawEmotions) {
    const m = mapEmotionBundle(bundle);
    if (m) out.push(m);
  }
  return out;
}

/** ===================== Summary mapper ===================== */

export function mapSummary(raw: unknown): Summary {
  const r = (raw as RawSummaryOutput) ?? ({} as RawSummaryOutput);
  return {
    text: String((r as any).text ?? r.summary ?? ''),
    perSpeaker: rec<string>((r as any).perSpeaker) ?? r.per_speaker ?? undefined,
    bullets: Array.isArray(r.bullets) ? r.bullets.filter(Boolean) : undefined,
    usage: rec<number>(r.usage) ?? undefined,
  };
}

/** ===================== Fetch helpers ===================== */

/**
 * Fetch JSON from a presigned access URL (or SAS URL). No credentials are included.
 * The server behind the URL should already authorize via the signature in the URL.
 */
export async function fetchJsonFromAccessUrl<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
