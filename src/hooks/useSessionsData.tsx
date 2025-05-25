
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Session[];
    },
    enabled: !!user,
  });
};

export const useSessionDetail = (sessionId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as Session;
    },
    enabled: !!user && !!sessionId,
  });
};
