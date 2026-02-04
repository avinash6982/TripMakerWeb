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
  yerevan: {
    airport: { name: "Zvartnots International (EVN)", type: "airport", distance: "~12 km from center" },
    train: { name: "Yerevan Railway Station", type: "train", distance: "~5 km from center" },
    bus: { name: "Kilikia Central Bus Station", type: "bus", distance: "~4 km from center" },
  },
  armenia: {
    airport: { name: "Zvartnots International (EVN)", type: "airport", distance: "~12 km from Yerevan" },
    train: { name: "Yerevan Railway Station", type: "train", distance: "~5 km from center" },
    bus: { name: "Kilikia Central Bus Station", type: "bus", distance: "~4 km from center" },
  },
  ladakh: {
    airport: { name: "Kushok Bakula Rimpochee (LEH)", type: "airport", distance: "~4 km from Leh" },
    train: { name: "Jammu Tawi (nearest major)", type: "train", distance: "~700 km; connect by road" },
    bus: { name: "Leh Bus Stand", type: "bus", distance: "Leh town" },
  },
  spiti: {
    airport: { name: "Bhuntar (Kullu) nearest", type: "airport", distance: "~250 km from Kaza" },
    train: { name: "Joginder Nagar (narrow gauge)", type: "train", distance: "~200 km from Kaza" },
    bus: { name: "Kaza Bus Stand", type: "bus", distance: "Kaza town" },
  },
  manali: {
    airport: { name: "Bhuntar (Kullu-Manali)", type: "airport", distance: "~50 km from Manali" },
    train: { name: "Joginder Nagar Railway", type: "train", distance: "~165 km from Manali" },
    bus: { name: "Manali Bus Stand", type: "bus", distance: "Manali town" },
  },
  "ladakh spiti manali": {
    airport: { name: "Leh (LEH) / Bhuntar (Kullu)", type: "airport", distance: "Leh ~4 km; Manali ~50 km" },
    train: { name: "Jammu Tawi / Joginder Nagar", type: "train", distance: "Connect by road" },
    bus: { name: "Leh / Manali / Kaza bus stands", type: "bus", distance: "Circuit by road" },
  },
  "abu dhabi": {
    airport: { name: "Abu Dhabi International (AUH)", type: "airport", distance: "~30 km from center" },
    train: { name: "Abu Dhabi Central Station (Etihad Rail)", type: "train", distance: "City center" },
    bus: { name: "Abu Dhabi Central Bus Station", type: "bus", distance: "~2 km from center" },
  },
  uae: {
    airport: { name: "Abu Dhabi International (AUH)", type: "airport", distance: "~30 km from Abu Dhabi" },
    train: { name: "Abu Dhabi Central Station (Etihad Rail)", type: "train", distance: "City center" },
    bus: { name: "Abu Dhabi Central Bus Station", type: "bus", distance: "~2 km from center" },
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
