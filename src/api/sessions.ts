import type {
SessionListResponse, SessionResponse,
AudioResponse, TranscriptResponse, AnalyzedEmotionsResponse, SummaryResponse,
ArtifactDTO
} from "../types/api";
import { getJson, getPresigned } from "./client";


// List & get
export const fetchSessions = () => getJson<SessionListResponse>(`/sessions`);
export const fetchSession = (id: string) => getJson<SessionResponse>(`/sessions/${id}`);


// Artifacts (status + sas_url)
export const fetchAudio = (id: string) => getJson<AudioResponse>(`/sessions/${id}/audio`);
export const fetchTranscript = (id: string) => getJson<TranscriptResponse>(`/sessions/${id}/transcript`);
export const fetchEmotions = (id: string) => getJson<AnalyzedEmotionsResponse>(`/sessions/${id}/emotions`);
export const fetchSummary = (id: string) => getJson<SummaryResponse>(`/sessions/${id}/summary`);


export type ArtifactKind = 'audio' | 'transcript' | 'emotions' | 'summary';


export async function fetchArtifactBytes(artifact: ArtifactDTO): Promise<Response> {
if (artifact.status !== 'completed' || !artifact.result?.sas_url) {
throw new Error('Artifact is not ready');
}
return getPresigned(artifact.result.sas_url);
}