'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface VideoContextType {
  showBackgroundVideo: boolean;
  triggerBackgroundVideo: () => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: ReactNode }) {
  const [showBackgroundVideo, setShowBackgroundVideo] = useState(false);

  const triggerBackgroundVideo = () => {
    console.log('🎬 VideoContext: Triggering background video');
    setShowBackgroundVideo(true);
  };

  console.log('🎬 VideoContext: Provider rendered, showBackgroundVideo =', showBackgroundVideo);

  return (
    <VideoContext.Provider value={{ showBackgroundVideo, triggerBackgroundVideo }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
}
