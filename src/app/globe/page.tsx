'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { Alumni } from '@/lib/types';

// Dynamically import Globe with no SSR (Three.js needs browser)
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

interface GlobePoint {
  lat: number;
  lng: number;
  color: string;
  alumni: Alumni;
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
  const [altitude, setAltitude] = useState(2.5);
  const globeEl = useRef<HTMLDivElement>(null);

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
        color: POINT_COLORS[index % POINT_COLORS.length],
        alumni: a,
      }));
      setPoints(globePoints);
    }
    setLoading(false);
  };

  // Calculate point radius based on altitude (zoom level)
  // Higher altitude = zoomed out = larger points
  // Lower altitude = zoomed in = smaller points
  const getPointRadius = useCallback((altitude: number) => {
    // altitude typically ranges from 0.1 (very close) to 4+ (far away)
    // We want radius to scale: close = small, far = larger
    const minRadius = 0.15;
    const maxRadius = 0.6;
    const minAlt = 0.3;
    const maxAlt = 4;

    const clampedAlt = Math.max(minAlt, Math.min(maxAlt, altitude));
    const ratio = (clampedAlt - minAlt) / (maxAlt - minAlt);
    return minRadius + ratio * (maxRadius - minRadius);
  }, []);

  // Handle zoom changes
  const handleZoom = useCallback((pov: { lat: number; lng: number; altitude: number }) => {
    setAltitude(pov.altitude);
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a1a] relative overflow-hidden">
      {/* Ambient glow effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
        }}
      />

      <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center">
        <h1 className="font-handwritten text-4xl font-bold text-amber-400 drop-shadow-lg">
          Hamm Around the World
        </h1>
        <div className="flex gap-4">
          <Link
            href="/"
            className="text-amber-400 hover:text-amber-300 underline transition-colors"
          >
            Directory
          </Link>
          <Link
            href="/wall"
            className="text-amber-400 hover:text-amber-300 underline transition-colors"
          >
            Wall
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-screen text-gray-400">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading globe...</p>
          </div>
        </div>
      ) : points.length === 0 ? (
        <div className="flex items-center justify-center h-screen text-gray-400">
          <div className="text-center">
            <p className="mb-2">No alumni with locations yet.</p>
            <p className="text-sm">Add locations from the directory to see them on the globe!</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-screen" ref={globeEl}>
          <Globe
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            showAtmosphere={true}
            atmosphereColor="#3b82f6"
            atmosphereAltitude={0.25}
            pointsData={points}
            pointLat="lat"
            pointLng="lng"
            pointColor="color"
            pointAltitude={0.01}
            pointRadius={getPointRadius(altitude)}
            pointLabel={(d: object) => {
              const point = d as GlobePoint;
              return `
                <div style="
                  background: rgba(31, 41, 55, 0.95);
                  color: white;
                  padding: 8px 12px;
                  border-radius: 8px;
                  font-family: system-ui, sans-serif;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                  border: 1px solid rgba(255,255,255,0.1);
                ">
                  <div style="font-weight: 600; font-size: 14px;">${point.alumni.name}</div>
                  <div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">${point.alumni.location || 'Unknown'}</div>
                </div>
              `;
            }}
            onPointClick={(point: object) => setSelectedPoint(point as GlobePoint)}
            onZoom={handleZoom}
            enablePointerInteraction={true}
          />
        </div>
      )}

      {/* Alumni Card Popup */}
      {selectedPoint && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
          <div
            className="relative p-5 rounded-sm shadow-2xl paper-texture w-72"
            style={{
              background: 'linear-gradient(135deg, #a8c8dc 0%, #93b8d0 100%)',
            }}
          >
            {/* Tape decoration */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 rounded-sm shadow-sm"
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
      <div className="absolute bottom-4 right-4 bg-gray-800/80 backdrop-blur-sm text-amber-400 text-sm px-3 py-1.5 rounded-full z-10">
        {points.length} alumni worldwide
      </div>

      {/* Animation styles */}
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
