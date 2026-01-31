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

function ensureTrips(user) {
  if (!Array.isArray(user.trips)) {
    user.trips = [];
  }
  return user.trips;
}

function getTripIdFromRequest(req) {
  const pathname = (req.url || '').split('?')[0];
  const segments = pathname.split('/').filter(Boolean);
  return segments[segments.length - 1] || '';
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!['GET', 'PUT', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getAuthUser(req);
  if (!user?.id) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const tripId = getTripIdFromRequest(req);
  if (!tripId) {
    return res.status(400).json({ error: 'Trip ID is required.' });
  }

  try {
    const users = await readUsers();
    const authUser = users.find((c) => c.id === user.id);
    if (!authUser) {
      return res.status(404).json({ error: 'User not found.' });
    }
    ensureTrips(authUser);
    const trip = (authUser.trips || []).find((t) => t.id === tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (req.method === 'GET') {
      return res.status(200).json(trip);
    }

    if (req.method === 'DELETE') {
      const idx = authUser.trips.findIndex((t) => t.id === tripId);
      authUser.trips.splice(idx, 1);
      await writeUsers(users);
      return res.status(200).json({ message: 'Trip deleted.' });
    }

    if (req.method === 'PUT') {
      const body = req.body || {};
      const statusValues = ['upcoming', 'active', 'completed', 'archived'];
      const allowed = ['name', 'destination', 'days', 'pace', 'status', 'itinerary'];
      for (const key of allowed) {
        if (body[key] === undefined) continue;
        if (key === 'status' && statusValues.includes(String(body[key]))) {
          trip.status = body[key];
          continue;
        }
        if (key === 'name' || key === 'destination') {
          trip[key] = String(body[key] ?? '').trim();
          continue;
        }
        if (key === 'days') {
          const n = Number(body[key]);
          if (Number.isInteger(n) && n >= 1 && n <= 10) trip.days = n;
          continue;
        }
        if (key === 'pace') {
          const p = PACE_ALIASES[String(body[key] || '').toLowerCase().trim()];
          if (p) trip.pace = p;
          continue;
        }
        if (key === 'itinerary' && Array.isArray(body[key])) trip.itinerary = body[key];
      }
      trip.updatedAt = new Date().toISOString();
      await writeUsers(users);
      return res.status(200).json(trip);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Trip API error:', error);
    return res.status(500).json({ error: 'Operation failed', message: error.message });
  }
};
