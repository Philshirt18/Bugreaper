'use client';

import { useEffect, useState } from 'react';

interface Spider {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  squashed: boolean;
}

export default function CrawlingSpiders() {
  const [spiders, setSpiders] = useState<Spider[]>([]);

  useEffect(() => {
    const spawnSpider = () => {
      const startSide = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
      let x, y, targetX, targetY;

      switch (startSide) {
        case 0: // top
          x = Math.random() * window.innerWidth;
          y = -20;
          targetX = Math.random() * window.innerWidth;
          targetY = window.innerHeight + 20;
          break;
        case 1: // right
          x = window.innerWidth + 20;
          y = Math.random() * window.innerHeight;
          targetX = -20;
          targetY = Math.random() * window.innerHeight;
          break;
        case 2: // bottom
          x = Math.random() * window.innerWidth;
          y = window.innerHeight + 20;
          targetX = Math.random() * window.innerWidth;
          targetY = -20;
          break;
        default: // left
          x = -20;
          y = Math.random() * window.innerHeight;
          targetX = window.innerWidth + 20;
          targetY = Math.random() * window.innerHeight;
      }

      const newSpider: Spider = {
        id: Date.now() + Math.random(),
        x,
        y,
        targetX,
        targetY,
        squashed: false
      };

      setSpiders(prev => [...prev, newSpider]);

      // Remove spider after it reaches target
      setTimeout(() => {
        setSpiders(prev => prev.filter(s => s.id !== newSpider.id));
      }, 10000);
    };

    const interval = setInterval(spawnSpider, 8000 + Math.random() * 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const moveSpiders = setInterval(() => {
      setSpiders(prev => prev.map(spider => {
        if (spider.squashed) return spider;
        
        const dx = spider.targetX - spider.x;
        const dy = spider.targetY - spider.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) return spider;
        
        const speed = 2;
        return {
          ...spider,
          x: spider.x + (dx / distance) * speed,
          y: spider.y + (dy / distance) * speed
        };
      }));
    }, 50);

    return () => clearInterval(moveSpiders);
  }, []);

  const squashSpider = (id: number) => {
    setSpiders(prev => prev.map(s => 
      s.id === id ? { ...s, squashed: true } : s
    ));
    setTimeout(() => {
      setSpiders(prev => prev.filter(s => s.id !== id));
    }, 1000);
  };

  const getRotation = (spider: Spider) => {
    const dx = spider.targetX - spider.x;
    const dy = spider.targetY - spider.y;
    return Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9991 }}>
      {spiders.map(spider => (
        <div
          key={spider.id}
          onClick={() => squashSpider(spider.id)}
          style={{
            position: 'absolute',
            left: `${spider.x}px`,
            top: `${spider.y}px`,
            fontSize: spider.squashed ? '56px' : '40px',
            cursor: 'pointer',
            pointerEvents: 'auto',
            transform: spider.squashed 
              ? 'rotate(180deg) scale(1.5)' 
              : `rotate(${getRotation(spider)}deg)`,
            transition: spider.squashed ? 'all 0.2s' : 'none',
            opacity: spider.squashed ? 0.3 : 0.9,
            filter: spider.squashed 
              ? 'blur(2px) grayscale(100%)' 
              : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            animation: spider.squashed ? 'none' : 'spiderWiggle 0.3s ease-in-out infinite',
            willChange: 'transform'
          }}
        >
          🕷️
        </div>
      ))}
      <style jsx>{`
        @keyframes spiderWiggle {
          0%, 100% { transform: rotate(${0}deg) scale(1); }
          25% { transform: rotate(${-5}deg) scale(1.05); }
          75% { transform: rotate(${5}deg) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
