import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import EmotionChart from '@/components/EmotionChart';
import TranscriptionCard from '@/components/TranscriptionCard';
import AudioPlayer from '@/components/AudioPlayer';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  useSessionEmotion,
  useSessionTranscript,
  useSessionSummary,
  useSessionMetadata, useSessionAudio
} from '@/hooks/useSessionsData';
import { usePollUntilReady } from '@/hooks/usePollUntilReady';
import { toast } from '@/hooks/use-toast';

const SessionSummary = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = React.useState<number>(0);

  const {
    data: metadataResponse,
    isLoading: loadingMetadata,
    error: metadataError,
    refetch: refetchMetadata
  } = useSessionMetadata(id || '');

  const {
    data: summaryResponse,
    isLoading: loadingSummary,
    error: summaryError,
    refetch: refetchSummary
  } = useSessionSummary(id || '');

  const {
    data: transcriptResponse,
    isLoading: loadingTranscript,
    error: transcriptError,
    refetch: refetchTranscript
  } = useSessionTranscript(id || '');

  const {
    data: emotionResponse,
    isLoading: loadingEmotions,
    error: emotionsError,
    refetch: refetchEmotion
  } = useSessionEmotion(id || '');

  const {
    data: audioResponse,
    isLoading: loadingAudio,
    error: audioError,
    refetch: refetchAudio
  } = useSessionAudio(id || '');

  usePollUntilReady(metadataResponse?.status, refetchMetadata);
  usePollUntilReady(summaryResponse?.status, refetchSummary);
  usePollUntilReady(transcriptResponse?.status, refetchTranscript);
  usePollUntilReady(emotionResponse?.status, refetchEmotion);
  usePollUntilReady(audioResponse?.status, refetchAudio);

  const [resolvedTranscript, setResolvedTranscript] = React.useState<string | null>(null);
  const [resolvedSummary, setResolvedSummary] = React.useState<string | null>(null);
  const [resolvedEmotions, setResolvedEmotions] = React.useState<any | null>(null);

  React.useEffect(() => {
    if (transcriptResponse?.status === 'completed' && transcriptResponse.data) {
      fetch(transcriptResponse.data)
        .then(res => res.text())
        .then(setResolvedTranscript)
        .catch(() => setResolvedTranscript(null));
    }
  }, [transcriptResponse]);

  React.useEffect(() => {
    if (summaryResponse?.status === 'completed' && summaryResponse.data) {
      fetch(summaryResponse.data)
        .then(res => res.text())
        .then(setResolvedSummary)
        .catch(() => setResolvedSummary(null));
    }
  }, [summaryResponse]);

  React.useEffect(() => {
    if (emotionResponse?.status === 'completed' && emotionResponse.data) {
      fetch(emotionResponse.data)
        .then(res => res.json())
        .then(setResolvedEmotions)
        .catch(() => setResolvedEmotions(null));
    }
  }, [emotionResponse]);

  const metadata = metadataResponse?.data;

  const handleBackToSessions = () => navigate('/sessions');

  const handleDownloadPDF = async () => {
    if (!resolvedSummary || !metadata) return;
    try {
      const response = await fetch(`/api/summary/${metadata.id}/download`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/pdf' },
      });
      if (!response.ok) throw new Error('Failed to generate PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${metadata.title}-summary.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: 'Success', description: 'PDF downloaded successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'Unknown duration';
    const hours = Math.floor(minutes / 60);
    const rem = minutes % 60;
    return hours ? `${hours}h ${rem}m` : `${minutes} minutes`;
  };

  const parseTranscript = (text: string | null) => {
    console.log(text)
    if (!text) return [];
    return text.split('\n').filter(Boolean).map(line => {
      const [speaker, ...rest] = line.split(':');
      return {
        speaker: speaker?.trim() || 'Unknown',
        text: rest.join(':').trim()
      };
    });
  };

  const generateEmotionData = (data: any) => {
    if (!data) return [];
    return Object.entries(data).map(([time, value]) => ({ name: time, value: Number(value) }));
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  if (loadingMetadata || metadataResponse?.status != 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Navbar />
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  if (metadataError || metadataResponse?.status != 'completed' || !metadata) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Session not found</h2>
            <p className="text-gray-600 mb-4">The session doesn't exist or you don't have access.</p>
            <Button onClick={handleBackToSessions}>Back to Sessions</Button>
          </div>
        </div>
      </div>
    );
  }

  const transcriptMessages = parseTranscript(resolvedTranscript);
  const emotionData = generateEmotionData(resolvedEmotions);

  console.log(emotionResponse?.status);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">{metadata.title}</h1>

        {/* Audio Player Section */}
        {audioResponse?.status === 'completed' && audioResponse.data && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Audio Playback</h2>
            <AudioPlayer
              audioUrl={audioResponse.data}
              duration={metadata.duration || undefined}
              onTimeUpdate={handleTimeUpdate}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="glass-card rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Session Summary</h2>
            {summaryResponse?.status === 'not_started' ? (
                <p className="text-gray-500 italic">Summary has not been generated yet.</p>
              ) : summaryResponse?.status === 'processing' ? (
                <p className="text-gray-500 animate-pulse">Summary is still being generated...</p>
              ) : summaryError || summaryResponse?.status === 'failed' ? (
                <p className="text-red-500">Failed to load summary.</p>
              ) : (
                <p className="text-gray-700 leading-relaxed">{resolvedSummary}</p>
              )}
          </div>

          <div className="glass-card rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Emotional Shifts</h2>
            {emotionResponse?.status === 'not_started' ? (
                <p className="text-gray-500 italic">Emotion analysis has not started.</p>
              ) : emotionResponse?.status === 'processing' ? (
                <p className="text-gray-500 animate-pulse">Analyzing emotions...</p>
              ) : emotionsError || emotionResponse?.status === 'failed' ? (
                <p className="text-red-500">Failed to load emotion data.</p>
              ) : (
                <EmotionChart 
                  data={emotionData} 
                  title="" 
                  height={250} 
                  currentTime={currentTime}
                />
              )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Transcript</h2>
          {transcriptResponse?.status === 'not_started' ? (
                <p className="text-gray-500 italic">Transcription has not started yet.</p>
              ) : transcriptResponse?.status === 'processing' ? (
                <p className="text-gray-500 animate-pulse">Transcribing audio...</p>
              ) : transcriptError || transcriptResponse?.status === 'failed' ? (
                <p className="text-red-500">Could not load transcript.</p>
              ) : transcriptMessages.length > 0 ? (
                <TranscriptionCard 
                  messages={transcriptMessages} 
                  title="" 
                  currentTime={currentTime}
                />
              ) : (
                <p className="text-gray-600">No transcript available.</p>
              )}
        </div>

        <div className="glass-card rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Session Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Date</h3>
              <p className="font-medium">{formatDate(metadata.created_at)}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Duration</h3>
              <p className="font-medium">{formatDuration(metadata.duration)}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Participants</h3>
              <p className="font-medium">{metadata.participants?.join(', ') || 'No participants listed'}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button onClick={handleDownloadPDF} className="bg-black text-white hover:bg-black/90 flex items-center gap-2">
            <Download size={16} />
            Download PDF
          </Button>

          <Button onClick={handleBackToSessions} variant="outline">
            Back to Sessions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;
