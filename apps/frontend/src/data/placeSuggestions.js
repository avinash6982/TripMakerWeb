/**
 * Place name suggestions per destination for activity editing (MVP1, zero-cost).
 * Used by datalist on Home page "Edit day" inputs.
 */
const normalize = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const PLACES_BY_DESTINATION = {
  paris: [
    "Eiffel Tower",
    "Louvre Museum",
    "Notre-Dame Cathedral",
    "Arc de Triomphe",
    "Sacré-Cœur",
    "Champs-Élysées",
    "Musée d'Orsay",
    "Palace of Versailles",
    "Canal Saint-Martin",
    "Montmartre",
    "Latin Quarter",
    "Le Marais",
    "Luxembourg Gardens",
    "Sainte-Chapelle",
    "Pont Alexandre III",
  ],
  tokyo: [
    "Senso-ji Temple",
    "Shibuya Crossing",
    "Tokyo Tower",
    "Meiji Shrine",
    "Imperial Palace",
    "Akihabara",
    "Shinjuku",
    "Harajuku",
    "Tsukiji Outer Market",
    "TeamLab Borderless",
    "Ueno Park",
    "Roppongi Hills",
    "Ginza",
    "Odaiba",
    "Nakamise-dori",
  ],
  "new york": [
    "Statue of Liberty",
    "Central Park",
    "Times Square",
    "Empire State Building",
    "Brooklyn Bridge",
    "Metropolitan Museum of Art",
    "High Line",
    "9/11 Memorial",
    "Grand Central Terminal",
    "Rockefeller Center",
    "Brooklyn Bridge Park",
    "One World Observatory",
    "Broadway",
    "SoHo",
    "Chelsea Market",
  ],
  yerevan: [
    "Cascade Complex",
    "Republic Square",
    "Matenadaran",
    "Vernissage Market",
    "Tsitsernakaberd",
    "Cafesjian Center",
    "Garni Temple",
    "Geghard Monastery",
    "Echmiadzin Cathedral",
    "Lake Sevan",
    "Armenian Brandy Factory",
    "Northern Avenue",
    "Blue Mosque",
    "Dilijan",
    "History Museum of Armenia",
  ],
  armenia: [
    "Cascade Complex",
    "Republic Square",
    "Matenadaran",
    "Vernissage Market",
    "Garni Temple",
    "Geghard Monastery",
    "Echmiadzin Cathedral",
    "Lake Sevan",
    "Dilijan",
    "Yerevan Opera",
  ],
  ladakh: [
    "Leh Palace",
    "Shanti Stupa",
    "Thiksey Monastery",
    "Hemis Monastery",
    "Pangong Lake",
    "Nubra Valley",
    "Leh Market",
    "Magnetic Hill",
    "Key Monastery",
    "Tabo Monastery",
    "Dhankar",
    "Chandratal",
  ],
  spiti: [
    "Key Monastery",
    "Tabo Monastery",
    "Dhankar Monastery",
    "Chandratal Lake",
    "Kaza",
    "Kibber",
    "Langza",
  ],
  manali: [
    "Hadimba Temple",
    "Old Manali",
    "Solang Valley",
    "Rohtang Pass",
    "Vashisht Hot Springs",
    "Mall Road",
    "Van Vihar",
  ],
  "ladakh spiti manali": [
    "Leh Palace",
    "Pangong Lake",
    "Nubra Valley",
    "Key Monastery",
    "Chandratal",
    "Manali",
    "Rohtang Pass",
    "Solang Valley",
  ],
  "abu dhabi": [
    "Sheikh Zayed Grand Mosque",
    "Louvre Abu Dhabi",
    "Ferrari World",
    "Yas Island",
    "Corniche Beach",
    "Emirates Palace",
    "Qasr Al Hosn",
    "Heritage Village",
    "Saadiyat Island",
    "Marina Mall",
    "Yas Marina Circuit",
    "Warner Bros. World",
    "Abu Dhabi Mall",
    "Mangrove National Park",
    "Observation Deck at 300",
    "Al Jahili Fort",
    "Al Ain Oasis",
    "Abu Dhabi Falcon Hospital",
  ],
};

/** Aliases that map to "new york" list */
const NYC_ALIASES = ["new york city", "nyc"];

/**
 * Generic place suggestions for destinations not in our curated list (MVP2).
 * Works for "any place" - users can edit to match their city.
 */
const GENERIC_PLACES = [
  "City Center",
  "Old Town",
  "Main Square",
  "Central Park",
  "City Museum",
  "Cathedral",
  "Historic District",
  "Market Square",
  "Waterfront",
  "Observation Deck",
  "Botanical Gardens",
  "Art Gallery",
  "Local Market",
  "Town Hall",
  "Famous Bridge",
  "Beach",
  "Harbor",
  "Palace",
  "Temple",
  "Monument",
  "Shopping Street",
  "Food Market",
  "Sunset Viewpoint",
  "Rooftop Bar",
  "Cultural Center",
];

/**
 * Returns an array of place name strings for the given destination.
 * Used to populate the activity-edit input datalist.
 * MVP2: Returns generic suggestions when destination not in curated list.
 */
export function getPlaceSuggestionsForDestination(destination) {
  const key = normalize(destination);
  if (NYC_ALIASES.includes(key)) return PLACES_BY_DESTINATION["new york"] || [];
  if (PLACES_BY_DESTINATION[key]?.length) return PLACES_BY_DESTINATION[key];
  for (const [k, list] of Object.entries(PLACES_BY_DESTINATION)) {
    if (Array.isArray(list) && list.length && (key.includes(k) || k.includes(key)))
      return list;
  }
  return GENERIC_PLACES;
}
