'use client';

import { useEffect, useState } from 'react';

export default function CreepyEyes() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    // Random blinking
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3000 + Math.random() * 4000);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(blinkInterval);
    };
  }, []);

  const calculatePupilPosition = (eyeX: number, eyeY: number) => {
    const deltaX = mousePos.x - eyeX;
    const deltaY = mousePos.y - eyeY;
    const angle = Math.atan2(deltaY, deltaX);
    const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 50, 8);
    
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    };
  };

  // Calculate eye positions in top-right corner
  const eyeBaseX = typeof window !== 'undefined' ? window.innerWidth - 150 : 1200;
  const eyeBaseY = 40;
  
  const leftEyePos = calculatePupilPosition(eyeBaseX, eyeBaseY);
  const rightEyePos = calculatePupilPosition(eyeBaseX + 80, eyeBaseY);

  return (
    <div style={{
      position: 'fixed',
      top: '40px',
      right: '120px',
      zIndex: 9998,
      pointerEvents: 'none',
      opacity: isBlinking ? 0 : 1,
      transition: 'opacity 0.1s'
    }}>
      {/* Left Eye */}
      <div style={{
        position: 'absolute',
        left: '0',
        top: '0',
        width: '40px',
        height: '40px',
        background: 'radial-gradient(circle, #A52A2A 0%, #000 70%)',
        borderRadius: '50%',
        boxShadow: '0 0 30px #A52A2A, inset 0 0 20px #000'
      }}>
        <div style={{
          position: 'absolute',
          left: `${20 + leftEyePos.x}px`,
          top: `${20 + leftEyePos.y}px`,
          width: '12px',
          height: '12px',
          background: '#A52A2A',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 15px #A52A2A'
        }} />
      </div>

      {/* Right Eye */}
      <div style={{
        position: 'absolute',
        left: '80px',
        top: '0',
        width: '40px',
        height: '40px',
        background: 'radial-gradient(circle, #A52A2A 0%, #000 70%)',
        borderRadius: '50%',
        boxShadow: '0 0 30px #A52A2A, inset 0 0 20px #000'
      }}>
        <div style={{
          position: 'absolute',
          left: `${20 + rightEyePos.x}px`,
          top: `${20 + rightEyePos.y}px`,
          width: '12px',
          height: '12px',
          background: '#A52A2A',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 15px #A52A2A'
        }} />
      </div>
    </div>
  );
}
