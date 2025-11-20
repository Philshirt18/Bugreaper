'use client';

export default function FogEffect() {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '300px',
      zIndex: 9993,
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      {/* Multiple fog layers for depth */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: `radial-gradient(ellipse at bottom, rgba(139, 0, 0, ${0.3 - i * 0.1}) 0%, transparent 70%)`,
            animation: `fogMove${i} ${15 + i * 5}s ease-in-out infinite`,
            animationDelay: `${i * 2}s`
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes fogMove0 {
          0%, 100% { transform: translateX(-10%) scale(1); }
          50% { transform: translateX(10%) scale(1.1); }
        }
        @keyframes fogMove1 {
          0%, 100% { transform: translateX(10%) scale(1.05); }
          50% { transform: translateX(-10%) scale(1); }
        }
        @keyframes fogMove2 {
          0%, 100% { transform: translateX(0%) scale(1); }
          50% { transform: translateX(5%) scale(1.15); }
        }
      `}</style>
    </div>
  );
}
