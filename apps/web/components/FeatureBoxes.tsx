'use client';

import { useState, useEffect } from 'react';

const features = [
  { title: 'Death to Bugs', description: 'AI reaps complex bugs instantly' },
  { title: 'Undead Review', description: 'Resurrect code quality' },
  { title: 'Tomb Tests', description: 'Summon comprehensive tests' },
  { title: 'Ghostly Wisdom', description: 'Decode cursed code' }
];

const images = [
  '/images/boxes/pexels-andres-cadena-251119993-14425618.jpg',
  '/images/boxes/pexels-desertedinurban-4462784.jpg',
  '/images/boxes/pexels-gerardo-manzano-251119164-14148284.jpg',
  '/images/boxes/pexels-pedro-figueras-202443-626164.jpg'
];

export default function FeatureBoxes() {

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {features.map((feature, index) => (
        <div
          key={index}
          style={{
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(200, 200, 200, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            minHeight: '120px'
          }}
          className="rounded-lg p-6 text-center"
        >
          {/* Background layer */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${images[index]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.7,
              zIndex: 0
            }}
          />
          {/* Dark overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1
            }}
          />
          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 className="font-bold mb-1" style={{ color: '#d4d4d4', fontFamily: 'Georgia, serif' }}>
              {feature.title}
            </h3>
            <p className="text-sm" style={{ color: '#a0a0a0' }}>
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
