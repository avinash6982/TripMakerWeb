const crypto = require('crypto');
const { readUsers, writeUsers } = require('../../lib/db');
const { getAuthUser } = require('../../lib/auth');

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
  return segments[segments.length - 2] || '';
}

function generateInviteCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
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
    ensureInvites(trip);
    const role = INVITE_ROLES.includes(String(req.body?.role || '').toLowerCase())
      ? String(req.body.role).toLowerCase()
      : 'viewer';
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
};
