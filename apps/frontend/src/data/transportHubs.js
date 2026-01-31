/**
 * Mock transport hubs for MVP1 (zero-cost).
 * Key: normalized destination string (lowercase, trimmed).
 */
const normalize = (s) => String(s || "").toLowerCase().trim().replace(/\s+/g, " ");

const HUBS = {
  paris: {
    airport: { name: "Paris Charles de Gaulle (CDG)", type: "airport", distance: "~26 km from center" },
    train: { name: "Gare du Nord", type: "train", distance: "Central" },
    bus: { name: "Gare de Bercy", type: "bus", distance: "~3 km from center" },
  },
  tokyo: {
    airport: { name: "Narita International (NRT)", type: "airport", distance: "~60 km from center" },
    train: { name: "Tokyo Station", type: "train", distance: "Central" },
    bus: { name: "Shinjuku Bus Terminal", type: "bus", distance: "~5 km from center" },
  },
  "new york": {
    airport: { name: "JFK International", type: "airport", distance: "~24 km from Manhattan" },
    train: { name: "Penn Station", type: "train", distance: "Manhattan" },
    bus: { name: "Port Authority Bus Terminal", type: "bus", distance: "Manhattan" },
  },
  "new york city": {
    airport: { name: "JFK International", type: "airport", distance: "~24 km from Manhattan" },
    train: { name: "Penn Station", type: "train", distance: "Manhattan" },
    bus: { name: "Port Authority Bus Terminal", type: "bus", distance: "Manhattan" },
  },
  nyc: {
    airport: { name: "JFK International", type: "airport", distance: "~24 km from Manhattan" },
    train: { name: "Penn Station", type: "train", distance: "Manhattan" },
    bus: { name: "Port Authority Bus Terminal", type: "bus", distance: "Manhattan" },
  },
};

export function getTransportHubsForDestination(destination) {
  const key = normalize(destination);
  if (HUBS[key]) return HUBS[key];
  for (const [k, v] of Object.entries(HUBS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}
