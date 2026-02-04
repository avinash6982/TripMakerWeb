/**
 * Haversine distance between two points in km.
 * @param {{ lat: number, lng?: number, lon?: number }} a
 * @param {{ lat: number, lng?: number, lon?: number }} b
 * @returns {number} distance in km
 */
export function haversineKm(a, b) {
  const lat1 = Number(a?.lat);
  const lon1 = Number(a?.lng ?? a?.lon);
  const lat2 = Number(b?.lat);
  const lon2 = Number(b?.lng ?? b?.lon);
  if (!Number.isFinite(lat1) || !Number.isFinite(lon1) || !Number.isFinite(lat2) || !Number.isFinite(lon2)) {
    return Infinity;
  }
  const R = 6371; // Earth radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

/** Default assumed speed for ETA: km/h (walking ~5, mixed urban ~15). */
const DEFAULT_SPEED_KMH = 8;

/**
 * Estimate travel time in minutes from distance (km) at given speed (km/h).
 * @param {number} distanceKm
 * @param {number} [speedKmh]
 * @returns {number} minutes
 */
export function estimateMinutes(distanceKm, speedKmh = DEFAULT_SPEED_KMH) {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 0;
  return (distanceKm / speedKmh) * 60;
}

/**
 * Find closest itinerary marker to current position and return distance (km) and marker.
 * @param {{ lat: number, lng: number }} current
 * @param {Array<{ lat: number, lng: number, name?: string }>} markers
 * @returns {{ distanceKm: number, marker: { lat, lng, name }, estimatedMinutes: number } | null}
 */
export function getClosestStop(current, markers) {
  if (!current || !Array.isArray(markers) || markers.length === 0) return null;
  let best = null;
  let bestKm = Infinity;
  for (const m of markers) {
    if (!Number.isFinite(m?.lat) || !Number.isFinite(m?.lng)) continue;
    const km = haversineKm(current, m);
    if (km < bestKm) {
      bestKm = km;
      best = m;
    }
  }
  if (!best) return null;
  return {
    distanceKm: Math.round(bestKm * 10) / 10,
    marker: best,
    estimatedMinutes: Math.round(estimateMinutes(bestKm)),
  };
}
