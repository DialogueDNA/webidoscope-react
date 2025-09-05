/**
 * SessionSummary
 *
 * Responsibilities:
 * - Fetch & display session metadata, audio, transcript, emotions and summary.
 * - Show progress states via usePollUntilReady until each artifact is ready.
 * - Render the summary (Markdown), transcript, and emotion charts.
 * - Provide:
 *    1) "Change summary type" dialog → POST /api/sessions/summary/:id/generate.
 *    2) "Name speakers" dialog → GET/PUT /api/sessions/:id/speakers.
 *       Applies custom speaker names across Transcript & Emotion charts.
 *
 * Notes:
 * - Assumes backend exposes:
 *     GET  /api/sessions/summary/presets
 *     POST /api/sessions/summary/:id/generate   (body: { preset: "<key>" })
 *     GET  /api/sessions/:id/speakers
 *     PUT  /api/sessions/:id/speakers           (body: { map: { "1": "Amal", ... } })
 *     GET  /api/summary/:id/download            (PDF download; keep as in your backend)
 */

import React from 'react';
import { marked } from 'marked';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import Navbar from '@/components/Navbar';
import SectionCard from '@/components/SectionCard';
import EmotionChartsGrid from '@/components/EmotionChartsGrid';
import TranscriptionCard from '@/components/TranscriptionCard';
import AudioPlayer from '@/components/AudioPlayer';
import CollapsibleSection from '@/components/CollapsibleSection';
import EmotionFilter from '@/components/EmotionFilter';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

import {
  useSessionEmotion,
  useSessionTranscript,
  useSessionSummary,
  useSessionMetadata,
  useSessionAudio,
} from '@/hooks/useSessionsData';

import { usePollUntilReady } from '@/hooks/usePollUntilReady';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';

