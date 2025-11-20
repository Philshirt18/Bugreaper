'use client';

import { useEffect, useState } from 'react';

interface Shadow {
  id: number;
  side: 'left' | 'right';
  y: number;
  visible: boolean;
}

export default function ShadowFigures() {
  const [shadows, setShadows] = useState<Shadow[]>([]);

  useEffect(() => {
    const spawnShadow = () => {
      const newShadow: Shadow = {
        id: Date.now(),
        side: Math.random() > 0.5 ? 'left' : 'right',
        y: Math.random() * (window.innerHeight - 200),
        visible: true
      };

      setShadows(prev => [...prev, newShadow]);

      // Remove shadow after 3 seconds
      setTimeout(() => {
        setShadows(prev => prev.filter(s => s.id !== newShadow.id));
      }, 3000);
    };

    const interval = setInterval(spawnShadow, 8000 + Math.random() * 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9994 }}>
      {shadows.map(shadow => (
        <div
          key={shadow.id}
          style={{
            position: 'absolute',
            [shadow.side]: 0,
            top: `${shadow.y}px`,
            width: '150px',
            height: '200px',
            background: 'linear-gradient(to ' + (shadow.side === 'left' ? 'right' : 'left') + ', rgba(0,0,0,0.9) 0%, transparent 100%)',
            animation: 'shadowFade 3s ease-in-out',
            opacity: shadow.visible ? 1 : 0
          }}
        >
          <div style={{
            width: '60px',
            height: '180px',
            background: '#000',
            opacity: 0.8,
            filter: 'blur(10px)',
            margin: shadow.side === 'left' ? '10px 0 0 20px' : '10px 20px 0 0',
            borderRadius: '50% 50% 40% 40%'
          }} />
        </div>
      ))}
      
      <style jsx>{`
        @keyframes shadowFade {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
