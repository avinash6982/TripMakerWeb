const { readUsers, writeUsers, normalizeEmail } = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function buildProfileResponse(user) {
  return {
    id: user.id,
    email: user.email,
    phone: user.profile?.phone || '',
    country: user.profile?.country || '',
    language: user.profile?.language || 'en',
    currencyType: user.profile?.currencyType || 'USD',
    createdAt: user.createdAt,
  };
}

async function handleProfile(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const userId = req.query.id || (req.url || '').split('?')[0].split('/').pop();
    if (!userId) return res.status(400).json({ error: 'User ID is required.' });
    const users = await readUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (req.method === 'GET') return res.status(200).json(buildProfileResponse(user));
    if (req.method === 'PUT') {
      const { email, phone, country, language, currencyType } = req.body || {};
      if (email !== undefined) {
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail) return res.status(400).json({ error: 'Email must be provided.' });
        const existing = users.find((u) => u.email === normalizedEmail && u.id !== userId);
        if (existing) return res.status(409).json({ error: 'Email is already in use.' });
        user.email = normalizedEmail;
      }
      if (!user.profile) user.profile = {};
      if (phone !== undefined) user.profile.phone = phone;
      if (country !== undefined) user.profile.country = country;
      if (language !== undefined) user.profile.language = language;
      if (currencyType !== undefined) user.profile.currencyType = currencyType;
      await writeUsers(users);
      return res.status(200).json(buildProfileResponse(user));
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ error: 'Profile operation failed', message: error.message });
  }
}

module.exports = { handleProfile };
