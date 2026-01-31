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
