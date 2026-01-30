/**
 * Database utility functions
 * Shared across all API endpoints
 */

const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { seedTestUser } = require('./seedUser');

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
  // Always seed test user first
  await seedTestUser();
  
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

module.exports = {
  readUsers,
  writeUsers,
  hashPassword,
  verifyPassword,
  generateToken,
  normalizeEmail,
  DEFAULT_PROFILE
};
