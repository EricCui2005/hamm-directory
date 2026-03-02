'use client';

import { useState } from 'react';
import { Alumni, AlumniInsert } from '@/lib/types';
import { geocodeLocation } from '@/lib/geocode';

interface AlumniFormProps {
  alumni?: Alumni;
  onSubmit: (data: AlumniInsert) => Promise<void>;
  onCancel: () => void;
}

export default function AlumniForm({ alumni, onSubmit, onCancel }: AlumniFormProps) {
  const [formData, setFormData] = useState({
    name: alumni?.name ?? '',
    email: alumni?.email ?? '',
    linkedin_url: alumni?.linkedin_url ?? '',
    year_start: alumni?.year_start ?? new Date().getFullYear(),
    year_end: alumni?.year_end ?? new Date().getFullYear(),
    location: alumni?.location ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let latitude: number | null = alumni?.latitude ?? null;
      let longitude: number | null = alumni?.longitude ?? null;

      // Geocode if location changed or is new
      if (formData.location && formData.location !== alumni?.location) {
        setGeocodeStatus('loading');
        const coords = await geocodeLocation(formData.location);
        if (coords) {
          latitude = coords.latitude;
          longitude = coords.longitude;
          setGeocodeStatus('success');
        } else {
          setGeocodeStatus('error');
        }
      }

      await onSubmit({
        name: formData.name,
        email: formData.email,
        linkedin_url: formData.linkedin_url || null,
        year_start: formData.year_start,
        year_end: formData.year_end,
        location: formData.location || null,
        latitude,
        longitude,
      });
    } finally {
      setLoading(false);
      setGeocodeStatus('idle');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email *
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label htmlFor="linkedin" className="block text-sm font-medium mb-1">
          LinkedIn URL
        </label>
        <input
          type="url"
          id="linkedin"
          value={formData.linkedin_url ?? ''}
          onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
          placeholder="https://linkedin.com/in/username"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium mb-1">
          Current Location
        </label>
        <input
          type="text"
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="San Francisco, CA"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter a city or address to show on the globe
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="year_start" className="block text-sm font-medium mb-1">
            Start Year *
          </label>
          <input
            type="number"
            id="year_start"
            required
            min="1950"
            max="2100"
            value={formData.year_start}
            onChange={(e) => setFormData({ ...formData, year_start: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div>
          <label htmlFor="year_end" className="block text-sm font-medium mb-1">
            End Year *
          </label>
          <input
            type="number"
            id="year_end"
            required
            min="1950"
            max="2100"
            value={formData.year_end}
            onChange={(e) => setFormData({ ...formData, year_end: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 disabled:opacity-50 transition-colors"
        >
          {loading
            ? geocodeStatus === 'loading'
              ? 'Finding location...'
              : 'Saving...'
            : alumni
            ? 'Update'
            : 'Add Alumni'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
