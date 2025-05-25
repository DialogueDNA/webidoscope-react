
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import EmotionChart from '@/components/EmotionChart';
import TranscriptionCard from '@/components/TranscriptionCard';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useSessionDetail } from '@/hooks/useSessionsData';
import { toast } from '@/hooks/use-toast';

const SessionSummary = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: session, isLoading, error } = useSessionDetail(id || '');

  const handleBackToSessions = () => {
    navigate('/sessions');
  };

  const handleDownloadPDF = async () => {
    if (!session) return;

    try {
      // Send request to backend to generate PDF
      const response = await fetch(`/api/sessions/${session.id}/pdf`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${session.title}-summary.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      console.error('PDF download failed:', error);
      toast({
        title: "Error",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'Unknown duration';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const parseTranscript = (transcript: string | null) => {
    if (!transcript) return [];
    
    // Simple parsing - split by lines and assume format "Speaker: message"
    const lines = transcript.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        return {
          speaker: line.substring(0, colonIndex).trim(),
          text: line.substring(colonIndex + 1).trim()
        };
      }
      return { speaker: 'Unknown', text: line };
    });
  };

  const generateEmotionData = (emotionBreakdown: any) => {
    if (!emotionBreakdown) {
      // Return sample data for demo
      return [
        { name: '0min', value: 40 },
        { name: '5min', value: 45 },
        { name: '10min', value: 60 },
        { name: '15min', value: 50 },
        { name: '20min', value: 70 },
        { name: '25min', value: 55 },
        { name: '30min', value: 65 },
      ];
    }
    
    // Transform emotion breakdown into chart data
    return Object.entries(emotionBreakdown).map(([time, value]) => ({
      name: time,
      value: Number(value)
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Session not found</h2>
            <p className="text-gray-600 mb-4">The session you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={handleBackToSessions}>Back to Sessions</Button>
          </div>
        </div>
      </div>
    );
  }

  const transcriptMessages = parseTranscript(session.transcript);
  const emotionData = generateEmotionData(session.emotion_breakdown);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col page-transition">
      <Navbar />
      
      <div className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 animate-fade-in">{session.title}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {session.summary && (
            <div className="glass-card rounded-lg p-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Session Summary</h2>
              <p className="text-gray-700 leading-relaxed">{session.summary}</p>
            </div>
          )}
          
          <div className="animate-fade-in">
            <EmotionChart 
              data={emotionData} 
              title="Emotional Shifts During the Session" 
              height={250}
            />
          </div>
        </div>

        {transcriptMessages.length > 0 && (
          <div className="mb-8 animate-fade-in">
            <TranscriptionCard 
              messages={transcriptMessages}
              title="Session Transcript"
            />
          </div>
        )}
        
        <div className="glass-card rounded-lg p-6 mb-8 animate-fade-in">
          <h2 className="text-xl font-semibold mb-4">Session Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Date</h3>
              <p className="font-medium">{formatDate(session.created_at)}</p>
            </div>
            
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Duration</h3>
              <p className="font-medium">{formatDuration(session.duration)}</p>
            </div>
            
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Participants</h3>
              <p className="font-medium">
                {session.participants?.join(', ') || 'No participants listed'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Button 
            onClick={handleDownloadPDF}
            className="bg-black text-white hover:bg-black/90 animate-fade-in flex items-center gap-2"
          >
            <Download size={16} />
            Download PDF
          </Button>
          
          <Button 
            onClick={handleBackToSessions}
            variant="outline"
            className="animate-fade-in"
          >
            Back to Sessions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;
