const { readUsers, writeUsers, verifyPassword, generateToken, hashPassword, normalizeEmail, DEFAULT_PROFILE } = require('../db');
const crypto = require('crypto');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function handleLogin(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email: rawEmail, password } = req.body || {};
    const email = normalizeEmail(rawEmail);
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    const users = await readUsers();
    const user = users.find((c) => c.email === email);
    if (!user || !verifyPassword(password, user.passwordHash)) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = generateToken(user);
    return res.status(200).json({ id: user.id, email: user.email, token, message: 'Login successful.' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed', message: error.message });
  }
}

async function handleRegister(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email: rawEmail, password } = req.body || {};
    const email = normalizeEmail(rawEmail);
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    if (!email.includes('@')) return res.status(400).json({ error: 'Please provide a valid email address.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    const users = await readUsers();
    const existing = users.find((u) => u.email === email);
    if (existing) return res.status(409).json({ error: 'Email is already registered.' });
    const newUser = {
      id: crypto.randomUUID(),
      email,
      passwordHash: hashPassword(password),
      trips: [],
      profile: { ...DEFAULT_PROFILE },
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    await writeUsers(users);
    const token = generateToken(newUser);
    return res.status(201).json({ id: newUser.id, email: newUser.email, token, createdAt: newUser.createdAt });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed', message: error.message });
  }
}

module.exports = { handleLogin, handleRegister };
