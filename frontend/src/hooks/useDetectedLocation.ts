import { useState, useEffect } from 'react';

export interface DetectedLocation {
  location: string;
  loading: boolean;
  error: boolean;
}

/**
 * Detects user's location via browser Geolocation API and reverse geocodes
 * to a searchable string (e.g. "San Francisco, CA") for job search.
 * No API key required (uses OpenStreetMap Nominatim).
 */
export function useDetectedLocation(): DetectedLocation {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      setError(true);
      return;
    }

    const controller = new AbortController();

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            {
              headers: {
                Accept: 'application/json',
                'User-Agent': 'JobSearchAgent/1.0 (Educational)',
              },
              signal: controller.signal,
            }
          );
          if (!res.ok) throw new Error('Geocode failed');
          const data = await res.json();
          const addr = data?.address;
          if (!addr) {
            setError(true);
            setLoading(false);
            return;
          }
          const city = addr.city || addr.town || addr.village || addr.municipality || '';
          const state = addr.state || '';
          const country = addr.country || '';
          const parts = [city, state].filter(Boolean);
          const locationStr = parts.length ? parts.join(', ') : (country || '');
          setLocation(locationStr);
        } catch {
          setError(true);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError(true);
        setLoading(false);
      },
      { timeout: 8000, maximumAge: 300000, enableHighAccuracy: false }
    );

    return () => controller.abort();
  }, []);

  return { location, loading, error };
}
