
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Square } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  duration?: number;
  onTimeUpdate?: (currentTime: number) => void;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  duration,
  onTimeUpdate,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onTimeUpdate?.(0);
    };

    const handleError = () => {
      setIsLoading(false);
      console.error('Error loading audio');
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onTimeUpdate]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const seekTime = value[0];
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
    onTimeUpdate?.(seekTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className={`glass-card rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
          <span className="ml-2 text-gray-600">Loading audio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card rounded-lg p-4 ${className}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="flex items-center gap-4">
        <Button
          onClick={togglePlayPause}
          className="bg-black text-white hover:bg-black/90"
          size="icon"
        >
          {isPlaying ? <Square size={16} /> : <Play size={16} />}
        </Button>
        
        <div className="flex-1">
          <Slider
            value={[currentTime]}
            max={audioDuration}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />
        </div>
        
        <div className="text-sm text-gray-600 min-w-[100px] text-right">
          {formatTime(currentTime)} / {formatTime(audioDuration)}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
