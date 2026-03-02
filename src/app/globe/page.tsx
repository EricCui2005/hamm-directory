'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Alumni } from '@/lib/types';
import dynamic from 'next/dynamic';

// Dynamically import map component (Leaflet needs browser/window)
const AlumniMap = dynamic(() => import('@/components/AlumniMap'), { ssr: false });

interface MapPoint {
  lat: number;
  lng: number;
  color: string;
  alumni: Alumni;
}

const POINT_COLORS = [
  '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899',
];

export default function MapPage() {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);

  useEffect(() => {
    fetchAlumniWithLocations();
  }, []);

  const fetchAlumniWithLocations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('alumni')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) {
      console.error('Error fetching alumni:', error);
    } else if (data) {
      const mapPoints: MapPoint[] = data.map((a: Alumni, index: number) => ({
        lat: a.latitude!,
        lng: a.longitude!,
        color: POINT_COLORS[index % POINT_COLORS.length],
        alumni: a,
      }));
      setPoints(mapPoints);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#f5f0e8] relative">
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4 flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-sm">
        <h1 className="font-handwritten text-3xl font-bold text-amber-800">
          Hamm Around the World
        </h1>
        <div className="flex gap-4">
          <Link href="/" className="text-amber-600 hover:text-amber-800 underline transition-colors">
            Directory
          </Link>
          <Link href="/wall" className="text-amber-600 hover:text-amber-800 underline transition-colors">
            Wall
          </Link>
          <Link href="/yearbook" className="text-amber-600 hover:text-amber-800 underline transition-colors">
            Yearbook
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-screen text-gray-500">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading map...</p>
          </div>
        </div>
      ) : points.length === 0 ? (
        <div className="flex items-center justify-center h-screen text-gray-500">
          <div className="text-center">
            <p className="mb-2">No alumni with locations yet.</p>
            <p className="text-sm">Add locations from the directory to see them on the map!</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-screen pt-14">
          <AlumniMap points={points} onPointClick={setSelectedPoint} />
        </div>
      )}

      {/* Alumni Card Popup */}
      {selectedPoint && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] animate-fade-in">
          <div
            className="relative p-5 rounded-sm shadow-2xl paper-texture w-72"
            style={{
              background: 'linear-gradient(135deg, #a8c8dc 0%, #93b8d0 100%)',
            }}
          >
            {/* Tape decoration */}
            <div
              className="absolute -top-3 left-1/2 w-16 h-6 rounded-sm shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #d4a574 0%, #c9956c 50%, #d4a574 100%)',
                transform: 'translateX(-50%) rotate(-2deg)',
              }}
            />

            {/* Close button */}
            <button
              onClick={() => setSelectedPoint(null)}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800 bg-white/50 rounded-full transition-colors"
            >
              ×
            </button>

            {/* Card content */}
            <div className="mt-2 space-y-2">
              <h3 className="font-handwritten text-2xl text-gray-800 font-bold">
                {selectedPoint.alumni.name}
              </h3>

              <p className="font-handwritten text-lg text-gray-700">
                {selectedPoint.alumni.year_start === selectedPoint.alumni.year_end
                  ? selectedPoint.alumni.year_start
                  : `${selectedPoint.alumni.year_start} - ${selectedPoint.alumni.year_end}`}
              </p>

              <div className="text-sm text-gray-600 space-y-1">
                <p className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{selectedPoint.alumni.location}</span>
                </p>

                <p className="flex items-center gap-2">
                  <span>✉️</span>
                  <a
                    href={`mailto:${selectedPoint.alumni.email}`}
                    className="hover:underline truncate"
                  >
                    {selectedPoint.alumni.email}
                  </a>
                </p>

                {selectedPoint.alumni.linkedin_url && (
                  <p className="flex items-center gap-2">
                    <span>💼</span>
                    <a
                      href={selectedPoint.alumni.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Paper holes decoration */}
            <div className="absolute right-3 top-10 flex flex-col gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-white/60" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alumni count badge */}
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm text-amber-700 text-sm px-3 py-1.5 rounded-full z-[1000] shadow-sm">
        {points.length} alumni worldwide
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}
