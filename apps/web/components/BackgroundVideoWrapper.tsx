'use client';

import { useVideo } from '@/contexts/VideoContext';
import BackgroundVideo from './BackgroundVideo';

export default function BackgroundVideoWrapper() {
  const { showBackgroundVideo } = useVideo();
  return <BackgroundVideo trigger={showBackgroundVideo} />;
}
