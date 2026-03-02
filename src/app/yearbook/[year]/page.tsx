'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Alumni } from '@/lib/types';
import AlumniCard from '@/components/AlumniCard';

const colorSchemes: Array<'blue' | 'pink' | 'cream' | 'mint'> = ['blue', 'pink', 'cream', 'mint'];

interface CardPosition {
  alumni: Alumni;
  x: number;
  y: number;
  rotation: number;
  colorScheme: 'blue' | 'pink' | 'cream' | 'mint';
}

function generatePositions(alumni: Alumni[]): CardPosition[] {
  const positions: CardPosition[] = [];
  const cols = 4;
  const rows = Math.ceil(alumni.length / cols);

  alumni.forEach((a, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    const baseX = (col / cols) * 100;
    const baseY = (row / (rows || 1)) * 100;

    const randomOffsetX = (Math.random() - 0.5) * 10;
    const randomOffsetY = (Math.random() - 0.5) * 10;

    positions.push({
      alumni: a,
      x: Math.max(5, Math.min(75, baseX + randomOffsetX)),
      y: Math.max(2, Math.min(85, baseY + randomOffsetY)),
      rotation: (Math.random() - 0.5) * 24,
      colorScheme: colorSchemes[index % colorSchemes.length],
    });
  });

  return positions;
}

export default function YearbookYearPage() {
  const params = useParams();
  const year = Number(params.year);
  const [cardPositions, setCardPositions] = useState<CardPosition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlumniForYear();
  }, [year]);

  const fetchAlumniForYear = async () => {
    setLoading(true);
    // Get alumni where year_start <= year AND year_end >= year
    const { data, error } = await supabase
      .from('alumni')
      .select('*')
      .lte('year_start', year)
      .gte('year_end', year)
      .order('name');

    if (error) {
      console.error('Error fetching alumni:', error);
      setLoading(false);
      return;
    }

    if (data) {
      setCardPositions(generatePositions(data));
    }
    setLoading(false);
  };

  // Calculate height based on number of rows
  const rows = Math.ceil(cardPositions.length / 4);
  const containerHeight = Math.max(500, rows * 280);

  return (
    <main className="min-h-screen p-8 relative overflow-hidden">
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <Link
            href="/yearbook"
            className="text-amber-600 hover:text-amber-800 text-sm underline"
          >
            ← All Years
          </Link>
          <h1 className="font-handwritten text-4xl font-bold text-amber-800 mt-1">
            Hamm {year}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {cardPositions.length} resident{cardPositions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/" className="text-amber-600 hover:text-amber-800 underline">
            Directory
          </Link>
          <Link href="/wall" className="text-amber-600 hover:text-amber-800 underline">
            Wall
          </Link>
          <Link href="/globe" className="text-amber-600 hover:text-amber-800 underline">
            Map
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 text-gray-500">Loading...</div>
      ) : cardPositions.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          No one was in the house in {year}.
        </div>
      ) : (
        <div className="relative w-full" style={{ height: containerHeight }}>
          {cardPositions.map((pos, index) => (
            <div
              key={pos.alumni.id}
              className="absolute"
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
