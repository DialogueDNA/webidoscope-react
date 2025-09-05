import React from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2 } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  duration?: number;
  onTimeUpdate?: (time: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, duration, onTimeUpdate }) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [totalDuration, setTotalDuration] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const handleLoadedMetadata = () => {
    setLoading(false);
    if (audioRef.current) {
      setTotalDuration(audioRef.current.duration);
    }
  };

  const handleCanPlay = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    console.error("❌ Failed to load audio");
  };

  const handleTimeUpdate = () => {
    if (onTimeUpdate && audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate(time);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && totalDuration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * totalDuration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  React.useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updatePlaying = () => setIsPlaying(!audio.paused);
      audio.addEventListener('play', updatePlaying);
      audio.addEventListener('pause', updatePlaying);
      return () => {
        audio.removeEventListener('play', updatePlaying);
        audio.removeEventListener('pause', updatePlaying);
      };
    }
  }, []);

  return (
    <div className="w-full space-y-4">
      {loading && !error && (
        <div className="flex items-center justify-center h-24 text-muted-foreground">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mr-3 h-6 w-6 border-2 border-primary border-t-transparent rounded-full"
          />
          <span className="font-medium">Loading audio...</span>
        </div>
      )}
      
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
          <p className="font-medium">Audio could not be loaded. Please try again later.</p>
        </div>
      )}
      
      {/* Custom Audio Controls */}
      {!loading && !error && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-4 mb-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayPause}
              className="flex items-center justify-center w-12 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg transition-colors creative-focus-ring"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </motion.button>
            
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
              <Volume2 size={16} />
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(totalDuration || duration || 0)}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div 
              className="h-2 bg-muted rounded-full cursor-pointer relative overflow-hidden"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-primary rounded-full transition-all duration-150"
                style={{ 
                  width: totalDuration ? `${(currentTime / totalDuration) * 100}%` : '0%' 
                }}
              />
              {/* Glow effect on progress */}
              <div 
                className="absolute top-0 h-full bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full transition-all duration-150"
                style={{ 
                  width: '20px',
                  left: totalDuration ? `calc(${(currentTime / totalDuration) * 100}% - 10px)` : '0%' 
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onTimeUpdate={handleTimeUpdate}
        className="hidden"
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioPlayer;
