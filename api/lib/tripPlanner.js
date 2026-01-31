/**
 * Trip planner helpers (serverless)
 * Uses static data + rules for draft itineraries.
 */

const TRIP_PACES = {
  relaxed: { maxStopsPerDay: 3, maxHours: 4.5 },
  balanced: { maxStopsPerDay: 4, maxHours: 6 },
  fast: { maxStopsPerDay: 5, maxHours: 8 },
};

const PACE_ALIASES = {
  relaxed: 'relaxed',
  slow: 'relaxed',
  easy: 'relaxed',
  balanced: 'balanced',
  medium: 'balanced',
  steady: 'balanced',
  fast: 'fast',
  'fast-paced': 'fast',
  active: 'fast',
};

const TIME_SLOTS = ['morning', 'afternoon', 'evening'];
const SLOT_COUNTS = {
  relaxed: [1, 1, 1],
  balanced: [1, 2, 1],
  fast: [2, 2, 1],
};
const SLOT_CATEGORIES = {
  morning: ['landmark', 'viewpoint', 'park'],
  afternoon: ['museum', 'neighborhood', 'market', 'experience'],
  evening: ['food', 'nightlife', 'relax'],
};

const CITY_LIBRARY = [
  {
    key: 'paris',
    name: 'Paris',
    country: 'France',
    places: [
      { name: 'Eiffel Tower', category: 'landmark', area: '7th Arrondissement', avgTime: 2 },
      { name: 'Louvre Museum', category: 'museum', area: '1st Arrondissement', avgTime: 2.5 },
      { name: 'Tuileries Garden', category: 'park', area: '1st Arrondissement', avgTime: 1 },
      { name: 'Seine River Cruise', category: 'experience', area: 'River', avgTime: 1.5 },
      { name: 'Notre-Dame Cathedral', category: 'landmark', area: 'Ile de la Cite', avgTime: 1 },
      { name: 'Sainte-Chapelle', category: 'museum', area: 'Ile de la Cite', avgTime: 1 },
      { name: 'Le Marais Food Stroll', category: 'food', area: 'Le Marais', avgTime: 1.5 },
      { name: 'Place des Vosges', category: 'park', area: 'Le Marais', avgTime: 1 },
      { name: 'Montmartre Walk', category: 'neighborhood', area: 'Montmartre', avgTime: 2 },
      { name: 'Sacre-Coeur Basilica', category: 'viewpoint', area: 'Montmartre', avgTime: 1.5 },
      { name: "Musee d'Orsay", category: 'museum', area: 'Left Bank', avgTime: 2 },
      { name: 'Luxembourg Gardens', category: 'park', area: 'Left Bank', avgTime: 1.5 },
      { name: 'Champs-Elysees Stroll', category: 'neighborhood', area: 'Champs-Elysees', avgTime: 1.5 },
      { name: 'Arc de Triomphe', category: 'landmark', area: 'Champs-Elysees', avgTime: 1 },
      { name: 'Canal Saint-Martin', category: 'relax', area: 'Canal', avgTime: 1.5 },
      { name: 'Opera Garnier', category: 'landmark', area: 'Opera', avgTime: 1 },
      { name: 'Saint-Germain Cafe', category: 'food', area: 'Left Bank', avgTime: 1 },
      { name: 'Latin Quarter Bookshops', category: 'neighborhood', area: 'Latin Quarter', avgTime: 1.5 },
    ],
  },
  {
    key: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    places: [
      { name: 'Shibuya Crossing', category: 'landmark', area: 'Shibuya', avgTime: 1 },
      { name: 'Meiji Shrine', category: 'landmark', area: 'Harajuku', avgTime: 1.5 },
      { name: 'Takeshita Street', category: 'neighborhood', area: 'Harajuku', avgTime: 1 },
      { name: 'Asakusa Senso-ji', category: 'landmark', area: 'Asakusa', avgTime: 1.5 },
      { name: 'Nakamise Market', category: 'market', area: 'Asakusa', avgTime: 1 },
      { name: 'Ueno Park', category: 'park', area: 'Ueno', avgTime: 1.5 },
      { name: 'Tokyo National Museum', category: 'museum', area: 'Ueno', avgTime: 2 },
      { name: 'Tsukiji Outer Market', category: 'market', area: 'Tsukiji', avgTime: 1.5 },
      { name: 'Ginza Stroll', category: 'neighborhood', area: 'Ginza', avgTime: 1.5 },
      { name: 'TeamLab Planets', category: 'experience', area: 'Toyosu', avgTime: 2 },
      { name: 'Odaiba Waterfront', category: 'viewpoint', area: 'Odaiba', avgTime: 1.5 },
      { name: 'Akihabara Arcade', category: 'neighborhood', area: 'Akihabara', avgTime: 1.5 },
      { name: 'Imperial Palace East Gardens', category: 'park', area: 'Chiyoda', avgTime: 1.5 },
      { name: 'Roppongi Hills View', category: 'viewpoint', area: 'Roppongi', avgTime: 1.5 },
      { name: 'Izakaya Alley Dinner', category: 'food', area: 'Shinjuku', avgTime: 1.5 },
      { name: 'Shinjuku Gyoen', category: 'park', area: 'Shinjuku', avgTime: 1.5 },
      { name: 'Golden Gai', category: 'nightlife', area: 'Shinjuku', avgTime: 1 },
      { name: 'Yanaka Ginza', category: 'neighborhood', area: 'Yanaka', avgTime: 1.5 },
    ],
  },
  {
    key: 'new-york',
    name: 'New York City',
    country: 'United States',
    places: [
      { name: 'Central Park', category: 'park', area: 'Midtown', avgTime: 2 },
      { name: 'Metropolitan Museum of Art', category: 'museum', area: 'Upper East Side', avgTime: 2 },
      { name: 'Times Square', category: 'landmark', area: 'Midtown', avgTime: 1 },
      { name: 'Broadway District', category: 'nightlife', area: 'Midtown', avgTime: 1.5 },
      { name: 'High Line', category: 'experience', area: 'Chelsea', avgTime: 1.5 },
      { name: 'Chelsea Market', category: 'market', area: 'Chelsea', avgTime: 1.5 },
      { name: 'Greenwich Village Stroll', category: 'neighborhood', area: 'Greenwich Village', avgTime: 1.5 },
      { name: 'Brooklyn Bridge Walk', category: 'experience', area: 'Downtown', avgTime: 1.5 },
      { name: 'DUMBO Waterfront', category: 'viewpoint', area: 'Brooklyn', avgTime: 1.5 },
      { name: 'Statue of Liberty Ferry', category: 'landmark', area: 'Harbor', avgTime: 2 },
      { name: '9/11 Memorial', category: 'museum', area: 'Downtown', avgTime: 1.5 },
      { name: 'SoHo Boutiques', category: 'neighborhood', area: 'SoHo', avgTime: 1.5 },
      { name: 'Museum of Modern Art', category: 'museum', area: 'Midtown', avgTime: 2 },
      { name: 'Grand Central Terminal', category: 'landmark', area: 'Midtown', avgTime: 1 },
      { name: 'Williamsburg Food Hall', category: 'food', area: 'Brooklyn', avgTime: 1.5 },
      { name: 'Prospect Park', category: 'park', area: 'Brooklyn', avgTime: 1.5 },
      { name: 'Top of the Rock', category: 'viewpoint', area: 'Midtown', avgTime: 1.5 },
      { name: 'Little Italy Dinner', category: 'food', area: 'Little Italy', avgTime: 1.5 },
    ],
  },
  {
    key: 'yerevan',
    name: 'Yerevan',
    country: 'Armenia',
    places: [
      { name: 'Cascade Complex', category: 'landmark', area: 'Kentron', avgTime: 1.5 },
      { name: 'Republic Square', category: 'landmark', area: 'Kentron', avgTime: 1 },
      { name: 'Matenadaran Museum', category: 'museum', area: 'Kentron', avgTime: 2 },
      { name: 'Vernissage Market', category: 'market', area: 'Kentron', avgTime: 1.5 },
      { name: 'Tsitsernakaberd Memorial', category: 'museum', area: 'Tsitsernakaberd', avgTime: 1.5 },
      { name: 'Cafesjian Center for the Arts', category: 'museum', area: 'Cascade', avgTime: 1.5 },
      { name: 'Opera House Area', category: 'landmark', area: 'Kentron', avgTime: 1 },
      { name: 'Northern Avenue Stroll', category: 'neighborhood', area: 'Kentron', avgTime: 1 },
      { name: 'Garni Temple', category: 'landmark', area: 'Kotayk', avgTime: 2 },
      { name: 'Geghard Monastery', category: 'landmark', area: 'Kotayk', avgTime: 1.5 },
      { name: 'Echmiadzin Cathedral', category: 'landmark', area: 'Vagharshapat', avgTime: 2 },
      { name: 'Lake Sevan Shore', category: 'viewpoint', area: 'Gegharkunik', avgTime: 2 },
      { name: 'Armenian Brandy Factory Tour', category: 'experience', area: 'Yerevan', avgTime: 1.5 },
      { name: 'Armenian Tavern Dinner', category: 'food', area: 'Kentron', avgTime: 1.5 },
      { name: 'Saryan Street Cafes', category: 'food', area: 'Kentron', avgTime: 1 },
      { name: 'History Museum of Armenia', category: 'museum', area: 'Kentron', avgTime: 1.5 },
      { name: 'Blue Mosque', category: 'landmark', area: 'Kentron', avgTime: 1 },
      { name: 'Dilijan Old Town', category: 'neighborhood', area: 'Dilijan', avgTime: 1.5 },
    ],
  },
  {
    key: 'ladakh-spiti-manali',
    name: 'Ladakh, Spiti & Manali',
    country: 'India',
    places: [
      { name: 'Leh Palace', category: 'landmark', area: 'Leh', avgTime: 1.5 },
      { name: 'Shanti Stupa', category: 'viewpoint', area: 'Leh', avgTime: 1.5 },
      { name: 'Thiksey Monastery', category: 'landmark', area: 'Leh Valley', avgTime: 1.5 },
      { name: 'Hemis Monastery', category: 'landmark', area: 'Leh Valley', avgTime: 2 },
      { name: 'Leh Market', category: 'market', area: 'Leh', avgTime: 1.5 },
      { name: 'Pangong Lake', category: 'viewpoint', area: 'Ladakh', avgTime: 3 },
      { name: 'Nubra Valley', category: 'experience', area: 'Ladakh', avgTime: 2.5 },
      { name: 'Magnetic Hill', category: 'landmark', area: 'Leh', avgTime: 1 },
      { name: 'Key Monastery', category: 'landmark', area: 'Spiti Valley', avgTime: 1.5 },
      { name: 'Tabo Monastery', category: 'landmark', area: 'Spiti Valley', avgTime: 1.5 },
      { name: 'Dhankar Monastery', category: 'viewpoint', area: 'Spiti Valley', avgTime: 2 },
      { name: 'Chandratal Lake', category: 'viewpoint', area: 'Spiti Valley', avgTime: 2 },
      { name: 'Kaza Town', category: 'neighborhood', area: 'Spiti Valley', avgTime: 1 },
      { name: 'Kibber Village', category: 'neighborhood', area: 'Spiti Valley', avgTime: 1.5 },
      { name: 'Hadimba Temple', category: 'landmark', area: 'Manali', avgTime: 1 },
      { name: 'Old Manali Walk', category: 'neighborhood', area: 'Manali', avgTime: 1.5 },
      { name: 'Solang Valley', category: 'experience', area: 'Manali', avgTime: 2 },
      { name: 'Rohtang Pass', category: 'viewpoint', area: 'Manali', avgTime: 2.5 },
      { name: 'Vashisht Hot Springs', category: 'relax', area: 'Manali', avgTime: 1.5 },
      { name: 'Mall Road Manali', category: 'market', area: 'Manali', avgTime: 1 },
    ],
  },
];

