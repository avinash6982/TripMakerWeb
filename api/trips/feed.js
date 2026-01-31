const { readUsers } = require('../lib/db');

function ensureTrips(user) {
  if (!Array.isArray(user.trips)) {
    user.trips = [];
  }
  return user.trips;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
};
