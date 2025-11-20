'use client';

import { useEffect, useState } from 'react';

interface Ghost {
  id: number;
  x: number;
  y: number;
  speed: number;
  opacity: number;
  size: number;
}

export default function FloatingGhosts() {
  const [ghosts, setGhosts] = useState<Ghost[]>([]);

  useEffect(() => {
    // Create initial ghosts
    const initialGhosts: Ghost[] = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: -100,
      y: Math.random() * window.innerHeight,
      speed: 20 + Math.random() * 30,
      opacity: 0.3 + Math.random() * 0.4,
      size: 40 + Math.random() * 40
    }));
    setGhosts(initialGhosts);

    // Animate ghosts
    const interval = setInterval(() => {
      setGhosts(prev => prev.map(ghost => ({
        ...ghost,
        x: ghost.x > window.innerWidth + 100 ? -100 : ghost.x + ghost.speed,
        y: ghost.y + Math.sin(ghost.x / 100) * 2
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9996 }}>
      {ghosts.map(ghost => (
        <div
          key={ghost.id}
          style={{
            position: 'absolute',
            left: `${ghost.x}px`,
            top: `${ghost.y}px`,
            fontSize: `${ghost.size}px`,
            opacity: ghost.opacity,
            transition: 'opacity 0.5s',
            filter: 'blur(1px)',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.8)'
          }}
        >
          👻
        </div>
      ))}
    </div>
  );
}