const CITY_ALIASES = {
  paris: 'paris',
  'paris france': 'paris',
  tokyo: 'tokyo',
  'tokyo japan': 'tokyo',
  'new york': 'new-york',
  'new york city': 'new-york',
  nyc: 'new-york',
  yerevan: 'yerevan',
  armenia: 'yerevan',
  'yerevan armenia': 'yerevan',
  ladakh: 'ladakh-spiti-manali',
  spiti: 'ladakh-spiti-manali',
  manali: 'ladakh-spiti-manali',
  'ladakh spiti manali': 'ladakh-spiti-manali',
  'ladakh spiti': 'ladakh-spiti-manali',
  'spiti valley': 'ladakh-spiti-manali',
  'himalayas north india': 'ladakh-spiti-manali',
};

const FALLBACK_LABELS = {
  landmark: 'signature landmark',
  museum: 'local museum',
  neighborhood: 'neighborhood walk',
  park: 'city park',
  market: 'market stop',
  experience: 'cultural experience',
  food: 'food district',
  nightlife: 'evening spot',
  relax: 'waterfront break',
  viewpoint: 'scenic viewpoint',
};

function normalizeDestination(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleCase(input) {
  return String(input || '')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function resolveCity(destination, rawInput) {
  const aliasKey = CITY_ALIASES[destination] || destination;
  const city = CITY_LIBRARY.find((entry) => entry.key === aliasKey);
  if (city) {
    return { city, isFallback: false };
  }
  return { city: buildFallbackCity(rawInput), isFallback: true };
}

function buildFallbackCity(rawInput) {
  const name = titleCase(String(rawInput || 'Your Destination').trim()) || 'Your Destination';
  const places = [
    { name: `${name} Historic Center Walk`, category: 'neighborhood', area: 'Old Town', avgTime: 1.5 },
    { name: `${name} Signature Landmark`, category: 'landmark', area: 'Central', avgTime: 1.2 },
    { name: `${name} City Museum`, category: 'museum', area: 'Museum Quarter', avgTime: 2 },
    { name: `${name} Riverfront Stroll`, category: 'relax', area: 'Riverside', avgTime: 1.5 },
    { name: `${name} Local Market`, category: 'market', area: 'Market District', avgTime: 1.5 },
    { name: `${name} Main Park`, category: 'park', area: 'Central', avgTime: 1.5 },
    { name: `${name} Cafe Lane`, category: 'food', area: 'Old Town', avgTime: 1 },
    { name: `${name} Cultural Center`, category: 'experience', area: 'Central', avgTime: 1.5 },
    { name: `${name} Sunset Viewpoint`, category: 'viewpoint', area: 'Hillside', avgTime: 1 },
    { name: `${name} Artisan Street`, category: 'neighborhood', area: 'Old Town', avgTime: 1.5 },
    { name: `${name} Food Hall`, category: 'food', area: 'Market District', avgTime: 1.5 },
    { name: `${name} Evening Market`, category: 'nightlife', area: 'Market District', avgTime: 1.5 },
    { name: `${name} Botanical Gardens`, category: 'park', area: 'Riverside', avgTime: 1.5 },
    { name: `${name} Heritage Museum`, category: 'museum', area: 'Museum Quarter', avgTime: 1.5 },
    { name: `${name} Scenic Plaza`, category: 'landmark', area: 'Central', avgTime: 1 },
  ];
  return { key: 'custom', name, country: 'Custom', places };
}

function normalizePace(pace) {
  const key = String(pace || '').toLowerCase().trim();
  return PACE_ALIASES[key] || 'balanced';
}

function clampDays(days) {
  if (!Number.isFinite(days)) {
    return 3;
  }
  return Math.min(10, Math.max(1, Math.round(days)));
}

function hashSeed(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function mulberry32(seed) {
  let t = seed;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRandom(list, random) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function extractPlaces(pool, predicate, count) {
  const selected = [];
  const remaining = [];
  for (const place of pool) {
    if (selected.length < count && predicate(place)) {
      selected.push(place);
    } else {
      remaining.push(place);
    }
  }
  return { selected, remaining };
}

function createFallbackPlace(destination, index, category, area) {
  const label = FALLBACK_LABELS[category] || 'local highlight';
  const suffix = index > 1 ? ` ${index}` : '';
  return {
    name: `${destination} ${label}${suffix}`,
    category,
    area: area || 'Central',
    avgTime: 1.5,
  };
}

function selectPlaces({ pool, count, area, categories, destination, fallbackIndex }) {
  let remaining = pool;
  const selected = [];
  const areaFilter = (place) => (area ? place.area === area : true);
  const categoryFilter = (place) =>
    !categories || categories.length === 0 ? true : categories.includes(place.category);

  const take = (predicate, targetCount) => {
    if (targetCount <= 0) {
      return;
    }
    const result = extractPlaces(remaining, predicate, targetCount);
    selected.push(...result.selected);
    remaining = result.remaining;
  };

  take((place) => areaFilter(place) && categoryFilter(place), count);
  if (selected.length < count && area) {
    take((place) => areaFilter(place), count - selected.length);
  }
  if (selected.length < count) {
    take((place) => categoryFilter(place), count - selected.length);
  }
  if (selected.length < count) {
    take(() => true, count - selected.length);
  }

  let nextFallbackIndex = fallbackIndex;
  while (selected.length < count) {
    nextFallbackIndex += 1;
    const fallbackCategory = categories?.[nextFallbackIndex % categories.length] || 'experience';
    selected.push(createFallbackPlace(destination, nextFallbackIndex, fallbackCategory, area));
  }

  return { selected, remaining, nextFallbackIndex };
}

function buildTripPlan({ destination, days, pace, seed }) {
  const cleanedDestination = String(destination || '').trim();
  const normalizedDestination = normalizeDestination(cleanedDestination);
  const paceKey = normalizePace(pace);
  const rules = TRIP_PACES[paceKey] || TRIP_PACES.balanced;
  const totalDays = clampDays(Number(days));
  const resolved = resolveCity(normalizedDestination, cleanedDestination);
  const city = resolved.city;
  const isFallback = resolved.isFallback;

  const randomSeed = hashSeed(`${normalizedDestination || cleanedDestination}-${seed || Date.now()}`);
  const random = mulberry32(randomSeed);
  const areaOrder = shuffleWithRandom(
    Array.from(new Set(city.places.map((place) => place.area).filter(Boolean))),
    random
  );
  let remainingPlaces = shuffleWithRandom(city.places, random);
  let fallbackIndex = 0;

  const itinerary = [];
  for (let dayIndex = 0; dayIndex < totalDays; dayIndex += 1) {
    const dayArea = areaOrder.length ? areaOrder[dayIndex % areaOrder.length] : '';
    const slotCounts = SLOT_COUNTS[paceKey] || SLOT_COUNTS.balanced;
    let dayTotalHours = 0;

    const slots = TIME_SLOTS.map((slotName, slotIndex) => {
      const count = slotCounts[slotIndex] || 1;
      const result = selectPlaces({
        pool: remainingPlaces,
        count,
        area: dayArea,
        categories: SLOT_CATEGORIES[slotName],
        destination: city.name,
        fallbackIndex,
      });
      remainingPlaces = result.remaining;
      fallbackIndex = result.nextFallbackIndex;
      const items = result.selected.map((place) => ({
        name: place.name,
        category: place.category,
        durationHours: place.avgTime,
      }));
      const slotHours = items.reduce((sum, item) => sum + item.durationHours, 0);
      dayTotalHours += slotHours;
      return {
        timeOfDay: slotName,
        items,
        totalHours: Number(slotHours.toFixed(1)),
      };
    });

    itinerary.push({
      day: dayIndex + 1,
      area: dayArea,
      totalHours: Number(dayTotalHours.toFixed(1)),
      slots,
    });
  }

  const totalStops = itinerary.reduce(
    (sum, day) =>
      sum + day.slots.reduce((slotSum, slot) => slotSum + slot.items.length, 0),
    0
  );
  const totalHours = itinerary.reduce((sum, day) => sum + day.totalHours, 0);

  return {
    destination: city.name,
    pace: paceKey,
    days: totalDays,
    generatedAt: new Date().toISOString(),
    isFallback,
    meta: {
      totalStops,
      avgStopsPerDay: Number((totalStops / totalDays).toFixed(1)),
      avgHoursPerDay: Number((totalHours / totalDays).toFixed(1)),
      maxHoursPerDay: rules.maxHours,
      maxStopsPerDay: rules.maxStopsPerDay,
    },
    itinerary,
  };
}

module.exports = {
  buildTripPlan,
};
