'use client';

import { useEffect, useState } from 'react';

export function GoldenParticles({ count = 30 }: { count?: number }) {
  const [particles, setParticles] = useState<
    { id: number; left: number; size: number; duration: number; delay: number; driftX: number }[]
  >([]);

  useEffect(() => {
    const arr = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
      driftX: (Math.random() - 0.5) * 80,
    }));
    setParticles(arr);
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 1 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: 'radial-gradient(circle, rgba(200,164,106,0.8) 0%, rgba(200,164,106,0) 70%)',
            animation: `particle-drift ${p.duration}s linear ${p.delay}s infinite`,
            ['--drift-x' as string]: `${p.driftX}px`,
          }}
        />
      ))}
    </div>
  );
}
