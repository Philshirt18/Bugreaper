'use client';

import { useState } from 'react';

export default function CrackingScreen() {
  const [cracks, setCracks] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [isShattered, setIsShattered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    const newCrack = {
      x: e.clientX,
      y: e.clientY,
      id: Date.now()
    };
    setCracks(prev => [...prev, newCrack]);

    if (cracks.length >= 4) {
      setIsShattered(true);
      setTimeout(() => {
        setCracks([]);
        setIsShattered(false);
      }, 2000);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9995,
        pointerEvents: isShattered ? 'none' : 'auto',
        cursor: 'crosshair'
      }}
    >
      {cracks.map(crack => (
        <svg
          key={crack.id}
          style={{
            position: 'absolute',
            left: crack.x,
            top: crack.y,
            width: '200px',
            height: '200px',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}
        >
          <g stroke="#A52A2A" strokeWidth="2" fill="none" opacity="0.7">
            <line x1="100" y1="100" x2="20" y2="30" />
            <line x1="100" y1="100" x2="180" y2="40" />
            <line x1="100" y1="100" x2="150" y2="170" />
            <line x1="100" y1="100" x2="40" y2="160" />
            <line x1="20" y1="30" x2="0" y2="0" />
            <line x1="180" y1="40" x2="200" y2="20" />
            <line x1="150" y1="170" x2="170" y2="200" />
            <line x1="40" y1="160" x2="10" y2="200" />
          </g>
        </svg>
      ))}
      
      {isShattered && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          animation: 'shatter 0.5s ease-out',
          pointerEvents: 'none'
        }}>
          <style jsx>{`
            @keyframes shatter {
              0% { opacity: 0; }
              50% { opacity: 1; }
              100% { opacity: 0; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
