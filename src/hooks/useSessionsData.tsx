import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient.ts';
import { supabase } from '@/integrations/supabase/client';

interface Metadata {
  id: string;
  title: string;
  status: 'not_started' | 'queued' | 'processing' | 'ready' | 'error';
  summary: string;
  summary_preset?: string;
  duration: number | null;
  participants: string[] | null;
  created_at: string;
  updated_at: string;
  // add any other fields you expect
}

export interface SessionFilters {
  startDate?: Date;
  endDate?: Date;
  summaryType?: string;
}

export const useSessionsData = (filters?: SessionFilters) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sessions', user?.id, filters],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token');
      }

      const params = new URLSearchParams();
      
      if (filters?.startDate) {
        params.append('created_after', filters.startDate.toISOString().split('T')[0]);
      }
      if (filters?.endDate) {
        params.append('created_before', filters.endDate.toISOString().split('T')[0]);
      }
      if (filters?.summaryType) {
        params.append('summary_type', filters.summaryType);
      }

      const url = `https://vyihpwcrioptkvafqfmw.supabase.co/functions/v1/sessions-metadata${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('Supabase Edge Function URL:', url); // Debug log
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      return res ?? []; // Ensure not undefined
    },
    enabled: !!user,
  });
};

type ApiResponse<T> = {
  status: 'not_started' | 'queued' | 'processing' | 'completed' | 'failed';
  data: T | null;
};

export const useSessionMetadata = (sessionId: string) => {
  const { user } = useAuth();

  return useQuery<ApiResponse<Metadata>, Error>({
    queryKey: ['session', sessionId, 'metadata'],
    queryFn: async () => {
      if (!user || !sessionId) return { status: 'Error', data: null };
      const res = await apiClient(`/api/sessions/metadata/${sessionId}`);
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
      const res = await apiClient(`/api/sessions/summary/${sessionId}`);
      return res ?? { status: 'Error', data: null };
    },
    enabled: !!user && !!sessionId,
    refetchInterval: false,
  });
};

export const useSessionTranscript = (sessionId: string) => {
  const { user } = useAuth();

  return useQuery<ApiResponse<string>, Error>({
    queryKey: ['session', sessionId, 'transcript'],
    queryFn: async () => {
      if (!user || !sessionId) return { status: 'Error', data: null };
      const res = await apiClient(`/api/sessions/transcript/${sessionId}`);
      return res ?? { status: 'Error', data: null };
    },
    enabled: !!user && !!sessionId,
    refetchInterval: false,
  });
};

export const useSessionEmotion = (sessionId: string) => {
  const { user } = useAuth();

  return useQuery<ApiResponse<any>, Error>({
    queryKey: ['session', sessionId, 'emotion'],
    queryFn: async () => {
      if (!user || !sessionId) return { status: 'Error', data: null };
      const res = await apiClient(`/api/sessions/emotions/${sessionId}`);
      return res ?? { status: 'Error', data: null };
    },
    enabled: !!user && !!sessionId,
    refetchInterval: false,
  });
};

export const useSessionAudio = (sessionId: string) => {
  const { user } = useAuth();

  return useQuery<ApiResponse<string>, Error>({
    queryKey: ['session', sessionId, 'audio'],
    queryFn: async () => {
      if (!user || !sessionId) return { status: 'Error', data: null };
      const res = await apiClient(`/api/sessions/audio/${sessionId}`)
      return res ?? { status: 'Error', data: null };
    },
    enabled: !!user && !!sessionId,
  });
};