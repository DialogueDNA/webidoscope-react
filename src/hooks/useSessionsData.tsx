import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient.ts';
import {
  AudioResponse,
  EmotionsResponse,
  SessionListResponse,
  SessionResponse,
  SummaryResponse,
  TranscriptResponse
} from "@/types/api.tsx";

export const useSessionsData = () => {
  const { user } = useAuth();
  return useQuery<SessionListResponse, Error>({
    queryKey: ['sessions', user?.id],
    queryFn: async () => await apiClient("/api/sessions"),
    enabled: !!user,
  });
};

export const useSessionMetadata = (sessionId: string) => {
  const { user } = useAuth();
  return useQuery<SessionResponse, Error>({
    queryKey: ['session', sessionId, 'metadata'],
    queryFn: async () => await apiClient(`/api/sessions/${sessionId}`),
    enabled: !!user && !!sessionId,
  });
};

export const useSessionAudio = (sessionId: string) => {
  const { user } = useAuth();
  return useQuery<AudioResponse, Error>({
    queryKey: ['session', sessionId, 'audio'],
    queryFn: async () => await apiClient(`/api/sessions/audio/${sessionId}`),
    enabled: !!user && !!sessionId,
  });
};

export const useSessionTranscript = (sessionId: string) => {
  const { user } = useAuth();
  return useQuery<TranscriptResponse, Error>({
    queryKey: ['session', sessionId, 'transcript'],
    queryFn: async () => await apiClient(`/api/sessions/transcript/${sessionId}`),
    enabled: !!user && !!sessionId,
    refetchInterval: false,
  });
};

export const useSessionEmotion = (sessionId: string) => {
  const { user } = useAuth();
  return useQuery<EmotionsResponse, Error>({
    queryKey: ['session', sessionId, 'emotion'],
    queryFn: async () => await apiClient(`/api/sessions/emotions/${sessionId}`),
    enabled: !!user && !!sessionId,
    refetchInterval: false,
  });
};

export const useSessionSummary = (sessionId: string) => {
  const { user } = useAuth();
  return useQuery<SummaryResponse, Error>({
    queryKey: ['session', sessionId, 'summary'],
    queryFn: async () => await apiClient(`/api/sessions/summary/${sessionId}`),
    enabled: !!user && !!sessionId,
    refetchInterval: false,
  });
};