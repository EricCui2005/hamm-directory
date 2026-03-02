interface GeocodingResult {
  latitude: number;
  longitude: number;
}

export async function geocodeLocation(location: string): Promise<GeocodingResult | null> {
  if (!location.trim()) return null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
      {
        headers: {
          'User-Agent': 'HammarskjoldAlumniDirectory/1.0',
        },
      }
    );

    if (!response.ok) {
      console.error('Geocoding request failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.length === 0) {
      console.warn('No geocoding results found for:', location);
      return null;
    }

    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
