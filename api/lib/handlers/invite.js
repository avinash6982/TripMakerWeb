const { readUsers, writeUsers } = require('../db');
const { getAuthUser } = require('../auth');

function ensureTrips(user) {
  if (!Array.isArray(user.trips)) user.trips = [];
  return user.trips;
}

function ensureInvites(trip) {
  if (!Array.isArray(trip.invites)) trip.invites = [];
  return trip.invites;
}

function ensureCollaborators(trip) {
  if (!Array.isArray(trip.collaborators)) trip.collaborators = [];
  return trip.collaborators;
}

async function handleRedeem(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = getAuthUser(req);
  if (!user?.id) return res.status(401).json({ error: 'Authentication required.' });
  const code = String(req.body?.code || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'Code is required.' });
  try {
    const users = await readUsers();
    const authUser = users.find((c) => c.id === user.id);
    if (!authUser) return res.status(404).json({ error: 'User not found.' });
    for (const u of users) {
      ensureTrips(u);
      for (const trip of u.trips || []) {
        ensureInvites(trip);
        ensureCollaborators(trip);
        const idx = trip.invites.findIndex((i) => i.code === code && new Date(i.expiresAt) > new Date());
        if (idx === -1) continue;
        if (trip.userId === user.id) return res.status(400).json({ error: 'You already own this trip.' });
        if (trip.collaborators.some((c) => c.userId === user.id)) return res.status(400).json({ error: 'You are already a collaborator.' });
        const role = trip.invites[idx].role;
        trip.invites.splice(idx, 1);
        trip.collaborators.push({ userId: user.id, email: user.email || '', role });
        trip.updatedAt = new Date().toISOString();
        await writeUsers(users);
        return res.status(200).json({ trip: { ...trip, ownerEmail: u.email }, role });
      }
    }
    return res.status(400).json({ error: 'Invalid or expired invite code.' });
  } catch (error) {
    console.error('Redeem error:', error);
    return res.status(500).json({ error: 'Operation failed', message: error.message });
  }
}

module.exports = { handleRedeem };
