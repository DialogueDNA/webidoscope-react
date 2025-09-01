export type ProcessingStatus =
  | 'not_started'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed';

export type ArtifactAccess = {
  object_path: string;
  sas_url?: string;
  access_url?: string;
  expires_at: string;
};

export type ArtifactDTO = {
  status: ProcessingStatus;
  result?: ArtifactAccess | null;
};

export type SessionDTO = {
  id: string;
  title: string;
  created_at: string;
  duration?: number | null;
  participants?: string[] | null;
  language?: string | null;

  audio_status?: ProcessingStatus | null;
  transcript_status?: ProcessingStatus | null;
  emotion_status?: ProcessingStatus | null;
  summary_status?: ProcessingStatus | null;

  session_status?: ProcessingStatus | null;
};

export type SessionListResponse = { sessions: SessionDTO[] };
export type SessionResponse = { session: SessionDTO };
export type AudioResponse = { audio: ArtifactDTO };
export type TranscriptResponse = { transcript: ArtifactDTO };
export type EmotionsResponse = { analyzed_emotions: ArtifactDTO };
export type SummaryResponse = { summary: ArtifactDTO };
