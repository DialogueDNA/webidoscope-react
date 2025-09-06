import React from 'react';
import { marked } from "marked";
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import EmotionChartsGrid from '@/components/EmotionChartsGrid';
import TranscriptionCard from '@/components/TranscriptionCard';
import AudioPlayer from '@/components/AudioPlayer';
import CollapsibleSection from '@/components/CollapsibleSection';
import EmotionFilter from '@/components/EmotionFilter';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { usePollUntilReady } from '@/hooks/usePollUntilReady';
import { toast } from '@/hooks/use-toast';
import {mapEmotions, mapSummary, mapTranscription} from "@/utils/mappers.ts";
import type {EmotionBundle, Emotions, Summary, Transcript} from "@/types/interfaces.ts";
import {
  useSessionAudio,
  useSessionMetadata,
  useSessionEmotion,
  useSessionSummary,
  useSessionTranscript
} from "@/hooks/useSessions.tsx";

const SessionSummary = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = React.useState<number>(0);
  const [selectedEmotions, setSelectedEmotions] = React.useState<string[]>([]);
  const [availableEmotions, setAvailableEmotions] = React.useState<string[]>([]);

  const {
    data: metadataResponse,
    isLoading: loadingMetadata,
    error: metadataError,
    refetch: refetchMetadata
  } = useSessionMetadata(id)

  const {
    data: audioResponse,
    isLoading: loadingAudio,
    error: audioError,
    refetch: refetchAudio
  } = useSessionAudio(id)

  const {
    data: transcriptResponse,
    isLoading: loadingTranscript,
    error: transcriptError,
    refetch: refetchTranscript
  } = useSessionTranscript(id)

  const {
    data: emotionResponse,
    isLoading: loadingEmotions,
    error: emotionsError,
    refetch: refetchEmotion
  } = useSessionEmotion(id)

  const {
      data: summaryResponse,
      isLoading: loadingSummary,
      error: summaryError,
      refetch: refetchSummary
  } = useSessionSummary(id)

  console.log(metadataResponse)
  console.log(audioResponse)
  console.log(transcriptResponse)
  console.log(emotionResponse)
  console.log(summaryResponse)

  usePollUntilReady(metadataResponse?.session?.session_status, refetchMetadata);
  usePollUntilReady(audioResponse?.audio?.status, refetchAudio);
  usePollUntilReady(transcriptResponse?.transcript?.status, refetchTranscript);
  usePollUntilReady(emotionResponse?.analyzed_emotions?.status, refetchEmotion);
  usePollUntilReady(summaryResponse?.summary?.status, refetchSummary);

  const [resolvedAudio, setResolvedAudio] = React.useState<string | null>(null);
  const [resolvedTranscript, setResolvedTranscript] = React.useState<Transcript>([]);
  const [resolvedEmotions, setResolvedEmotions] = React.useState<Emotions>([]);
  const [resolvedSummary, setResolvedSummary] = React.useState<Summary>({ text: '' });

  React.useEffect(() => {
    if (audioResponse?.audio?.status === "completed") {
      setResolvedAudio(audioResponse?.audio?.result?.access_url);
    }
  }, [audioResponse]);

  React.useEffect(() => {
    if (transcriptResponse?.transcript?.status === 'completed') {
      fetch(transcriptResponse?.transcript?.result?.access_url)
        .then(r => r.json())
        .then(json => setResolvedTranscript(mapTranscription(json)))
        .catch(() => setResolvedTranscript([]));
    }
  }, [transcriptResponse]);

  React.useEffect(() => {
    if (emotionResponse?.analyzed_emotions?.status === 'completed') {
      fetch(emotionResponse?.analyzed_emotions?.result?.access_url)
        .then(r => r.json())
        .then(json => setResolvedEmotions(mapEmotions(json)))
        .catch(() => setResolvedEmotions([]));
    }
  }, [emotionResponse]);

  React.useEffect(() => {
    if (summaryResponse?.summary?.status === 'completed') {
      fetch(summaryResponse?.summary?.result?.access_url)
        .then(r => r.json())
        .then(json => setResolvedSummary(mapSummary(json)))
        .catch(() => setResolvedSummary({ text: '' }));
    }
  }, [summaryResponse]);

  React.useEffect(() => {
    if (resolvedEmotions && Array.isArray(resolvedEmotions) && resolvedEmotions.length > 0) {
      console.log('🔍 Processing resolved emotions:', resolvedEmotions);
      
      const emotions = new Set<string>();
      resolvedEmotions.forEach((bundle: EmotionBundle) => {
        console.log('📊 Processing entry:', bundle);
        const scores =
          bundle?.mixed?.scores ??
          bundle?.audio?.scores ??
          bundle?.text?.scores ?? {};

        Object.keys(scores).forEach((label) => {
          emotions.add(label.toLowerCase());
        });
      });
      
      const emotionList = Array.from(emotions).sort();
      console.log('📝 Available emotions:', emotionList);
      setAvailableEmotions(emotionList);
      setSelectedEmotions(emotionList); // Start with all emotions selected
    }
  }, [resolvedEmotions]);

  const metadata = metadataResponse?.session;

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

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown duration';

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);

    return parts.join(' ');
  };

  const renderMarkdown = (markdown: string) => {
    return marked.parse(markdown);
  };

  type TranscriptEntry = {
    speaker: string;
    text: string;
  };

  const parseTranscript = (json: string | null): TranscriptEntry[] => {
    if (!json) return [];

    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (entry) => entry.speaker !== undefined && entry.text !== undefined
          )
          .map((entry) => ({
            speaker: typeof entry.speaker === "number"
              ? `Speaker ${entry.speaker}`
              : String(entry.speaker),
            text: entry.text,
          }));
      }
    } catch (error) {
      console.error("Failed to parse transcript JSON:", error);
    }

    return [];
  };

  type EmotionRaw = {
    speaker: string;
    text: string;
    start_time: number;
    end_time: number;
    emotions: { label: string; score: number }[];
  };

  type ChartPoint = {
    end_time: number;
    [emotionLabel: string]: number;
  };

  const generateEmotionChartData = (raw: EmotionRaw[]): { [speaker: string]: ChartPoint[] } => {
    console.log('🔧 Generating emotion chart data from:', raw);
    
    if (!raw || raw.length === 0) {
      console.log('❌ No raw emotion data available');
      return {};
    }

    const speakerData: { [speaker: string]: ChartPoint[] } = {};

    raw.forEach((entry, index) => {
      console.log(`📈 Processing entry ${index}:`, entry);
      
      const speakerKey = entry.speaker || 'Unknown Speaker';
      
      if (!speakerData[speakerKey]) {
        speakerData[speakerKey] = [];
      }

      const point: ChartPoint = {
        end_time: Number(entry.end_time.toFixed(2)),
      };

      for (const emotion of entry.emotions) {
        console.log(`🎭 Adding emotion ${emotion.label}: ${emotion.score}`);
        point[emotion.label.toLowerCase()] = parseFloat((emotion.score * 100).toFixed(2));
      }

      console.log('📊 Created chart point:', point);
      speakerData[speakerKey].push(point);
    });

    console.log('✅ Final speaker data:', speakerData);
    return speakerData;
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleEmotionToggle = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const handleSelectAllEmotions = () => {
    setSelectedEmotions(availableEmotions);
  };

  const handleDeselectAllEmotions = () => {
    setSelectedEmotions([]);
  };

  if (loadingMetadata || metadataResponse?.session?.session_status !== 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Navbar />
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  if (metadataError || metadataResponse?.session?.session_status !== 'completed' || !metadata) {
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
  
  console.log('🎯 Final emotion chart data being passed to component:', resolvedEmotions);
  console.log('🎭 Selected emotions:', selectedEmotions);
  console.log('📊 Available emotions:', availableEmotions);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{metadata.title}</h1>
          <div className="flex gap-2">
            <Button onClick={handleDownloadPDF} className="bg-black text-white hover:bg-black/90 flex items-center gap-2">
              <Download size={16} />
              Download PDF
            </Button>
            <Button onClick={handleBackToSessions} variant="outline">
              Back to Sessions
            </Button>
          </div>
        </div>

        {/* Audio Section - Always visible and not collapsible */}
        <div className="glass-card rounded-lg p-6 animate-fade-in">
          <h2 className="text-xl font-semibold mb-4">Audio Playback</h2>
          {audioResponse?.audio?.status === 'not_started' && (
            <p className="text-gray-500 italic">Audio has not been uploaded yet.</p>
          )}
          {audioResponse?.audio?.status === 'processing' && (
            <p className="text-gray-500 animate-pulse">Audio is still being processed...</p>
          )}
          {(audioError || audioResponse?.audio?.status === 'failed') && (
            <p className="text-red-500">Failed to load audio file.</p>
          )}
          {audioResponse?.audio?.status === 'completed' && resolvedAudio && (
            <AudioPlayer
              audioUrl={resolvedAudio}
              duration={metadata.duration || undefined}
              onTimeUpdate={handleTimeUpdate}
            />
          )}
        </div>

        {/* Session Summary */}
        <CollapsibleSection title="Session Summary" defaultExpanded={true}>
          {summaryResponse?.summary?.status === 'not_started' ? (
            <p className="text-gray-500 italic">Summary has not been generated yet.</p>
          ) : summaryResponse?.summary?.status === 'processing' ? (
            <p className="text-gray-500 animate-pulse">Summary is still being generated...</p>
          ) : summaryError || summaryResponse?.summary?.status === 'failed' ? (
            <p className="text-red-500">Failed to load summary.</p>
          ) : (
            <div
              className="prose prose-gray max-w-none leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(resolvedSummary?.text || "") }}
            />
          )}
        </CollapsibleSection>

        {/* Emotion Analysis */}
        <CollapsibleSection title="Emotional Analysis" defaultExpanded={true}>
          {emotionResponse?.analyzed_emotions?.status === 'not_started' ? (
            <p className="text-gray-500 italic">Emotion analysis has not started.</p>
          ) : emotionResponse?.analyzed_emotions?.status === 'processing' ? (
            <p className="text-gray-500 animate-pulse">Analyzing emotions...</p>
          ) : emotionsError || emotionResponse.analyzed_emotions?.status === 'failed' ? (
            <p className="text-red-500">Failed to load emotion data.</p>
          ) : availableEmotions.length > 0 ? (
            <>
              <EmotionFilter
                availableEmotions={availableEmotions}
                selectedEmotions={selectedEmotions}
                onEmotionToggle={handleEmotionToggle}
                onSelectAll={handleSelectAllEmotions}
                onDeselectAll={handleDeselectAllEmotions}
              />
              <EmotionChartsGrid
                currentTime={currentTime}
                selectedEmotions={selectedEmotions}
                emotionData={resolvedEmotions}
              />
            </>
          ) : (
            <p className="text-gray-600">No emotion data available.</p>
          )}
        </CollapsibleSection>

        {/* Transcript */}
        <CollapsibleSection title="Transcript" defaultExpanded={true}>
          {transcriptResponse?.transcript?.status === 'not_started' ? (
            <p className="text-gray-500 italic">Transcription has not started yet.</p>
          ) : transcriptResponse?.transcript?.status === 'processing' ? (
            <p className="text-gray-500 animate-pulse">Transcribing audio...</p>
          ) : transcriptError || transcriptResponse?.transcript?.status === 'failed' ? (
            <p className="text-red-500">Could not load transcript.</p>
          ) : resolvedTranscript.length > 0 ? (
            <TranscriptionCard
              segments={resolvedTranscript}
              title=""
              currentTime={currentTime}
            />
          ) : (
            <p className="text-gray-600">No transcript available.</p>
          )}
        </CollapsibleSection>

        {/* Session Details */}
        <CollapsibleSection title="Session Details" defaultExpanded={false}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Date</h3>
              <p className="font-medium">{formatDate(metadata?.created_at)}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Duration</h3>
              <p className="font-medium">{formatDuration(metadata?.duration)}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Participants</h3>
              <p className="font-medium">{metadata?.participants?.join(', ') || 'No participants listed'}</p>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
};

export default SessionSummary;
