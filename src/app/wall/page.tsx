'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Alumni } from '@/lib/types';
import AlumniCard from '@/components/AlumniCard';

const CARDS_TO_SHOW = 12;
const colorSchemes: Array<'blue' | 'pink' | 'cream' | 'mint'> = ['blue', 'pink', 'cream', 'mint'];

interface CardPosition {
  alumni: Alumni;
  x: number;
  y: number;
  rotation: number;
  colorScheme: 'blue' | 'pink' | 'cream' | 'mint';
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generatePositions(alumni: Alumni[]): CardPosition[] {
  const positions: CardPosition[] = [];
  const cols = 4;
  const rows = Math.ceil(alumni.length / cols);

  alumni.forEach((a, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    // Base position in a grid
    const baseX = (col / cols) * 100;
    const baseY = (row / rows) * 100;

    // Add some randomness
    const randomOffsetX = (Math.random() - 0.5) * 10;
    const randomOffsetY = (Math.random() - 0.5) * 10;

    positions.push({
      alumni: a,
      x: Math.max(5, Math.min(75, baseX + randomOffsetX)),
      y: Math.max(5, Math.min(85, baseY + randomOffsetY)),
      rotation: (Math.random() - 0.5) * 24, // -12 to 12 degrees
      colorScheme: colorSchemes[index % colorSchemes.length],
    });
  });

  return positions;
}

export default function WallPage() {
  const [cardPositions, setCardPositions] = useState<CardPosition[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAndPositionAlumni = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('alumni')
      .select('*');

    if (error) {
      console.error('Error fetching alumni:', error);
      setLoading(false);
      return;
    }

    if (data) {
      // Shuffle and take random subset
      const shuffled = shuffleArray(data);
      const subset = shuffled.slice(0, CARDS_TO_SHOW);
      const positions = generatePositions(subset);
      setCardPositions(positions);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAndPositionAlumni();
  }, []);

  return (
    <main className="min-h-screen p-8 relative overflow-hidden">
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h1 className="font-handwritten text-4xl font-bold text-amber-800">
          Hamm Wall
        </h1>
        <div className="flex gap-4">
          <button
            onClick={fetchAndPositionAlumni}
            className="text-amber-600 hover:text-amber-800 underline"
          >
            Shuffle
          </button>
          <Link
            href="/"
            className="text-amber-600 hover:text-amber-800 underline"
          >
            Directory
          </Link>
          <Link
            href="/globe"
            className="text-amber-600 hover:text-amber-800 underline"
          >
            Globe
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 text-gray-500">Loading...</div>
      ) : cardPositions.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          No alumni to display. Add some from the directory!
        </div>
      ) : (
        <div className="relative w-full" style={{ height: 'calc(100vh - 150px)' }}>
          {cardPositions.map((pos, index) => (
            <div
              key={pos.alumni.id}
              className="absolute transition-all duration-300"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                zIndex: index,
              }}
            >
              <AlumniCard
                alumni={pos.alumni}
                rotation={pos.rotation}
                colorScheme={pos.colorScheme}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
