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
  const tripId = getTripIdFromRequest(req);
  if (!tripId) {
    return res.status(400).json({ error: 'Trip ID is required.' });
  }

  try {
    const users = await readUsers();
    if (req.method === 'GET') {
      if (user?.id) {
        const authUser = users.find((c) => c.id === user.id);
        if (authUser) {
          ensureTrips(authUser);
          const trip = (authUser.trips || []).find((t) => t.id === tripId);
          if (trip) return res.status(200).json(trip);
        }
        for (const u of users) {
          ensureTrips(u);
          const trip = (u.trips || []).find((t) => t.id === tripId);
          if (!trip) continue;
          const collab = (trip.collaborators || []).find((c) => c.userId === user.id);
          if (collab) return res.status(200).json({ ...trip, ownerEmail: u.email, isCollaborator: true });
        }
      }
      for (const u of users) {
        ensureTrips(u);
        const trip = (u.trips || []).find((t) => t.id === tripId && Boolean(t.isPublic));
        if (trip) return res.status(200).json({ ...trip, ownerEmail: u.email });
      }
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (!user?.id) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const authUser = users.find((c) => c.id === user.id);
    if (!authUser) {
      return res.status(404).json({ error: 'User not found.' });
    }
    ensureTrips(authUser);
    let trip = (authUser.trips || []).find((t) => t.id === tripId);
    let ownerUser = authUser;
    if (!trip) {
      for (const u of users) {
        ensureTrips(u);
        const t = (u.trips || []).find((x) => x.id === tripId);
        if (!t) continue;
        const collab = (t.collaborators || []).find((c) => c.userId === user.id);
        if (collab) {
          if (collab.role === 'editor') {
            trip = t;
            ownerUser = u;
            break;
          }
          return res.status(403).json({ error: 'Viewers cannot edit this trip.' });
        }
      }
    }
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (req.method === 'DELETE') {
      if (trip.userId !== user.id) {
        return res.status(403).json({ error: 'Only the owner can delete this trip.' });
      }
      const idx = ownerUser.trips.findIndex((t) => t.id === tripId);
      if (idx === -1) return res.status(404).json({ error: 'Trip not found.' });
      ownerUser.trips.splice(idx, 1);
      await writeUsers(users);
      return res.status(200).json({ message: 'Trip deleted.' });
    }

    if (req.method === 'PUT') {
      const body = req.body || {};
      const statusValues = ['upcoming', 'active', 'completed', 'archived'];
      const allowed = ['name', 'destination', 'days', 'pace', 'status', 'itinerary', 'transportMode', 'isPublic'];
      for (const key of allowed) {
        if (body[key] === undefined) continue;
        if (key === 'status' && statusValues.includes(String(body[key]))) {
          trip.status = body[key];
          continue;
        }
        if (key === 'transportMode') {
          const tm = String(body[key] || '').toLowerCase().trim();
          trip.transportMode = TRANSPORT_MODES.includes(tm) ? tm : undefined;
          continue;
        }
        if (key === 'isPublic') {
          trip.isPublic = Boolean(body[key]);
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
