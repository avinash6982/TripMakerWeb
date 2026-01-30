const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Configuration
const TMP_USER_DB_PATH = path.join(os.tmpdir(), 'tripmaker-users.json');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const PASSWORD_KEYLEN = 64;

// Utility functions
async function ensureUsersFile() {
  try {
    await fs.access(TMP_USER_DB_PATH);
  } catch {
    await fs.writeFile(TMP_USER_DB_PATH, '[]');
  }
}

async function readUsers() {
  await ensureUsersFile();
  const raw = await fs.readFile(TMP_USER_DB_PATH, 'utf8');
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    throw new Error(`Invalid users data: ${error.message}`);
  }
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derivedKey = crypto.scryptSync(password, salt, PASSWORD_KEYLEN);
  const storedBuffer = Buffer.from(hash, 'hex');
  if (storedBuffer.length !== derivedKey.length) return false;
  return crypto.timingSafeEqual(storedBuffer, derivedKey);
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function normalizeEmail(email) {
  if (!email) return '';
  return email.toLowerCase().trim();
}

// Main handler
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { email: rawEmail, password } = req.body || {};
    const email = normalizeEmail(rawEmail);
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.'
      });
    }
    
    // Find user
    const users = await readUsers();
    const user = users.find(candidate => candidate.email === email);
    
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({
        error: 'Invalid credentials.'
      });
    }
    
    const token = generateToken(user);
    
    return res.status(200).json({
      id: user.id,
      email: user.email,
      token,
      message: 'Login successful.'
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
};
