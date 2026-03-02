'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { Alumni } from '@/lib/types';
import 'leaflet/dist/leaflet.css';

interface MapPoint {
  lat: number;
  lng: number;
  color: string;
  alumni: Alumni;
}

interface AlumniMapProps {
  points: MapPoint[];
  onPointClick: (point: MapPoint) => void;
}

// Component to fit map bounds to all points
function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;

    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 5);
    } else {
      const lats = points.map((p) => p.lat);
      const lngs = points.map((p) => p.lng);
      map.fitBounds(
        [
          [Math.min(...lats) - 5, Math.min(...lngs) - 5],
          [Math.max(...lats) + 5, Math.max(...lngs) + 5],
        ],
        { padding: [50, 50] }
      );
    }
  }, [map, points]);

  return null;
}

export default function AlumniMap({ points, onPointClick }: AlumniMapProps) {
  return (
    <MapContainer
      center={[30, 0]}
      zoom={2}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />
      {points.map((point) => (
        <CircleMarker
          key={point.alumni.id}
          center={[point.lat, point.lng]}
          radius={8}
          pathOptions={{
            fillColor: point.color,
            fillOpacity: 0.9,
            color: 'white',
            weight: 2,
          }}
          eventHandlers={{
            click: () => onPointClick(point),
          }}
        >
          <Tooltip direction="top" offset={[0, -10]}>
            <div className="text-sm">
              <div className="font-semibold">{point.alumni.name}</div>
              <div className="text-gray-500">{point.alumni.location}</div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
