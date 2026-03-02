'use client';

import { Alumni } from '@/lib/types';

interface AlumniCardProps {
  alumni: Alumni;
  rotation: number;
  colorScheme: 'blue' | 'pink' | 'cream' | 'mint';
}

const colorSchemes = {
  blue: 'bg-gradient-to-br from-sky-200 to-sky-300',
  pink: 'bg-gradient-to-br from-pink-200 to-pink-300',
  cream: 'bg-gradient-to-br from-amber-100 to-amber-200',
  mint: 'bg-gradient-to-br from-emerald-200 to-emerald-300',
};

const tapeColors = [
  'bg-amber-600/80',
  'bg-yellow-500/80',
  'bg-orange-400/80',
];

export default function AlumniCard({ alumni, rotation, colorScheme }: AlumniCardProps) {
  const tapeColor = tapeColors[Math.floor(Math.random() * tapeColors.length)];
  const tapeRotation = (Math.random() - 0.5) * 30;

  return (
    <div
      className={`relative p-4 pb-6 rounded-sm shadow-lg paper-texture ${colorSchemes[colorScheme]} w-56`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Tape decoration */}
      <div
        className={`absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 ${tapeColor} rounded-sm shadow-sm`}
        style={{ transform: `rotate(${tapeRotation}deg)` }}
      />

      {/* Content */}
      <div className="mt-2 space-y-2">
        <h3 className="font-handwritten text-2xl text-gray-800 font-bold">
          {alumni.name}
        </h3>

        <div className="text-xs text-gray-600 space-y-1">
          <p className="font-handwritten text-base">
            {alumni.year_start === alumni.year_end
              ? alumni.year_start
              : `${alumni.year_start} - ${alumni.year_end}`}
          </p>

          <p className="truncate" title={alumni.email}>
            {alumni.email}
          </p>

          {alumni.linkedin_url && (
            <a
              href={alumni.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline block truncate"
            >
              LinkedIn
            </a>
          )}
        </div>
      </div>

      {/* Paper holes decoration */}
      <div className="absolute right-2 top-8 flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-white/60" />
        ))}
      </div>
    </div>
  );
}
