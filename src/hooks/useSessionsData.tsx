
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {apiClient} from "@/lib/apiClient.ts";

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

export const useSessionsData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sessions', user?.id],
    queryFn: async () => {
      console.log("Fetching sessions for user:", user?.id);
      const res = await apiClient("/api/sessions");
      return res as Session[];
    },
    enabled: !!user,
  });
};

export const useSessionDetail = (sessionId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      if (!user || !sessionId) return null;
      const res = await apiClient(`/api/sessions/${sessionId}`);
      return res as Session;
    },
    enabled: !!user && !!sessionId,
  });
};
