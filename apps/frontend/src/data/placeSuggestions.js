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
};

/** Aliases that map to "new york" list */
const NYC_ALIASES = ["new york city", "nyc"];

/**
 * Returns an array of place name strings for the given destination.
 * Used to populate the activity-edit input datalist.
 */
export function getPlaceSuggestionsForDestination(destination) {
  const key = normalize(destination);
  if (NYC_ALIASES.includes(key)) return PLACES_BY_DESTINATION["new york"] || [];
  if (PLACES_BY_DESTINATION[key]?.length) return PLACES_BY_DESTINATION[key];
  for (const [k, list] of Object.entries(PLACES_BY_DESTINATION)) {
    if (Array.isArray(list) && list.length && (key.includes(k) || k.includes(key)))
      return list;
  }
  return [];
}
