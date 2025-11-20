'use client';

import { useEffect, useState } from 'react';

export default function GlitchEffect() {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 100 + Math.random() * 200);
    }, 5000 + Math.random() * 10000);

    return () => clearInterval(glitchInterval);
  }, []);

  if (!isGlitching) return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9997,
        pointerEvents: 'none',
        background: `rgba(${Math.random() * 255}, 0, 0, 0.1)`,
        animation: 'glitchFlash 0.1s infinite',
        mixBlendMode: 'screen'
      }} />
      
      <style jsx>{`
        @keyframes glitchFlash {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}
