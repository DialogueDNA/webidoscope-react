import type {
SessionListResponse, SessionResponse,
AudioResponse, TranscriptResponse, EmotionsResponse, SummaryResponse,
ArtifactDTO
} from "../types/api";
import {deleteJson, getJson, getPresigned, postFormData} from "./client";

// Sessions

// GET
export const fetchSessions = () => getJson<SessionListResponse>(`/sessions`);
export const fetchSession = (id: string) => getJson<SessionResponse>(`/sessions/${id}`);

// POST
export const createSession = (formData: FormData) => postFormData<SessionResponse>(`/sessions`, {
    body: formData,
});

// DELETE
export const deleteSession = (id: string, deleteBlobs: boolean) => deleteJson(`/sessions/${id}`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delete_blobs: deleteBlobs }),
})

export const deleteMultipleSessions = (ids: string[], deleteBlobs: boolean) => deleteJson(`/sessions`, {
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({session_ids: ids, delete_blobs: deleteBlobs}),
})

// Artifacts (status + artifact access)
export const fetchAudio = (id: string) => getJson<AudioResponse>(`/sessions/${id}/audio`);
export const fetchTranscript = (id: string) => getJson<TranscriptResponse>(`/sessions/${id}/transcript`);
export const fetchEmotions = (id: string) => getJson<EmotionsResponse>(`/sessions/${id}/emotions`);
export const fetchSummary = (id: string) => getJson<SummaryResponse>(`/sessions/${id}/summary`);

export type ArtifactKind = 'audio' | 'transcript' | 'emotions' | 'summary';

export async function fetchArtifactBytes(artifact: ArtifactDTO): Promise<Response> {
    if (artifact.status !== 'completed' || !artifact.result?.access_url) {
        throw new Error('Artifact is not ready');
    }
    return getPresigned(artifact.result.sas_url);
}