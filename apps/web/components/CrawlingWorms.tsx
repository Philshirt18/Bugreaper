'use client';

import { useEffect, useState } from 'react';

interface Worm {
  id: number;
  segments: Array<{ x: number; y: number }>;
  targetX: number;
  targetY: number;
  speed: number;
}

export default function CrawlingWorms() {
  const [worms, setWorms] = useState<Worm[]>([]);

  useEffect(() => {
    const spawnWorm = () => {
      const startSide = Math.floor(Math.random() * 4);
      let startX, startY, targetX, targetY;

      switch (startSide) {
        case 0: // top
          startX = Math.random() * window.innerWidth;
          startY = -50;
          targetX = Math.random() * window.innerWidth;
          targetY = window.innerHeight + 50;
          break;
        case 1: // right
          startX = window.innerWidth + 50;
          startY = Math.random() * window.innerHeight;
          targetX = -50;
          targetY = Math.random() * window.innerHeight;
          break;
        case 2: // bottom
          startX = Math.random() * window.innerWidth;
          startY = window.innerHeight + 50;
          targetX = Math.random() * window.innerWidth;
          targetY = -50;
          break;
        default: // left
          startX = -50;
          startY = Math.random() * window.innerHeight;
          targetX = window.innerWidth + 50;
          targetY = Math.random() * window.innerHeight;
      }

      const segmentCount = 8;
      const segments = Array.from({ length: segmentCount }, () => ({
        x: startX,
        y: startY
      }));

      const newWorm: Worm = {
        id: Date.now() + Math.random(),
        segments,
        targetX,
        targetY,
        speed: 1 + Math.random() * 1.5
      };

      setWorms(prev => [...prev, newWorm]);

      setTimeout(() => {
        setWorms(prev => prev.filter(w => w.id !== newWorm.id));
      }, 15000);
    };

    const interval = setInterval(spawnWorm, 10000 + Math.random() * 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const moveWorms = setInterval(() => {
      setWorms(prev => prev.map(worm => {
        const head = worm.segments[0];
        const dx = worm.targetX - head.x;
        const dy = worm.targetY - head.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) return worm;
        
        const newHeadX = head.x + (dx / distance) * worm.speed;
        const newHeadY = head.y + (dy / distance) * worm.speed;
        
        const newSegments = [
          { x: newHeadX, y: newHeadY },
          ...worm.segments.slice(0, -1)
        ];
        
        return {
          ...worm,
          segments: newSegments
        };
      }));
    }, 50);

    return () => clearInterval(moveWorms);
  }, []);

  const getRotation = (seg1: { x: number; y: number }, seg2: { x: number; y: number }) => {
    const dx = seg2.x - seg1.x;
    const dy = seg2.y - seg1.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9990 }}>
      {worms.map(worm => (
        <div key={worm.id}>
          {worm.segments.map((segment, index) => {
            const nextSegment = worm.segments[index + 1] || segment;
            const rotation = getRotation(segment, nextSegment);
            const isHead = index === 0;
            const isTail = index === worm.segments.length - 1;
            
            return (
              <div
                key={`${worm.id}-${index}`}
                style={{
                  position: 'absolute',
                  left: `${segment.x}px`,
                  top: `${segment.y}px`,
                  width: isHead ? '12px' : isTail ? '6px' : '10px',
                  height: isHead ? '12px' : isTail ? '6px' : '10px',
                  borderRadius: '50%',
                  background: isHead 
                    ? 'radial-gradient(circle, #8B4513 0%, #654321 100%)'
                    : 'radial-gradient(circle, #A0522D 0%, #8B4513 100%)',
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  opacity: 0.85,
                  transition: 'all 0.05s linear'
                }}
              >
                {isHead && (
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: '3px',
                    width: '2px',
                    height: '2px',
                    borderRadius: '50%',
                    background: '#000',
                    boxShadow: '4px 0 0 #000'
                  }} />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
