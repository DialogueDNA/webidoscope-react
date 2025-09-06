import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  createSession,
  deleteMultipleSessions,
  deleteSession,
  fetchAudio,
  fetchEmotions,
  fetchSession,
  fetchSessions,
  fetchSummary,
  fetchTranscript
} from "@/api/sessions.ts";
import {toast} from "@/hooks/use-toast.ts";

export const useSessions = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => fetchSessions(),
    enabled: !!user,
  });
};

export const useSessionMetadata = (sessionId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['session', sessionId, 'metadata'],
    queryFn: () => fetchSession(sessionId),
    enabled: !!user && !!sessionId,
  });
};

export const useSessionAudio = (sessionId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['artifact','audio', sessionId],
    queryFn: () => fetchAudio(sessionId!),
    enabled: !!sessionId
  });
};

export const useSessionTranscript = (sessionId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['session', sessionId, 'transcript'],
    queryFn: () => fetchTranscript(sessionId!),
    enabled: !!user && !!sessionId,
    refetchInterval: false,
  });
};

export const useSessionEmotion = (sessionId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['session', sessionId, 'emotion'],
    queryFn: () => fetchEmotions(sessionId!),
    enabled: !!user && !!sessionId,
    refetchInterval: false,
  });
};

export const useSessionSummary = (sessionId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['session', sessionId, 'summary'],
    queryFn: () => fetchSummary(sessionId!),
    enabled: !!user && !!sessionId,
    refetchInterval: false,
  });
};

export const useUploadSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createSession(formData),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      toast({
        title: 'Upload succeeded',
        description: `Session “${created.session.title}” created`,
      });
    },
    onError: (err) => {
      toast({
        title: 'Upload failed',
        description: err.message || 'Unknown error',
        variant: 'destructive',
      });
    },
  });
}

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSession(id, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast({
        title: 'Success',
        description: 'Session deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete session',
        variant: 'destructive',
      });
      console.error('Delete session error:', error);
    },
  });
};

export const useDeleteMultipleSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => deleteMultipleSessions(ids, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast({
        title: 'Success',
        description: 'Sessions deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete sessions',
        variant: 'destructive',
      });
      console.error('Delete sessions error:', error);
    },
  });
};
