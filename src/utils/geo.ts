/**
 * Geo calculation & reverse geocoding utilities for RoadSetu AI
 */

/**
 * Calculates distance between two GPS points in meters using Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 10) / 10;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters.toFixed(1)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lon).toFixed(6)}° ${lonDir}`;
}

/**
 * Reverse geocodes coordinates to a human-readable street address using OpenStreetMap Nominatim
 * with graceful fallback to formatted coordinates if offline or throttled.
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoadSetu-CivicInfrastructure-Verification/1.0',
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.display_name) {
        // Build concise civic address
        const addr = data.address || {};
        const road = addr.road || addr.street || addr.neighbourhood || addr.suburb || '';
        const city = addr.city || addr.town || addr.county || addr.state_district || '';
        const state = addr.state || '';
        const postcode = addr.postcode ? ` - ${addr.postcode}` : '';

        if (road && city) {
          return `${road}, ${city}${state ? `, ${state}` : ''}${postcode}`;
        }
        return data.display_name.split(',').slice(0, 4).join(',').trim();
      }
    }
  } catch {
    // Network or timeout failure; use clean coordinate fallback
  }

  return `Near coordinates ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}

/**
 * Requests device GPS coordinates via HTML5 Geolocation API
 */
export function getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser or device.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        let msg = 'Unable to retrieve your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Location permission was denied. Please allow GPS access to verify civic evidence.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Location information is unavailable from your device sensor.';
            break;
          case error.TIMEOUT:
            msg = 'Location request timed out while contacting GPS satellites.';
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
        ...options,
      }
    );
  });
}
