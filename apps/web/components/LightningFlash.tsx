'use client';

import { useEffect, useState } from 'react';

export default function LightningFlash() {
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    const triggerLightning = () => {
      setIsFlashing(true);
      
      // Multiple flashes
      setTimeout(() => setIsFlashing(false), 100);
      setTimeout(() => setIsFlashing(true), 150);
      setTimeout(() => setIsFlashing(false), 200);
      setTimeout(() => setIsFlashing(true), 400);
      setTimeout(() => setIsFlashing(false), 450);
    };

    const interval = setInterval(triggerLightning, 15000 + Math.random() * 20000);
    return () => clearInterval(interval);
  }, []);

  if (!isFlashing) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(255, 255, 255, 0.9)',
      zIndex: 9992,
      pointerEvents: 'none',
      animation: 'lightningFlash 0.1s'
    }}>
      <style jsx>{`
        @keyframes lightningFlash {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
