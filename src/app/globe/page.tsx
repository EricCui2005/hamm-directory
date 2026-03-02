'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { Alumni } from '@/lib/types';

// Dynamically import Globe with no SSR (Three.js needs browser)
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

interface GlobePoint {
  lat: number;
  lng: number;
  name: string;
  location: string;
  color: string;
}

const POINT_COLORS = [
  '#f59e0b', // amber
  '#ef4444', // red
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export default function GlobePage() {
  const [points, setPoints] = useState<GlobePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<GlobePoint | null>(null);

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
      const globePoints: GlobePoint[] = data.map((a: Alumni, index: number) => ({
        lat: a.latitude!,
        lng: a.longitude!,
        name: a.name,
        location: a.location || 'Unknown',
        color: POINT_COLORS[index % POINT_COLORS.length],
      }));
      setPoints(globePoints);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-900 relative">
      <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center">
        <h1 className="font-handwritten text-4xl font-bold text-amber-400">
          Hamm Around the World
        </h1>
        <div className="flex gap-4">
          <Link
            href="/"
            className="text-amber-400 hover:text-amber-300 underline"
          >
            Directory
          </Link>
          <Link
            href="/wall"
            className="text-amber-400 hover:text-amber-300 underline"
          >
            Wall
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-screen text-gray-400">
          Loading globe...
        </div>
      ) : points.length === 0 ? (
        <div className="flex items-center justify-center h-screen text-gray-400">
          <div className="text-center">
            <p className="mb-2">No alumni with locations yet.</p>
            <p className="text-sm">Add locations from the directory to see them on the globe!</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-screen">
          <Globe
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            pointsData={points}
            pointLat="lat"
            pointLng="lng"
            pointColor="color"
            pointAltitude={0.05}
            pointRadius={0.5}
            pointLabel={(d: unknown) => {
              const point = d as GlobePoint;
              return `<div class="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg">
                <div class="font-bold">${point.name}</div>
                <div class="text-sm text-gray-300">${point.location}</div>
              </div>`;
            }}
            onPointClick={(point: unknown) => setSelectedPoint(point as GlobePoint)}
            enablePointerInteraction={true}
          />
        </div>
      )}

      {selectedPoint && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl p-4 z-20">
          <button
            onClick={() => setSelectedPoint(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
          <h3 className="font-semibold text-lg">{selectedPoint.name}</h3>
          <p className="text-gray-600">{selectedPoint.location}</p>
        </div>
      )}

      <div className="absolute bottom-4 right-4 text-gray-500 text-sm z-10">
        {points.length} alumni on the map
      </div>
    </main>
  );
}
