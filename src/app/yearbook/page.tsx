'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Alumni } from '@/lib/types';

export default function YearbookIndex() {
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('alumni').select('year_start, year_end');

    if (error) {
      console.error('Error fetching years:', error);
      setLoading(false);
      return;
    }

    if (data) {
      const yearSet = new Set<number>();
      data.forEach((a: Pick<Alumni, 'year_start' | 'year_end'>) => {
        for (let y = a.year_start; y <= a.year_end; y++) {
          yearSet.add(y);
        }
      });
      setYears(Array.from(yearSet).sort((a, b) => b - a));
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-handwritten text-4xl font-bold text-amber-800">
          Hamm Yearbook
        </h1>
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

      <p className="text-gray-600 mb-8">Select a year to see who was in the house.</p>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : years.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No alumni yet. Add some from the directory!
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {years.map((year) => (
            <Link
              key={year}
              href={`/yearbook/${year}`}
              className="relative group"
            >
              <div className="p-6 rounded-sm shadow-md text-center transition-transform hover:scale-105 paper-texture"
                style={{
                  background: 'linear-gradient(135deg, #a8c8dc 0%, #93b8d0 100%)',
                  transform: `rotate(${(Math.random() - 0.5) * 4}deg)`,
                }}
              >
                {/* Tape */}
                <div
                  className="absolute -top-2 left-1/2 w-12 h-5 rounded-sm"
                  style={{
                    background: 'linear-gradient(135deg, #d4a574 0%, #c9956c 50%, #d4a574 100%)',
                    opacity: 0.85,
                    transform: `translateX(-50%) rotate(${(Math.random() - 0.5) * 10}deg)`,
                  }}
                />
                <span className="font-handwritten text-3xl font-bold text-gray-800">
                  {year}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
