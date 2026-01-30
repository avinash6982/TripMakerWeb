// Vercel serverless function for Express backend
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Try to load and use the Express app
    const app = require('../apps/backend/server');
    app(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Failed to load backend',
      message: error.message,
      code: error.code
    });
  }
};
