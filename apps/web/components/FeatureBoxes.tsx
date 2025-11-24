'use client';

import { useState, useEffect } from 'react';

const features = [
  { title: 'Death to Bugs', description: 'AI reaps complex bugs instantly' },
  { title: 'Undead Review', description: 'Resurrect code quality' },
  { title: 'Tomb Tests', description: 'Summon comprehensive tests' },
  { title: 'Ghostly Wisdom', description: 'Decode cursed code' }
];

const images = [
  '/images/boxes/pexels-ivan-siarbolin-1513699-3695795.jpg',
  '/images/boxes/pexels-juan-c-palacios-1823512-3585607.jpg',
  '/images/boxes/pexels-pedro-figueras-202443-626164.jpg',
  '/images/boxes/pexels-smetovisuals-6036202.jpg'
];

export default function FeatureBoxes() {
  const [activeBox, setActiveBox] = useState<number | null>(null);

  useEffect(() => {
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      setActiveBox(currentIndex);
      currentIndex = (currentIndex + 1) % features.length;
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {features.map((feature, index) => (
        <div
          key={index}
          style={{
            background: activeBox === index 
              ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${images[index]})`
              : 'rgba(50, 50, 50, 0.6)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '1px solid rgba(200, 200, 200, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.5s ease-in-out'
          }}
          className="rounded-lg p-6 text-center"
        >
          <h3 className="font-bold mb-1" style={{ color: '#d4d4d4', fontFamily: 'Georgia, serif' }}>
            {feature.title}
          </h3>
          <p className="text-sm" style={{ color: '#a0a0a0' }}>
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}
