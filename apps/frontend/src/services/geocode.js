const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const STATIC_DESTINATIONS = [
  {
    label: "Paris, France",
    lat: 48.8566,
    lon: 2.3522,
    aliases: ["paris", "paris france", "paris, france"],
  },
  {
    label: "Tokyo, Japan",
    lat: 35.6762,
    lon: 139.6503,
    aliases: ["tokyo", "tokyo japan", "tokyo, japan"],
  },
  {
    label: "New York City, USA",
    lat: 40.7128,
    lon: -74.006,
    aliases: ["new york", "new york city", "new york, usa", "nyc"],
  },
  {
    label: "Yerevan, Armenia",
    lat: 40.1872,
    lon: 44.5152,
    aliases: ["yerevan", "armenia", "yerevan armenia", "yerevan, armenia"],
  },
  {
    label: "Leh, Ladakh, India",
    lat: 34.1526,
    lon: 77.5771,
    aliases: ["leh", "ladakh", "leh ladakh", "ladakh india"],
  },
  {
    label: "Manali, Himachal Pradesh, India",
    lat: 32.2396,
    lon: 77.1887,
    aliases: ["manali", "manali india", "manali himachal", "ladakh spiti manali", "ladakh spiti & manali"],
  },
  {
    label: "Kaza, Spiti Valley, India",
    lat: 32.2991,
    lon: 78.0182,
    aliases: ["kaza", "spiti", "spiti valley", "ladakh spiti"],
  },
];

const normalizeKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const findStaticCoordinates = (destination) => {
  const key = normalizeKey(destination);
  return STATIC_DESTINATIONS.find((entry) => entry.aliases.includes(key)) || null;
};

export const DESTINATION_SUGGESTIONS = STATIC_DESTINATIONS.map((entry) => entry.label);

export const getDestinationCoordinates = async (destination) => {
  const staticMatch = findStaticCoordinates(destination);
  if (staticMatch) {
    return {
      lat: staticMatch.lat,
      lon: staticMatch.lon,
      label: staticMatch.label,
      source: "static",
    };
  }

  const params = new URLSearchParams({
    format: "json",
    limit: "1",
    q: destination,
  });
  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Unable to load map preview.");
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }

  const first = results[0];
  const lat = Number(first.lat);
  const lon = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  return {
    lat,
    lon,
    label: first.display_name || destination,
    source: "osm",
  };
};

export const buildStaticMapUrl = ({ lat, lon }) => {
  // Using OpenStreetMap tile preview via OSM's own CDN
  // This creates a simple tile-based preview without requiring API keys
  const zoom = 13;
  const tileSize = 256;
  
  // Calculate tile coordinates from lat/lon
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const xTile = Math.floor(((lon + 180) / 360) * n);
  const yTile = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  
  // Use OSM standard tile server (for development/light usage only)
  // Note: For production, consider using your own tile server or a paid service
  return `https://tile.openstreetmap.org/${zoom}/${xTile}/${yTile}.png`;
};

export const buildOpenStreetMapLink = ({ lat, lon }) =>
  `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=12/${lat}/${lon}`;

/** In-memory cache for place geocoding (Nominatim 1 req/sec policy). */
const placeCache = new Map();

/**
 * For Nominatim, use a short region (e.g. "India") when the plan destination is a long
 * multi-place name like "Ladakh, Spiti & Manali", so queries like "Leh Palace, India" succeed.
 */
function getGeocodeRegion(destination) {
  const key = normalizeKey(destination || "");
  if (!key) return destination || "";
  if (key.includes("ladakh") || key.includes("spiti") || key.includes("manali")) return "India";
  return String(destination || "").trim();
}

/**
 * Geocode a single place in the context of a destination (e.g. "Eiffel Tower", "Paris").
 * Returns { lat, lng, name } or null. Respects Nominatim usage (use with delay between calls).
 */
export const geocodePlace = async (placeName, destination) => {
  const region = getGeocodeRegion(destination);
  const key = `${normalizeKey(placeName)}|${normalizeKey(region)}`;
  if (placeCache.has(key)) {
    return placeCache.get(key);
  }

  const query = `${String(placeName || "").trim()}, ${region}`.trim();
  if (!query || query === ",") {
    return null;
  }

  const params = new URLSearchParams({
    format: "json",
    limit: "1",
    q: query,
  });
  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    return null;
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) {
    placeCache.set(key, null);
    return null;
  }

  const first = results[0];
  const lat = Number(first.lat);
  const lon = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    placeCache.set(key, null);
    return null;
  }

  const result = {
    lat,
    lng: lon,
    name: first.display_name || placeName,
  };
  placeCache.set(key, result);
  return result;
};

/**
 * Collect place names and categories by day (day.slots[].items[]).
 * Returns [[{ name, category }, ...], ...] - one array per day, items in visit order.
 * Used for MVP2 day-wise route polylines.
 */
export const collectPlaceNamesByDay = (plan) => {
  if (!plan?.itinerary || !Array.isArray(plan.itinerary)) {
    return [];
  }
  return plan.itinerary.map((day) => {
    const items = [];
    if (!Array.isArray(day.slots)) return items;
    for (const slot of day.slots) {
      if (!Array.isArray(slot.items)) continue;
      for (const item of slot.items) {
        const name = String(item?.name || "").trim();
        if (!name) continue;
        items.push({ name, category: item?.category || "" });
      }
    }
    return items;
  });
};

/**
 * Collect unique place names and categories from a plan itinerary (day.slots[].items[]).
 * Returns array of { name, category }, max size limit, in order of appearance.
 */
export const collectPlaceNamesFromPlan = (plan, limit = 12) => {
  if (!plan?.itinerary || !Array.isArray(plan.itinerary)) {
    return [];
  }
  const seen = new Set();
  const out = [];
  for (const day of plan.itinerary) {
    if (!Array.isArray(day.slots)) continue;
    for (const slot of day.slots) {
      if (!Array.isArray(slot.items)) continue;
      for (const item of slot.items) {
        const name = String(item?.name || "").trim();
        if (!name || seen.has(name)) continue;
        seen.add(name);
        out.push({ name, category: item?.category || "" });
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
};
