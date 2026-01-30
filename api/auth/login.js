const { readUsers, verifyPassword, generateToken, normalizeEmail } = require('../lib/db');

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
