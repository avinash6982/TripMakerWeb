const crypto = require('crypto');
const { readUsers, writeUsers, hashPassword, generateToken, normalizeEmail, DEFAULT_PROFILE } = require('../lib/db');

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
      trips: [],
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
