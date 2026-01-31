/**
 * Development Test User Seeding
 * 
 * Ensures a consistent test user exists for development.
 * This user is automatically created on first API call.
 */

const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

// Configuration
const TMP_USER_DB_PATH = path.join(os.tmpdir(), 'tripmaker-users.json');
const PASSWORD_SALT_BYTES = 16;
const PASSWORD_KEYLEN = 64;
const DEFAULT_PROFILE = {
  phone: '',
  country: '',
  language: 'en',
  currencyType: 'USD'
};

// Test user credentials (consistent across all environments)
const TEST_USER = {
  id: 'dev-user-00000000-0000-0000-0000-000000000001',
  email: 'dev@tripmaker.com',
  password: 'DevUser123!',
  trips: [],
  profile: {
    phone: '+1 555 123 4567',
    country: 'United States',
    language: 'en',
    currencyType: 'USD'
  }
};

function hashPassword(password) {
  const salt = crypto.randomBytes(PASSWORD_SALT_BYTES).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, PASSWORD_KEYLEN);
  return `${salt}:${derivedKey.toString('hex')}`;
}

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
    console.error('Failed to parse users file:', error);
    return [];
  }
}

async function writeUsers(users) {
  await ensureUsersFile();
  await fs.writeFile(TMP_USER_DB_PATH, JSON.stringify(users, null, 2));
}

/**
 * Seeds the development test user if it doesn't exist
 * Should be called at the start of each API function
 */
async function seedTestUser() {
  try {
    const users = await readUsers();
    
    // Check if test user already exists
    const existingUser = users.find(u => u.id === TEST_USER.id);
    
    if (existingUser) {
      return; // User already exists
    }
    
    // Create test user
    const testUser = {
      id: TEST_USER.id,
      email: TEST_USER.email,
      passwordHash: hashPassword(TEST_USER.password),
      trips: [],
      profile: { ...TEST_USER.profile },
      createdAt: new Date().toISOString(),
      isTestUser: true
    };
    
    users.push(testUser);
    await writeUsers(users);
    
    console.log('✅ Development test user seeded:', TEST_USER.email);
  } catch (error) {
    console.error('Failed to seed test user:', error);
    // Don't throw - this should not break the API
  }
}

/**
 * Gets the test user credentials
 */
function getTestUser() {
  return {
    email: TEST_USER.email,
    password: TEST_USER.password,
    id: TEST_USER.id
  };
}

module.exports = {
  seedTestUser,
  getTestUser,
  TEST_USER
};
