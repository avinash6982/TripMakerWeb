const crypto = require('crypto');
const { readUsers, writeUsers } = require('../db');
const { getAuthUser } = require('../auth');
const { buildTripPlan } = require('../tripPlanner');
const { getObjectSize } = require('../r2');
const { ensureProfile, STORAGE_LIMIT_BYTES } = require('./upload');

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
  if (segments.includes('collaborators') && segments[segments.indexOf('collaborators') - 1]) return segments[segments.indexOf('collaborators') - 1];
  if (last === 'archive' || last === 'unarchive' || last === 'invite' || last === 'messages' || last === 'like' || last === 'comments' || last === 'gallery') return secondLast || '';
  return last || '';
}

function getGalleryImageIdFromRequest(req) {
  const pathname = (req.url || '').split('?')[0];
  const segments = pathname.split('/').filter(Boolean);
  const galleryIdx = segments.indexOf('gallery');
  if (galleryIdx === -1 || galleryIdx + 1 >= segments.length) return '';
  return segments[galleryIdx + 1] || '';
}

function getCollaboratorUserIdFromRequest(req) {
  const pathname = (req.url || '').split('?')[0];
  const segments = pathname.split('/').filter(Boolean);
  const idx = segments.indexOf('collaborators');
  if (idx === -1 || idx + 1 >= segments.length) return '';
  return segments[idx + 1] || '';
}

function ensureLikes(trip) {
  if (!Array.isArray(trip.likes)) trip.likes = [];
  return trip.likes;
}

function ensureComments(trip) {
  if (!Array.isArray(trip.comments)) trip.comments = [];
  return trip.comments;
}

function ensureMessages(trip) {
  if (!Array.isArray(trip.messages)) trip.messages = [];
  return trip.messages;
}

function ensureGallery(trip) {
  if (!Array.isArray(trip.gallery)) trip.gallery = [];
  return trip.gallery;
}

function ensureGalleryImageLikes(item) {
  if (!Array.isArray(item.likes)) item.likes = [];
  return item.likes;
}

