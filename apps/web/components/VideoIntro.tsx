'use client';

import { useEffect, useState, useRef } from 'react';

export default function VideoIntro({ onComplete }: { onComplete: () => void }) {
  const [showText, setShowText] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Show "Welcome to BugReaper" text after 1 second
    const textTimer = setTimeout(() => setShowText(true), 1000);
    
    // Start fade out after 8 seconds
    const fadeTimer = setTimeout(() => setFadeOut(true), 8000);
    
    // Complete after 9 seconds
    const completeTimer = setTimeout(() => onComplete(), 9000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 1s ease-out',
      }}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          minWidth: '100%',
          minHeight: '100%',
          width: 'auto',
          height: 'auto',
          transform: 'translate(-50%, -50%)',
          objectFit: 'cover',
          opacity: 0.7
        }}
      >
        <source src="/videos/intro.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.8))',
        zIndex: 1
      }} />

      {/* Welcome Text */}
      {showText && (
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            animation: 'fadeInText 2s ease-in',
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#A52A2A',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(139,0,0,0.5)',
              fontFamily: '"Nosifer", cursive',
              margin: 0,
              letterSpacing: '6px',
              marginBottom: '20px'
            }}
          >
            WELCOME TO
          </h1>
          <h1
            style={{
              fontSize: '96px',
              fontWeight: 'bold',
              color: '#A52A2A',
              textShadow: '3px 3px 6px rgba(0,0,0,0.9), 0 0 25px rgba(139,0,0,0.6)',
              fontFamily: '"Nosifer", cursive',
              margin: 0,
              letterSpacing: '8px',
            }}
          >
            BUGREAPER
          </h1>
          <p
            style={{
              fontSize: '28px',
              color: '#E8DCC4',
              textShadow: '0 0 20px #E8DCC4, 0 0 40px #E8DCC4',
              marginTop: '30px',
              fontFamily: 'monospace',
              letterSpacing: '3px'
            }}
          >
            The harvest begins...
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInText {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
