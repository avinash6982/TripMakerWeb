const crypto = require('crypto');
const { readUsers, writeUsers } = require('../db');
const { getAuthUser } = require('../auth');
const { buildTripPlan } = require('../tripPlanner');

const PACE_ALIASES = {
  relaxed: 'relaxed', slow: 'relaxed', easy: 'relaxed',
  balanced: 'balanced', medium: 'balanced', steady: 'balanced',
  fast: 'fast', 'fast-paced': 'fast', active: 'fast',
};
const TRANSPORT_MODES = ['flight', 'train', 'bus'];
const INVITE_ROLES = ['viewer', 'editor'];
const INVITE_EXPIRY_HOURS = 24;

function ensureTrips(user) {
  if (!Array.isArray(user.trips)) user.trips = [];
  return user.trips;
}

function ensureInvites(trip) {
  if (!Array.isArray(trip.invites)) trip.invites = [];
  return trip.invites;
}

function getTripIdFromRequest(req) {
  const pathname = (req.url || '').split('?')[0];
  const segments = pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  const secondLast = segments[segments.length - 2];
  if (last === 'archive' || last === 'unarchive' || last === 'invite') return secondLast || '';
  return last || '';
}

function generateInviteCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

async function handleTripsIndex(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const user = getAuthUser(req);
  if (!user?.id) return res.status(401).json({ error: 'Authentication required.' });
  try {
    const users = await readUsers();
    const authUser = users.find((c) => c.id === user.id);
    if (!authUser) return res.status(404).json({ error: 'User not found.' });
    ensureTrips(authUser);
    if (req.method === 'GET') {
      let trips = [...(authUser.trips || [])];
      for (const u of users) {
        if (u.id === authUser.id) continue;
        if (!Array.isArray(u.trips)) continue;
        for (const t of u.trips) {
          const collab = Array.isArray(t.collaborators) ? t.collaborators : [];
          if (collab.some((c) => c.userId === authUser.id)) trips.push({ ...t, ownerEmail: u.email, isCollaborator: true });
        }
      }
      const statusFilter = String(req.query?.status || '').trim();
      if (statusFilter && ['upcoming', 'active', 'completed', 'archived'].includes(statusFilter)) trips = trips.filter((t) => t.status === statusFilter);
      trips.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
      return res.status(200).json({ trips });
    }
    if (req.method === 'POST') {
      const { name, destination, itinerary, days, pace, transportMode } = req.body || {};
      const nameStr = String(name || '').trim();
      const destinationStr = String(destination || '').trim();
      const itineraryArr = Array.isArray(itinerary) ? itinerary : [];
      if (!nameStr) return res.status(400).json({ error: 'Trip name is required.' });
      if (!destinationStr) return res.status(400).json({ error: 'Destination is required.' });
      if (itineraryArr.length === 0) return res.status(400).json({ error: 'Itinerary must be a non-empty array.' });
      let normalizedPace = 'balanced';
      if (pace) normalizedPace = PACE_ALIASES[String(pace).toLowerCase().trim()] || 'balanced';
      const daysNum = Math.min(10, Math.max(1, Number.isInteger(Number(days)) ? Number(days) : itineraryArr.length));
      const tm = String(transportMode || '').toLowerCase().trim();
      const transportModeVal = TRANSPORT_MODES.includes(tm) ? tm : undefined;
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
        isPublic: Boolean(req.body?.isPublic),
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
}

async function handleTripsPlan(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { destination, days, pace, seed } = req.body || {};
    if (!destination || !String(destination).trim()) return res.status(400).json({ error: 'Destination is required.' });
    if (days !== undefined) {
      const parsedDays = Number(days);
      if (!Number.isFinite(parsedDays) || parsedDays < 1 || parsedDays > 10) return res.status(400).json({ error: 'Days must be between 1 and 10.' });
    }
    if (seed !== undefined && !Number.isFinite(Number(seed))) return res.status(400).json({ error: 'Seed must be a number.' });
    const plan = buildTripPlan({ destination, days, pace, seed });
    return res.status(200).json(plan);
  } catch (error) {
    console.error('Trip plan error:', error);
    return res.status(500).json({ error: 'Trip plan generation failed', message: error.message });
  }
}

async function handleTripsFeed(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const users = await readUsers();
    const allTrips = users.flatMap((u) => {
      ensureTrips(u);
      return (u.trips || []).map((t) => ({ ...t, ownerEmail: u.email }));
    });
    let trips = allTrips.filter((t) => Boolean(t.isPublic));
    const destFilter = String(req.query?.destination || '').trim();
    if (destFilter) {
      const lower = destFilter.toLowerCase();
      trips = trips.filter((t) => String(t.destination || '').toLowerCase().includes(lower));
    }
    const limit = Math.min(50, Math.max(1, Number(req.query?.limit) || 20));
    trips.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    trips = trips.slice(0, limit);
    return res.status(200).json({ trips });
  } catch (error) {
    console.error('Feed API error:', error);
    return res.status(500).json({ error: 'Operation failed', message: error.message });
  }
}

