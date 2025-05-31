import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient.ts';

export interface Session {
  id: string;
  title: string;
  audio_file_url: string | null;
  transcript: string | null;
  emotion_breakdown: any | null;
  summary: string | null;
  duration: number | null;
  participants: string[] | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface Metadata {
  id: string;
  title: string;
  status: 'Processing' | 'Ready';
  summary: string;
  duration: number | null;
  participants: string[] | null;
  created_at: string;
  updated_at: string;
  // add any other fields you expect
}

export const useSessionsData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sessions', user?.id],
    queryFn: async () => {
      const res = await apiClient("/api/metadata");
      return res ?? []; // Ensure not undefined
    },
    enabled: !!user,
  });
};

type ApiResponse<T> = {
  status: 'Processing' | 'Ready' | 'Error';
  data: T | null;
};

export const useSessionMetadata = (sessionId: string) => {
  const { user } = useAuth();

  return useQuery<ApiResponse<Metadata>, Error>({
    queryKey: ['session', sessionId, 'metadata'],
    queryFn: async () => {
      if (!user || !sessionId) return { status: 'Error', data: null };
      const res = await apiClient(`/api/metadata/${sessionId}`);
      return res ?? { status: 'Error', data: null };
    },
    enabled: !!user && !!sessionId,
  });
};

export const useSessionSummary = (sessionId: string) => {
  const { user } = useAuth();

  return useQuery<ApiResponse<string>, Error>({
    queryKey: ['session', sessionId, 'summary'],
    queryFn: async () => {
      if (!user || !sessionId) return { status: 'Error', data: null };
      const res = await apiClient(`/api/summary/${sessionId}`);
      return res ?? { status: 'Error', data: null };
    },
    enabled: !!user && !!sessionId,
  });
};

export const useSessionTranscript = (sessionId: string) => {
  const { user } = useAuth();

  return useQuery<ApiResponse<string>, Error>({
    queryKey: ['session', sessionId, 'transcript'],
    queryFn: async () => {
      if (!user || !sessionId) return { status: 'Error', data: null };
      const res = await apiClient(`/api/transcript/${sessionId}`);
      return res ?? { status: 'Error', data: null };
    },
    enabled: !!user && !!sessionId,
  });
};

export const useSessionEmotion = (sessionId: string) => {
  const { user } = useAuth();

  return useQuery<ApiResponse<any>, Error>({
    queryKey: ['session', sessionId, 'emotion'],
    queryFn: async () => {
      if (!user || !sessionId) return { status: 'Error', data: null };
      const res = await apiClient(`/api/emotions/${sessionId}`);
      return res ?? { status: 'Error', data: null };
    },
    enabled: !!user && !!sessionId,
  });
};