function ensureGalleryImageComments(item) {
  if (!Array.isArray(item.comments)) item.comments = [];
  return item.comments;
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
        thumbnailKey: undefined,
        gallery: [],
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
    const user = getAuthUser(req);
    const users = await readUsers();
    const allTrips = users.flatMap((u) => {
      ensureTrips(u);
      return (u.trips || []).map((t) => {
        ensureLikes(t);
        ensureComments(t);
        ensureGallery(t);
        const likeCount = (t.likes || []).length;
        const commentCount = (t.comments || []).length;
        const userLiked = user?.id && (t.likes || []).includes(user.id);
        const galleryPreview = (t.gallery || []).slice(0, 5).map((i) => i.imageKey).filter(Boolean);
        return { ...t, ownerEmail: u.email, likeCount, commentCount, userLiked, galleryPreview };
      });
    });
    let trips = allTrips.filter((t) => Boolean(t.isPublic));
    const destFilter = String(req.query?.destination || '').trim();
    if (destFilter) {
      const lower = destFilter.toLowerCase();
      trips = trips.filter((t) => String(t.destination || '').toLowerCase().includes(lower));
    }
    const interestFilter = String(req.query?.interest || '').trim();
    if (interestFilter) {
      const lower = interestFilter.toLowerCase();
      trips = trips.filter((t) => {
        const dest = String(t.destination || '').toLowerCase();
        const name = String(t.name || '').toLowerCase();
        return dest.includes(lower) || name.includes(lower);
      });
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
      // Resolve trip and owner (by id only; no access check yet)
      let resolvedTrip = null;
      let ownerUser = null;
      for (const u of users) {
        ensureTrips(u);
        const t = (u.trips || []).find((x) => x.id === tripId);
        if (t) {
          resolvedTrip = t;
          ownerUser = u;
          break;
        }
      }
      if (!resolvedTrip) return res.status(404).json({ error: 'Trip not found.' });

      ensureGallery(resolvedTrip);
      // Access: owner or collaborator may always see the trip
      if (user?.id) {
        if (resolvedTrip.userId === user.id) return res.status(200).json(resolvedTrip);
        if ((resolvedTrip.collaborators || []).find((c) => c.userId === user.id)) {
          return res.status(200).json({ ...resolvedTrip, ownerEmail: ownerUser?.email, isCollaborator: true });
        }
      }

      // Private trips: never return to unauthenticated or non-owner/non-collaborator
      if (resolvedTrip.isPublic !== true) return res.status(404).json({ error: 'Trip not found.' });

      return res.status(200).json({ ...resolvedTrip, ownerEmail: ownerUser?.email });
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
      const allowed = ['name', 'destination', 'days', 'pace', 'status', 'itinerary', 'transportMode', 'isPublic', 'thumbnailKey'];
      for (const key of allowed) {
        if (body[key] === undefined) continue;
        if (key === 'status' && statusValues.includes(String(body[key]))) { trip.status = body[key]; continue; }
        if (key === 'transportMode') { trip.transportMode = TRANSPORT_MODES.includes(String(body[key] || '').toLowerCase().trim()) ? String(body[key]).toLowerCase().trim() : undefined; continue; }
        if (key === 'isPublic') { trip.isPublic = Boolean(body[key]); continue; }
        if (key === 'name' || key === 'destination') { trip[key] = String(body[key] ?? '').trim(); continue; }
        if (key === 'days') { const n = Number(body[key]); if (Number.isInteger(n) && n >= 1 && n <= 10) trip.days = n; continue; }
        if (key === 'pace') { const p = PACE_ALIASES[String(body[key] || '').toLowerCase().trim()]; if (p) trip.pace = p; continue; }
        if (key === 'itinerary' && Array.isArray(body[key])) trip.itinerary = body[key];
        if (key === 'thumbnailKey') {
          const val = body[key];
          if (val === null || val === '') { trip.thumbnailKey = undefined; continue; }
          const str = String(val).trim();
          if (!str) { trip.thumbnailKey = undefined; continue; }
          const prefix = `uploads/${authUser.id}/`;
          if (!str.startsWith(prefix)) { return res.status(400).json({ error: 'Invalid thumbnail key.' }); }
          try {
            const objectSize = await getObjectSize(str);
            if (objectSize == null || objectSize <= 0) return res.status(400).json({ error: 'Thumbnail image not found. Upload first.' });
          } catch (e) {
            return res.status(400).json({ error: 'Thumbnail image not found.' });
          }
          trip.thumbnailKey = str;
          continue;
        }
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

async function handleTripMessages(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  const user = getAuthUser(req);
  if (!user?.id) return res.status(401).json({ error: 'Authentication required.' });
  const tripId = getTripIdFromRequest(req);
  if (!tripId) return res.status(400).json({ error: 'Trip ID is required.' });
  try {
    const users = await readUsers();
    const authUser = users.find((c) => c.id === user.id);
    if (!authUser) return res.status(404).json({ error: 'User not found.' });
    let trip = (authUser.trips || []).find((t) => t.id === tripId);
    let ownerUser = authUser;
    if (!trip) {
      for (const u of users) {
        ensureTrips(u);
        const t = (u.trips || []).find((x) => x.id === tripId);
        if (!t) continue;
        const collab = (t.collaborators || []).find((c) => c.userId === user.id);
        if (collab) {
          trip = t;
          ownerUser = u;
          break;
        }
      }
    }
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    ensureMessages(trip);

    if (req.method === 'GET') {
      const limit = Math.min(100, Math.max(1, Number(req.query?.limit) || 50));
      const offset = Math.max(0, Number(req.query?.offset) || 0);
      const sorted = [...trip.messages].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      const messages = sorted.slice(offset, offset + limit);
      return res.status(200).json({ messages, total: trip.messages.length });
    }

    if (req.method === 'POST') {
      const text = String((req.body && req.body.text) ?? '').trim();
      const imageKey = typeof req.body?.imageKey === 'string' ? req.body.imageKey.trim() : '';
      if (!text && !imageKey) return res.status(400).json({ error: 'Message text or image is required.' });
      const collab = (trip.collaborators || []).find((c) => c.userId === user.id);
      const canPost = trip.userId === user.id || (collab && collab.role === 'editor');
      if (!canPost) return res.status(403).json({ error: 'Only trip owner or editors can post messages.' });

      let sizeToAdd = 0;
      if (imageKey) {
        const prefix = `uploads/${authUser.id}/`;
        if (!imageKey.startsWith(prefix)) return res.status(400).json({ error: 'Invalid image key.' });
        const objectSize = await getObjectSize(imageKey);
        if (objectSize == null || objectSize <= 0) return res.status(400).json({ error: 'Image not found or invalid. Upload first.' });
        const profile = ensureProfile(authUser);
        const used = profile.storageUsed || 0;
        if (used + objectSize > STORAGE_LIMIT_BYTES) return res.status(413).json({ error: 'Storage limit exceeded.' });
        sizeToAdd = objectSize;
      }

      const message = {
        id: crypto.randomUUID(),
        userId: user.id,
        text: text || '',
        createdAt: new Date().toISOString(),
      };
      if (imageKey) message.imageKey = imageKey;
      trip.messages.push(message);

      if (sizeToAdd > 0) {
        const profile = ensureProfile(authUser);
        profile.storageUsed = (profile.storageUsed || 0) + sizeToAdd;
      }

      await writeUsers(users);
      return res.status(201).json(message);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Trip messages error:', error);
    return res.status(500).json({ error: 'Operation failed', message: error.message });
  }
}

async function handleTripLike(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!['POST', 'DELETE'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  const user = getAuthUser(req);
  if (!user?.id) return res.status(401).json({ error: 'Authentication required.' });
  const tripId = getTripIdFromRequest(req);
  if (!tripId) return res.status(400).json({ error: 'Trip ID is required.' });
  try {
    const users = await readUsers();
    let trip = null;
    for (const u of users) {
      ensureTrips(u);
      const t = (u.trips || []).find((x) => x.id === tripId);
      if (!t || !t.isPublic) continue;
      trip = t;
      break;
    }
    if (!trip) return res.status(404).json({ error: 'Trip not found or not public.' });
    ensureLikes(trip);
    if (req.method === 'POST') {
      if (!trip.likes.includes(user.id)) trip.likes.push(user.id);
      await writeUsers(users);
      return res.status(200).json({ liked: true, likeCount: trip.likes.length });
    }
    if (req.method === 'DELETE') {
      const idx = trip.likes.indexOf(user.id);
      if (idx !== -1) trip.likes.splice(idx, 1);
      await writeUsers(users);
      return res.status(200).json({ liked: false, likeCount: trip.likes.length });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Trip like error:', error);
    return res.status(500).json({ error: 'Operation failed', message: error.message });
  }
}

async function handleTripComments(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  const tripId = getTripIdFromRequest(req);
  if (!tripId) return res.status(400).json({ error: 'Trip ID is required.' });
  try {
    const users = await readUsers();
    let trip = null;
    let ownerUser = null;
    for (const u of users) {
      ensureTrips(u);
      const t = (u.trips || []).find((x) => x.id === tripId);
      if (!t) continue;
      trip = t;
      ownerUser = u;
      break;
    }
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    if (!trip.isPublic) {
      const user = getAuthUser(req);
      if (!user?.id) return res.status(401).json({ error: 'Authentication required.' });
      const hasAccess = trip.userId === user.id || (trip.collaborators || []).some((c) => c.userId === user.id);
      if (!hasAccess) return res.status(404).json({ error: 'Trip not found.' });
    }
    ensureComments(trip);

    if (req.method === 'GET') {
      const limit = Math.min(100, Math.max(1, Number(req.query?.limit) || 50));
      const offset = Math.max(0, Number(req.query?.offset) || 0);
      const sorted = [...trip.comments].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      const comments = sorted.slice(offset, offset + limit);
      const withEmails = comments.map((c) => {
        const author = users.find((u) => u.id === c.userId);
        return { ...c, authorEmail: author?.email || null };
      });
      return res.status(200).json({ comments: withEmails, total: trip.comments.length });
    }

    if (req.method === 'POST') {
      const user = getAuthUser(req);
      if (!user?.id) return res.status(401).json({ error: 'Authentication required.' });
      if (!trip.isPublic) {
        const hasAccess = trip.userId === user.id || (trip.collaborators || []).some((c) => c.userId === user.id);
        if (!hasAccess) return res.status(403).json({ error: 'Cannot comment on this trip.' });
      }
      const text = String((req.body && req.body.text) ?? '').trim();
      const imageKey = typeof req.body?.imageKey === 'string' ? req.body.imageKey.trim() : '';
      if (!text && !imageKey) return res.status(400).json({ error: 'Comment text or image is required.' });
      const authUser = users.find((u) => u.id === user.id);
      let sizeToAdd = 0;
      if (imageKey) {
        const prefix = `uploads/${authUser.id}/`;
        if (!imageKey.startsWith(prefix)) return res.status(400).json({ error: 'Invalid image key.' });
        const objectSize = await getObjectSize(imageKey);
        if (objectSize == null || objectSize <= 0) return res.status(400).json({ error: 'Image not found. Upload first.' });
        const profile = ensureProfile(authUser);
        const used = profile.storageUsed || 0;
        if (used + objectSize > STORAGE_LIMIT_BYTES) return res.status(413).json({ error: 'Storage limit exceeded.' });
        sizeToAdd = objectSize;
      }
      const newComment = {
        id: crypto.randomUUID(),
        userId: user.id,
        text: text || '',
        createdAt: new Date().toISOString(),
      };
      if (imageKey) newComment.imageKey = imageKey;
      trip.comments.push(newComment);
      if (sizeToAdd > 0) {
        const profile = ensureProfile(authUser);
        profile.storageUsed = (profile.storageUsed || 0) + sizeToAdd;
      }
      await writeUsers(users);
      return res.status(201).json({ ...newComment, authorEmail: user.email });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Trip comments error:', error);
    return res.status(500).json({ error: 'Operation failed', message: error.message });
  }
}

async function handleTripGallery(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  const user = getAuthUser(req);
  const tripId = getTripIdFromRequest(req);
  if (!tripId) return res.status(400).json({ error: 'Trip ID is required.' });
  try {
    const users = await readUsers();
    let trip = null;
    let ownerUser = null;
    let authUser = user?.id ? users.find((c) => c.id === user.id) : null;
    for (const u of users) {
      ensureTrips(u);
      ensureGallery(u);
      const t = (u.trips || []).find((x) => x.id === tripId);
      if (!t) continue;
      trip = t;
      ownerUser = u;
      break;
    }
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    if (req.method === 'GET') {
      const withEmails = (trip.gallery || []).map((item) => {
        const commentsWithEmail = (item.comments || []).map((c) => {
          const author = users.find((u) => u.id === c.userId);
          return { ...c, authorEmail: author?.email || null };
        });
        return { ...item, comments: commentsWithEmail };
      });
      return res.status(200).json({ gallery: withEmails });
    }
    if (req.method === 'POST') {
      if (!user?.id) return res.status(401).json({ error: 'Authentication required.' });
      if (!authUser) return res.status(404).json({ error: 'User not found.' });
      const collab = (trip.collaborators || []).find((c) => c.userId === user.id);
      const canPost = trip.userId === user.id || (collab && collab.role === 'editor');
      if (!canPost) return res.status(403).json({ error: 'Only trip owner or editors can add gallery images.' });
      const imageKey = typeof req.body?.imageKey === 'string' ? req.body.imageKey.trim() : '';
      if (!imageKey) return res.status(400).json({ error: 'imageKey is required.' });
      const prefix = `uploads/${authUser.id}/`;
      if (!imageKey.startsWith(prefix)) return res.status(400).json({ error: 'Invalid image key.' });
      const objectSize = await getObjectSize(imageKey);
      if (objectSize == null || objectSize <= 0) return res.status(400).json({ error: 'Image not found. Upload first.' });
      const profile = ensureProfile(authUser);
      const used = profile.storageUsed || 0;
      if (used + objectSize > STORAGE_LIMIT_BYTES) return res.status(413).json({ error: 'Storage limit exceeded.' });
      const item = {
        id: crypto.randomUUID(),
        imageKey,
        userId: user.id,
        createdAt: new Date().toISOString(),
        likes: [],
        comments: [],
      };
      trip.gallery.push(item);
      profile.storageUsed = (profile.storageUsed || 0) + objectSize;
      trip.updatedAt = new Date().toISOString();
      await writeUsers(users);
      return res.status(201).json(item);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Trip gallery error:', error);
    return res.status(500).json({ error: 'Operation failed', message: error.message });
  }
}

async function handleGalleryLike(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!['POST', 'DELETE'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  const user = getAuthUser(req);
  if (!user?.id) return res.status(401).json({ error: 'Authentication required.' });
  const tripId = getTripIdFromRequest(req);
  const imageId = getGalleryImageIdFromRequest(req);
  if (!tripId || !imageId) return res.status(400).json({ error: 'Trip ID and image ID are required.' });
  try {
    const users = await readUsers();
    let trip = null;
    for (const u of users) {
      ensureTrips(u);
      ensureGallery(u);
      const t = (u.trips || []).find((x) => x.id === tripId);
      if (!t) continue;
      trip = t;
      break;
    }
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    const item = (trip.gallery || []).find((i) => i.id === imageId);
    if (!item) return res.status(404).json({ error: 'Gallery image not found.' });
    ensureGalleryImageLikes(item);
    if (req.method === 'POST') {
      if (!item.likes.includes(user.id)) item.likes.push(user.id);
      await writeUsers(users);
      return res.status(200).json({ liked: true, likeCount: item.likes.length });
    }
    if (req.method === 'DELETE') {
      const idx = item.likes.indexOf(user.id);
      if (idx !== -1) item.likes.splice(idx, 1);
      await writeUsers(users);
      return res.status(200).json({ liked: false, likeCount: item.likes.length });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Gallery like error:', error);
    return res.status(500).json({ error: 'Operation failed', message: error.message });
  }
}

async function handleGalleryComments(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  const user = getAuthUser(req);
  const tripId = getTripIdFromRequest(req);
  const imageId = getGalleryImageIdFromRequest(req);
  if (!tripId || !imageId) return res.status(400).json({ error: 'Trip ID and image ID are required.' });
  try {
    const users = await readUsers();
    let trip = null;
    let authUser = user?.id ? users.find((c) => c.id === user.id) : null;
    for (const u of users) {
      ensureTrips(u);
      ensureGallery(u);
      const t = (u.trips || []).find((x) => x.id === tripId);
      if (!t) continue;
      trip = t;
      break;
    }
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    const item = (trip.gallery || []).find((i) => i.id === imageId);
    if (!item) return res.status(404).json({ error: 'Gallery image not found.' });
    ensureGalleryImageComments(item);
    if (req.method === 'GET') {
      const limit = Math.min(100, Math.max(1, Number(req.query?.limit) || 50));
      const offset = Math.max(0, Number(req.query?.offset) || 0);
      const sorted = [...(item.comments || [])].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      const comments = sorted.slice(offset, offset + limit);
      const withEmails = comments.map((c) => {
        const author = users.find((u) => u.id === c.userId);
        return { ...c, authorEmail: author?.email || null };
      });
      return res.status(200).json({ comments: withEmails, total: item.comments.length });
    }
    if (req.method === 'POST') {
      if (!user?.id) return res.status(401).json({ error: 'Authentication required.' });
      if (!authUser) return res.status(404).json({ error: 'User not found.' });
      const text = String((req.body && req.body.text) ?? '').trim();
      const imageKey = typeof req.body?.imageKey === 'string' ? req.body.imageKey.trim() : '';
      if (!text && !imageKey) return res.status(400).json({ error: 'Comment text or image is required.' });
      let sizeToAdd = 0;
      if (imageKey) {
        const prefix = `uploads/${authUser.id}/`;
        if (!imageKey.startsWith(prefix)) return res.status(400).json({ error: 'Invalid image key.' });
        const objectSize = await getObjectSize(imageKey);
        if (objectSize == null || objectSize <= 0) return res.status(400).json({ error: 'Image not found. Upload first.' });
        const profile = ensureProfile(authUser);
        const used = profile.storageUsed || 0;
        if (used + objectSize > STORAGE_LIMIT_BYTES) return res.status(413).json({ error: 'Storage limit exceeded.' });
        sizeToAdd = objectSize;
      }
      const newComment = {
        id: crypto.randomUUID(),
        userId: user.id,
        text: text || '',
        createdAt: new Date().toISOString(),
      };
      if (imageKey) newComment.imageKey = imageKey;
      item.comments.push(newComment);
      if (sizeToAdd > 0) {
        const profile = ensureProfile(authUser);
        profile.storageUsed = (profile.storageUsed || 0) + sizeToAdd;
      }
      trip.updatedAt = new Date().toISOString();
      await writeUsers(users);
      return res.status(201).json({ ...newComment, authorEmail: authUser.email });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Gallery comments error:', error);
    return res.status(500).json({ error: 'Operation failed', message: error.message });
  }
}

async function handleRemoveCollaborator(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  const user = getAuthUser(req);
  if (!user?.id) return res.status(401).json({ error: 'Authentication required.' });
  const tripId = getTripIdFromRequest(req);
  const collaboratorUserId = getCollaboratorUserIdFromRequest(req);
  if (!tripId || !collaboratorUserId) return res.status(400).json({ error: 'Trip ID and collaborator user ID are required.' });
  try {
    const users = await readUsers();
    let trip = null;
    let ownerUser = null;
    for (const u of users) {
      ensureTrips(u);
      const t = (u.trips || []).find((x) => x.id === tripId);
      if (!t) continue;
      trip = t;
      ownerUser = u;
      break;
    }
    if (!trip || !ownerUser) return res.status(404).json({ error: 'Trip not found.' });
    ensureCollaborators(trip);
    if (trip.userId === collaboratorUserId) return res.status(400).json({ error: 'Cannot remove the trip owner.' });
    const isOwner = trip.userId === user.id;
    const collab = (trip.collaborators || []).find((c) => c.userId === user.id);
    const isEditor = collab && collab.role === 'editor';
    if (!isOwner && !isEditor) return res.status(403).json({ error: 'Only the trip owner or an editor can remove collaborators.' });
    const targetCollab = (trip.collaborators || []).find((c) => c.userId === collaboratorUserId);
    if (!targetCollab) return res.status(404).json({ error: 'Collaborator not found on this trip.' });
    if (targetCollab.role === 'editor' && !isOwner) return res.status(403).json({ error: 'Only the owner can remove editors.' });
    trip.collaborators = trip.collaborators.filter((c) => c.userId !== collaboratorUserId);
    trip.updatedAt = new Date().toISOString();
    await writeUsers(users);
    return res.status(200).json({ message: 'Collaborator removed.', collaborators: trip.collaborators });
  } catch (error) {
    console.error('Remove collaborator error:', error);
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
  handleTripMessages,
  handleTripLike,
  handleTripComments,
  handleTripGallery,
  handleGalleryLike,
  handleGalleryComments,
  handleRemoveCollaborator,
};