async function handleTripById(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!['GET', 'PUT', 'DELETE'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  const user = getAuthUser(req);
  const tripId = getTripIdFromRequest(req);
  if (!tripId) return res.status(400).json({ error: 'Trip ID is required.' });
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
          if ((trip.collaborators || []).find((c) => c.userId === user.id)) return res.status(200).json({ ...trip, ownerEmail: u.email, isCollaborator: true });
        }
      }
      for (const u of users) {
        ensureTrips(u);
        const trip = (u.trips || []).find((t) => t.id === tripId && Boolean(t.isPublic));
        if (trip) return res.status(200).json({ ...trip, ownerEmail: u.email });
      }
      return res.status(404).json({ error: 'Trip not found.' });
    }
    if (!user?.id) return res.status(401).json({ error: 'Authentication required.' });
    const authUser = users.find((c) => c.id === user.id);
    if (!authUser) return res.status(404).json({ error: 'User not found.' });
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
          if (collab.role === 'editor') { trip = t; ownerUser = u; break; }
          return res.status(403).json({ error: 'Viewers cannot edit this trip.' });
        }
      }
    }
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    if (req.method === 'DELETE') {
      if (trip.userId !== user.id) return res.status(403).json({ error: 'Only the owner can delete this trip.' });
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
        if (key === 'status' && statusValues.includes(String(body[key]))) { trip.status = body[key]; continue; }
        if (key === 'transportMode') { trip.transportMode = TRANSPORT_MODES.includes(String(body[key] || '').toLowerCase().trim()) ? String(body[key]).toLowerCase().trim() : undefined; continue; }
        if (key === 'isPublic') { trip.isPublic = Boolean(body[key]); continue; }
        if (key === 'name' || key === 'destination') { trip[key] = String(body[key] ?? '').trim(); continue; }
        if (key === 'days') { const n = Number(body[key]); if (Number.isInteger(n) && n >= 1 && n <= 10) trip.days = n; continue; }
        if (key === 'pace') { const p = PACE_ALIASES[String(body[key] || '').toLowerCase().trim()]; if (p) trip.pace = p; continue; }
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
}

async function handleTripArchive(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
  const user = getAuthUser(req);
  if (!user?.id) return res.status(401).json({ error: 'Authentication required.' });
  const tripId = getTripIdFromRequest(req);
  if (!tripId) return res.status(400).json({ error: 'Trip ID is required.' });
  try {
    const users = await readUsers();
    const authUser = users.find((c) => c.id === user.id);
    if (!authUser) return res.status(404).json({ error: 'User not found.' });
    ensureTrips(authUser);
    const trip = (authUser.trips || []).find((t) => t.id === tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    trip.status = 'archived';
    trip.updatedAt = new Date().toISOString();
    await writeUsers(users);
    return res.status(200).json(trip);
  } catch (error) {
    console.error('Archive error:', error);
    return res.status(500).json({ error: 'Operation failed', message: error.message });
  }
}

async function handleTripUnarchive(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
  const user = getAuthUser(req);
  if (!user?.id) return res.status(401).json({ error: 'Authentication required.' });
  const tripId = getTripIdFromRequest(req);
  if (!tripId) return res.status(400).json({ error: 'Trip ID is required.' });
  try {
    const users = await readUsers();
    const authUser = users.find((c) => c.id === user.id);
    if (!authUser) return res.status(404).json({ error: 'User not found.' });
    ensureTrips(authUser);
    const trip = (authUser.trips || []).find((t) => t.id === tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    trip.status = 'upcoming';
    trip.updatedAt = new Date().toISOString();
    await writeUsers(users);
    return res.status(200).json(trip);
  } catch (error) {
    console.error('Unarchive error:', error);
    return res.status(500).json({ error: 'Operation failed', message: error.message });
  }
}

async function handleTripInvite(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = getAuthUser(req);
  if (!user?.id) return res.status(401).json({ error: 'Authentication required.' });
  const tripId = getTripIdFromRequest(req);
  if (!tripId) return res.status(400).json({ error: 'Trip ID is required.' });
  try {
    const users = await readUsers();
    const authUser = users.find((c) => c.id === user.id);
    if (!authUser) return res.status(404).json({ error: 'User not found.' });
    ensureTrips(authUser);
    const trip = (authUser.trips || []).find((t) => t.id === tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    ensureInvites(trip);
    const role = INVITE_ROLES.includes(String(req.body?.role || '').toLowerCase()) ? String(req.body.role).toLowerCase() : 'viewer';
    const code = generateInviteCode();
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
    trip.invites.push({ code, role, expiresAt, createdAt: new Date().toISOString() });
    trip.updatedAt = new Date().toISOString();
    await writeUsers(users);
    return res.status(201).json({ code, role, expiresAt });
  } catch (error) {
    console.error('Invite error:', error);
    return res.status(500).json({ error: 'Operation failed', message: error.message });
  }
}

module.exports = {
  handleTripsIndex,
  handleTripsPlan,
  handleTripsFeed,
  handleTripById,
  handleTripArchive,
  handleTripUnarchive,
  handleTripInvite,
};
