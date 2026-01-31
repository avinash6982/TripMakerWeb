/**
 * Single API entry point for Vercel (Hobby plan: max 12 serverless functions).
 * All /api/* requests are rewritten here; we route by path and method.
 */
const handleHealth = require('./lib/handlers/health');
const { handleLogin, handleRegister } = require('./lib/handlers/auth');
const { handleProfile } = require('./lib/handlers/userProfile');
const { handleRedeem } = require('./lib/handlers/invite');
const {
  handleTripsIndex,
  handleTripsPlan,
  handleTripsFeed,
  handleTripById,
  handleTripArchive,
  handleTripUnarchive,
  handleTripInvite,
} = require('./lib/handlers/trips');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function apiRoot(req, res) {
  res.status(200).json({
    message: 'TripMaker API',
    version: '2.0.0',
    docs: '/api-docs',
    endpoints: {
      health: '/api/health',
      auth: { register: 'POST /api/auth/register', login: 'POST /api/auth/login' },
      trips: { plan: 'POST /api/trips/plan', list: 'GET /api/trips', feed: 'GET /api/trips/feed' },
      user: { profile: 'GET/PUT /api/user/profile' },
      invite: { redeem: 'POST /api/invite/redeem' },
    },
  });
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = (req.url || '').split('?')[0].replace(/\/$/, '') || '';
  const pathNorm = path === '/api' ? path : path.replace(/\/$/, '');

  if (pathNorm === '/api/health') return handleHealth(req, res);
  if (pathNorm === '/api') return apiRoot(req, res);
  if (pathNorm === '/api/auth/login') return handleLogin(req, res);
  if (pathNorm === '/api/auth/register') return handleRegister(req, res);
  if (pathNorm.startsWith('/api/user/profile')) return handleProfile(req, res);
  if (pathNorm === '/api/invite/redeem') return handleRedeem(req, res);
  if (pathNorm === '/api/trips/plan') return handleTripsPlan(req, res);
  if (pathNorm === '/api/trips/feed') return handleTripsFeed(req, res);
  if (pathNorm === '/api/trips') return handleTripsIndex(req, res);

  const tripIdMatch = pathNorm.match(/^\/api\/trips\/([^/]+)(?:\/(.+))?$/);
  if (tripIdMatch) {
    const [, id, sub] = tripIdMatch;
    if (sub === 'archive') return handleTripArchive(req, res);
    if (sub === 'unarchive') return handleTripUnarchive(req, res);
    if (sub === 'invite') return handleTripInvite(req, res);
    return handleTripById(req, res);
  }

  return res.status(404).json({ error: 'Not found', path: pathNorm });
};
