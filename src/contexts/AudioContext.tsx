import React, { createContext, useContext, useState, useRef } from 'react';

interface AudioContextType {
  audioRef: React.RefObject<HTMLAudioElement>;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  seekTo: (time: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        audioRef,
        currentTime,
        setCurrentTime,
        seekTo,
        isPlaying,
        setIsPlaying,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};