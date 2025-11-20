'use client';

import { useEffect, useState } from 'react';

interface BackgroundVideoProps {
  trigger?: boolean;
}

export default function BackgroundVideo({ trigger = false }: BackgroundVideoProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      console.log('🎬 BackgroundVideo triggered - showing for 6 seconds');
      setShow(true);
      
      // Hide after 6 seconds
      const timer = setTimeout(() => {
        console.log('⏱️ 6 seconds elapsed - hiding video');
        setShow(false);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none" 
      style={{ 
        zIndex: 9998,
        opacity: 0.7
      }}
    >
      <video
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
        onLoadedData={() => console.log('✅ Background video loaded and playing')}
        onError={(e) => console.error('❌ Background video error:', e)}
        onPlay={() => console.log('▶️ Background video started playing')}
      >
        <source src="/videos/app-background.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