const SessionSummary: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ---------- Page local state ----------
  const [currentTime, setCurrentTime] = React.useState<number>(0);
  const [selectedEmotions, setSelectedEmotions] = React.useState<string[]>([]);
  const [availableEmotions, setAvailableEmotions] = React.useState<string[]>([]);

  // Dialog state for "Change summary type"
  const [openChangeDialog, setOpenChangeDialog] = React.useState(false);
  const [dialogPresets, setDialogPresets] = React.useState<{ key: string; label: string }[]>([]);
  const [dialogPreset, setDialogPreset] = React.useState<string>('');
  const [loadingDialogPresets, setLoadingDialogPresets] = React.useState(false);
  const [submittingOverride, setSubmittingOverride] = React.useState(false);

  // Speaker naming state
  const [speakerMap, setSpeakerMap] = React.useState<Record<string, string>>({});
  const [openNameDialog, setOpenNameDialog] = React.useState(false);
  const [detectedSpeakers, setDetectedSpeakers] = React.useState<string[]>([]);
  const [samples, setSamples] = React.useState<Record<string, string>>({});
  const [editingMap, setEditingMap] = React.useState<Record<string, string>>({});
  const [savingNames, setSavingNames] = React.useState(false);

  // ---------- Data hooks ----------
  const {
    data: metadataResponse,
    isLoading: loadingMetadata,
    error: metadataError,
    refetch: refetchMetadata,
  } = useSessionMetadata(id || '');

  const {
    data: summaryResponse,
    isLoading: loadingSummary,
    error: summaryError,
    refetch: refetchSummary,
  } = useSessionSummary(id || '');

  const {
    data: transcriptResponse,
    isLoading: loadingTranscript,
    error: transcriptError,
    refetch: refetchTranscript,
  } = useSessionTranscript(id || '');

  const {
    data: emotionResponse,
    isLoading: loadingEmotions,
    error: emotionsError,
    refetch: refetchEmotion,
  } = useSessionEmotion(id || '');

  const {
    data: audioResponse,
    isLoading: loadingAudio,
    error: audioError,
    refetch: refetchAudio,
  } = useSessionAudio(id || '');

  // Poll each resource until ready
  usePollUntilReady(metadataResponse?.status, refetchMetadata);
  usePollUntilReady(summaryResponse?.status, refetchSummary);
  usePollUntilReady(transcriptResponse?.status, refetchTranscript);
  usePollUntilReady(emotionResponse?.status, refetchEmotion);
  usePollUntilReady(audioResponse?.status, refetchAudio);

  // ---------- Resolved artifacts (fetched from signed URLs) ----------
  const [resolvedTranscript, setResolvedTranscript] = React.useState<string | null>(null);
  const [resolvedSummary, setResolvedSummary] = React.useState<string | null>(null);
  const [resolvedEmotions, setResolvedEmotions] = React.useState<any | null>(null);
  const [resolvedAudio, setResolvedAudio] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (audioResponse?.status === 'completed' && audioResponse.data) {
      setResolvedAudio(audioResponse.data);
    }
  }, [audioResponse]);

  React.useEffect(() => {
    if (transcriptResponse?.status === 'completed' && transcriptResponse.data) {
      fetch(transcriptResponse.data)
        .then((res) => res.text())
        .then(setResolvedTranscript)
        .catch(() => setResolvedTranscript(null));
    }
  }, [transcriptResponse]);

  React.useEffect(() => {
    if (summaryResponse?.status === 'completed' && summaryResponse.data) {
      fetch(summaryResponse.data)
        .then((res) => res.text())
        .then(setResolvedSummary)
        .catch(() => setResolvedSummary(null));
    }
  }, [summaryResponse]);

  React.useEffect(() => {
    if (emotionResponse?.status === 'completed' && emotionResponse.data) {
      fetch(emotionResponse.data)
        .then((res) => res.json())
        .then(setResolvedEmotions)
        .catch(() => setResolvedEmotions(null));
    }
  }, [emotionResponse]);

  React.useEffect(() => {
    if (resolvedEmotions && Array.isArray(resolvedEmotions) && resolvedEmotions.length > 0) {
      const emotions = new Set<string>();
      resolvedEmotions.forEach((entry: any) => {
        if (entry.emotions && Array.isArray(entry.emotions)) {
          entry.emotions.forEach((emotion: any) => {
            if (emotion.label) emotions.add(String(emotion.label).toLowerCase());
          });
        }
      });
      const emotionList = Array.from(emotions).sort();
      setAvailableEmotions(emotionList);
      setSelectedEmotions(emotionList); // start with all emotions selected
    }
  }, [resolvedEmotions]);

  // Load speaker map once transcript is ready
  React.useEffect(() => {
    if (!id) return;
    if (transcriptResponse?.status === 'completed') {
      apiClient(`/api/sessions/speakers/${id}`)
        .then((res) => setSpeakerMap(res?.map ?? {}))
        .catch(() => setSpeakerMap({}));
    }
  }, [id, transcriptResponse?.status]);

  const metadata = metadataResponse?.data;

  // ---------- Helpers ----------
  const applySpeakerName = (spk: any) => {
    const key = String(spk ?? '');
    const custom = speakerMap[key];
    if (custom && custom.trim()) return custom.trim();
    return typeof spk === 'number' ? `Speaker ${spk}` : String(spk || 'Unknown');
  };

  const truncate = (t?: string, n: number = 120) => {
    if (!t) return '';
    return t.length > n ? `${t.slice(0, n)}…` : t;
  };

  // ---------- UI handlers ----------
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

  const onOpenChangeDialog = (v: boolean) => {
    setOpenChangeDialog(v);
    if (v) {
      setLoadingDialogPresets(true);
      apiClient('/api/sessions/summary/presets')
        .then((res) => setDialogPresets(res?.presets ?? []))
        .finally(() => setLoadingDialogPresets(false));
    } else {
      setDialogPreset('');
    }
  };

  const onGenerateOverride = async () => {
    if (!id || !dialogPreset) return;
    setSubmittingOverride(true);
    try {
      await apiClient(`/api/sessions/summary/${id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset: dialogPreset }),
      });
      toast({ title: 'Summary updated', description: 'A new summary has been generated.' });
      setOpenChangeDialog(false);
      setDialogPreset('');
      refetchSummary();
    } catch (e: any) {
      toast({ title: 'Failed', description: e?.message ?? 'Could not regenerate summary', variant: 'destructive' });
    } finally {
      setSubmittingOverride(false);
    }
  };

  // Speaker naming dialog handlers
  const openNameSpeakers = async () => {
    if (!id) return;
    setOpenNameDialog(true);
    try {
      const res = await apiClient(`/api/sessions/speakers/${id}`);
      setDetectedSpeakers(res?.detected ?? []);
      setSamples(res?.samples ?? {});
      const base: Record<string, string> = {};
      (res?.detected ?? []).forEach((k: string) => (base[k] = (res?.map ?? {})[k] || ''));
      setEditingMap(base);
    } catch {
      toast({ title: 'Error', description: 'Failed to load speakers', variant: 'destructive' });
    }
  };

  const saveNames = async () => {
    if (!id) return;
    setSavingNames(true);
    try {
      await apiClient(`/api/sessions/speakers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ map: editingMap }),
      });
      setSpeakerMap(editingMap);
      await refetchMetadata();
      setOpenNameDialog(false);
      toast({ title: 'Saved', description: 'Speaker names saved' });

      // Optional: suggest regenerating summary to apply names inside the text
      if (summaryResponse?.status === 'completed') {
        toast({ title: 'Tip', description: 'Names updated. Regenerate the summary to apply.' });
      }
    } catch (e: any) {
      toast({ title: 'Failed', description: e?.message ?? 'Could not save speakers', variant: 'destructive' });
    } finally {
      setSavingNames(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const formatDuration = (seconds: number | null) => {
    if (!seconds && seconds !== 0) return 'Unknown duration';
    const sNum = Number(seconds || 0);
    const h = Math.floor(sNum / 3600);
    const m = Math.floor((sNum % 3600) / 60);
    const s = Math.floor(sNum % 60);
    const parts: string[] = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(' ');
  };

  const renderMarkdown = (markdown: string) => marked.parse(markdown);

  type TranscriptEntry = { 
    speaker: string; 
    text: string;
    start_time?: number;
    end_time?: number;
  };

  const parseTranscript = (json: string | null): TranscriptEntry[] => {
    if (!json) return [];
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((entry) => entry.speaker !== undefined && entry.text !== undefined)
          .map((entry) => ({
            speaker: applySpeakerName(entry.speaker),
            text: entry.text,
            start_time: entry.start_time,
            end_time: entry.end_time,
          }));
      }
    } catch (error) {
      console.error('Failed to parse transcript JSON:', error);
    }
    return [];
  };

  type EmotionRaw = {
    speaker: string | number;
    text: string;
    start_time: number;
    end_time: number;
    emotions: { label: string; score: number }[];
  };

  type ChartPoint = {
    end_time: number;
    [emotionLabel: string]: number;
  };

  const generateEmotionChartData = (raw: EmotionRaw[] = []): { [speaker: string]: ChartPoint[] } => {
    if (!raw || raw.length === 0) return {};
    const speakerData: { [speaker: string]: ChartPoint[] } = {};
    raw.forEach((entry) => {
      const speakerKey = applySpeakerName(entry.speaker);
      if (!speakerData[speakerKey]) speakerData[speakerKey] = [];
      const point: ChartPoint = { end_time: Number(entry.end_time?.toFixed?.(2) ?? entry.end_time) };
      for (const emotion of entry.emotions || []) {
        point[String(emotion.label).toLowerCase()] = Number((emotion.score * 100).toFixed(2));
      }
      speakerData[speakerKey].push(point);
    });
    return speakerData;
  };

  const handleTimeUpdate = (time: number) => setCurrentTime(time);

  const handleEmotionToggle = (emotion: string) => {
    setSelectedEmotions((prev) => (prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]));
  };

  const handleSelectAllEmotions = () => setSelectedEmotions(availableEmotions);
  const handleDeselectAllEmotions = () => setSelectedEmotions([]);

  // ---------- Loading & error states ----------
  if (loadingMetadata || metadataResponse?.status !== 'completed') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-muted-foreground font-medium">Loading session...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (metadataError || metadataResponse?.status !== 'completed' || !metadata) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="creative-card p-8 max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-2xl text-destructive">⚠️</span>
              </div>
              <h2 className="font-heading text-xl font-medium text-foreground mb-2">Session not found</h2>
              <p className="text-muted-foreground mb-6">The session doesn't exist or you don't have access.</p>
              <Button onClick={handleBackToSessions} className="creative-focus-ring">
                Back to Sessions
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const transcriptMessages = parseTranscript(resolvedTranscript);
  const emotionChartData = generateEmotionChartData(resolvedEmotions);

  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <h1 className="font-heading text-3xl lg:text-4xl font-medium text-foreground">
              {metadata.title}
            </h1>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={openNameSpeakers} className="creative-focus-ring">
                Name speakers
              </Button>
              <Button variant="outline" onClick={() => onOpenChangeDialog(true)} className="creative-focus-ring">
                Change summary type
              </Button>
              <Button onClick={handleDownloadPDF} className="creative-focus-ring flex items-center gap-2">
                <Download size={16} />
                Download PDF
              </Button>
              <Button onClick={handleBackToSessions} variant="outline" className="creative-focus-ring">
                Back to Sessions
              </Button>
            </div>
          </motion.div>

          {/* Audio Section */}
          <SectionCard accent title="Audio Playback">
            <div className="p-6">
              {audioResponse?.status === 'not_started' && (
                <p className="text-muted-foreground italic">Audio has not been uploaded yet.</p>
              )}
              {audioResponse?.status === 'processing' && (
                <motion.p 
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-muted-foreground"
                >
                  Audio is still being processed...
                </motion.p>
              )}
              {(audioError || audioResponse?.status === 'failed') && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                  Failed to load audio file.
                </div>
              )}
              {audioResponse?.status === 'completed' && resolvedAudio && (
                <AudioPlayer
                  audioUrl={resolvedAudio}
                  duration={metadata.duration || undefined}
                  onTimeUpdate={handleTimeUpdate}
                />
              )}
            </div>
          </SectionCard>

          {/* Session Summary */}
          <SectionCard accent title="Session Summary">
            <div className="p-6">
              {summaryResponse?.status === 'not_started' ? (
                <p className="text-muted-foreground italic">Summary has not been generated yet.</p>
              ) : summaryResponse?.status === 'processing' ? (
                <motion.p 
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-muted-foreground"
                >
                  Summary is still being generated...
                </motion.p>
              ) : summaryError || summaryResponse?.status === 'failed' ? (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                  Failed to load summary.
                </div>
              ) : (
                <div
                  className="prose prose-lg max-w-none leading-relaxed text-foreground"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(resolvedSummary || '') }}
                />
              )}
            </div>
          </SectionCard>

          {/* Emotional Analysis */}
          <SectionCard accent title="Emotional Analysis">
            <div className="p-6">
              {emotionResponse?.status === 'not_started' ? (
                <p className="text-muted-foreground italic">Emotion analysis has not started.</p>
              ) : emotionResponse?.status === 'processing' ? (
                <motion.p 
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-muted-foreground"
                >
                  Analyzing emotions...
                </motion.p>
              ) : emotionsError || emotionResponse?.status === 'failed' ? (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                  Failed to load emotion data.
                </div>
              ) : availableEmotions.length > 0 ? (
                <div className="space-y-6">
                  <EmotionFilter
                    availableEmotions={availableEmotions}
                    selectedEmotions={selectedEmotions}
                    onEmotionToggle={handleEmotionToggle}
                    onSelectAll={handleSelectAllEmotions}
                    onDeselectAll={handleDeselectAllEmotions}
                  />
                  <EmotionChartsGrid
                    chartData={emotionChartData}
                    currentTime={currentTime}
                    selectedEmotions={selectedEmotions}
                    emotionData={resolvedEmotions}
                  />
                </div>
              ) : (
                <p className="text-muted-foreground">No emotion data available.</p>
              )}
            </div>
          </SectionCard>

          {/* Transcript */}
          <SectionCard accent title="Transcript">
            <div className="p-0"> {/* No padding for transcript card as it has its own */}
              {transcriptResponse?.status === 'not_started' ? (
                <div className="p-6">
                  <p className="text-muted-foreground italic">Transcription has not started yet.</p>
                </div>
              ) : transcriptResponse?.status === 'processing' ? (
                <div className="p-6">
                  <motion.p 
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-muted-foreground"
                  >
                    Transcribing audio...
                  </motion.p>
                </div>
              ) : transcriptError || transcriptResponse?.status === 'failed' ? (
                <div className="p-6">
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                    Could not load transcript.
                  </div>
                </div>
              ) : transcriptMessages.length > 0 ? (
                <TranscriptionCard 
                  messages={transcriptMessages} 
                  title="" 
                  currentTime={currentTime} 
                  emotionData={resolvedEmotions} 
                />
              ) : (
                <div className="p-6">
                  <p className="text-muted-foreground">No transcript available.</p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Session Details */}
          <SectionCard title="Session Details">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm text-muted-foreground mb-2 font-medium">Date</h3>
                  <p className="text-foreground font-medium">{formatDate(metadata.created_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm text-muted-foreground mb-2 font-medium">Duration</h3>
                  <p className="text-foreground font-medium">{formatDuration(metadata.duration)}</p>
                </div>
                <div>
                  <h3 className="text-sm text-muted-foreground mb-2 font-medium">Participants</h3>
                  <p className="text-foreground font-medium">{metadata.participants?.join(', ') || 'No participants listed'}</p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Change summary type dialog */}
      <Dialog open={openChangeDialog} onOpenChange={onOpenChangeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change summary type</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {loadingDialogPresets ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <select
                className="w-full border rounded-md p-2"
                value={dialogPreset}
                onChange={(e) => setDialogPreset(e.target.value)}
              >
                <option value="" disabled>
                  Pick one…
                </option>
                {dialogPresets.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChangeDialog(false)} disabled={submittingOverride}>
              Cancel
            </Button>
            <Button onClick={onGenerateOverride} disabled={!dialogPreset || submittingOverride}>
              {submittingOverride ? 'Generating…' : 'Generate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Name speakers dialog */}
      <Dialog open={openNameDialog} onOpenChange={setOpenNameDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Name speakers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {detectedSpeakers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No speakers detected yet.</p>
            ) : (
              detectedSpeakers.map((k) => (
                <div key={k} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                  <div className="text-sm font-medium">Speaker {k}</div>
                  <input
                    className="border rounded-md p-2 md:col-span-1"
                    value={editingMap[k] ?? ''}
                    onChange={(e) => setEditingMap({ ...editingMap, [k]: e.target.value })}
                    placeholder="Enter name (e.g., Amal)"
                    maxLength={32}
                  />
                  <div className="text-xs text-muted-foreground md:col-span-1 truncate">
                    {truncate(samples[k])}
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpenNameDialog(false)} disabled={savingNames}>
              Cancel
            </Button>
            <Button onClick={saveNames} disabled={savingNames}>
              {savingNames ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SessionSummary;
