const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Configuration
const TMP_USER_DB_PATH = path.join(os.tmpdir(), 'tripmaker-users.json');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const PASSWORD_SALT_BYTES = 16;
const PASSWORD_KEYLEN = 64;
const DEFAULT_PROFILE = {
  phone: '',
  country: '',
  language: 'en',
  currencyType: 'USD'
};

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

async function writeUsers(users) {
  await ensureUsersFile();
  await fs.writeFile(TMP_USER_DB_PATH, JSON.stringify(users, null, 2));
}

function hashPassword(password) {
  const salt = crypto.randomBytes(PASSWORD_SALT_BYTES).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, PASSWORD_KEYLEN);
  return `${salt}:${derivedKey.toString('hex')}`;
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
    
    if (!email.includes('@')) {
      return res.status(400).json({
        error: 'Please provide a valid email address.'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long.'
      });
    }
    
    // Check if user exists
    const users = await readUsers();
    const existing = users.find(user => user.email === email);
    
    if (existing) {
      return res.status(409).json({
        error: 'Email is already registered.'
      });
    }
    
    // Create new user
    const newUser = {
      id: crypto.randomUUID(),
      email,
      passwordHash: hashPassword(password),
      profile: { ...DEFAULT_PROFILE },
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await writeUsers(users);
    
    const token = generateToken(newUser);
    
    return res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      token,
      createdAt: newUser.createdAt
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
};
