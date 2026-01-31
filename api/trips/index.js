const crypto = require('crypto');
const { readUsers, writeUsers } = require('../lib/db');
const { getAuthUser } = require('../lib/auth');

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

const TRANSPORT_MODES = ['flight', 'train', 'bus'];

function ensureTrips(user) {
  if (!Array.isArray(user.trips)) {
    user.trips = [];
  }
  return user.trips;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const user = getAuthUser(req);
  if (!user?.id) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const users = await readUsers();
    const authUser = users.find((c) => c.id === user.id);
    if (!authUser) {
      return res.status(404).json({ error: 'User not found.' });
    }
    ensureTrips(authUser);

    // GET - List trips (own + collaborated)
    if (req.method === 'GET') {
      let trips = [...(authUser.trips || [])];
      for (const u of users) {
        if (u.id === authUser.id) continue;
        if (!Array.isArray(u.trips)) continue;
        for (const t of u.trips) {
          const collab = Array.isArray(t.collaborators) ? t.collaborators : [];
          if (collab.some((c) => c.userId === authUser.id)) {
            trips.push({ ...t, ownerEmail: u.email, isCollaborator: true });
          }
        }
      }
      const statusFilter = String(req.query?.status || '').trim();
      if (statusFilter && ['upcoming', 'active', 'completed', 'archived'].includes(statusFilter)) {
        trips = trips.filter((t) => t.status === statusFilter);
      }
      trips.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
      return res.status(200).json({ trips });
    }

    // POST - Create trip
    if (req.method === 'POST') {
      const { name, destination, itinerary, days, pace, transportMode } = req.body || {};
      const nameStr = String(name || '').trim();
      const destinationStr = String(destination || '').trim();
      const itineraryArr = Array.isArray(itinerary) ? itinerary : [];

      if (!nameStr) {
        return res.status(400).json({ error: 'Trip name is required.' });
      }
      if (!destinationStr) {
        return res.status(400).json({ error: 'Destination is required.' });
      }
      if (itineraryArr.length === 0) {
        return res.status(400).json({ error: 'Itinerary must be a non-empty array.' });
      }

      let normalizedPace = 'balanced';
      if (pace) {
        const key = String(pace).toLowerCase().trim();
        normalizedPace = PACE_ALIASES[key] || 'balanced';
      }

      const daysCandidate = Number.isInteger(Number(days)) ? Number(days) : itineraryArr.length;
      const daysNum = Math.min(10, Math.max(1, daysCandidate));

      const tm = String(transportMode || '').toLowerCase().trim();
      const transportModeVal = TRANSPORT_MODES.includes(tm) ? tm : undefined;

      const isPublic = Boolean(req.body?.isPublic);

      const timestamp = new Date().toISOString();
      const trip = {
        id: crypto.randomUUID(),
        userId: authUser.id,
        name: nameStr,
        destination: destinationStr,
        days: daysNum,
        pace: normalizedPace,
        status: 'upcoming',
        itinerary: itineraryArr,
        transportMode: transportModeVal,
        isPublic,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      authUser.trips.push(trip);
      await writeUsers(users);
      return res.status(201).json(trip);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Trips API error:', error);
    return res.status(500).json({ error: 'Operation failed', message: error.message });
  }
};
