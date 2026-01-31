const { readUsers, writeUsers } = require('../../lib/db');
const { getAuthUser } = require('../../lib/auth');

function ensureTrips(user) {
  if (!Array.isArray(user.trips)) {
    user.trips = [];
  }
  return user.trips;
}

function getTripIdFromRequest(req) {
  const pathname = (req.url || '').split('?')[0];
  const segments = pathname.split('/').filter(Boolean);
  return segments[segments.length - 2] || '';
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PATCH') {
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
    trip.status = 'upcoming';
    trip.updatedAt = new Date().toISOString();
    await writeUsers(users);
    return res.status(200).json(trip);
  } catch (error) {
    console.error('Unarchive error:', error);
    return res.status(500).json({ error: 'Operation failed', message: error.message });
  }
};
