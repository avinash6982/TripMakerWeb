// Vercel serverless function for Express backend
const path = require('path');

// Cache the app instance
let app = null;

module.exports = (req, res) => {
  try {
    // Load Express app on first request
    if (!app) {
      const backendPath = path.join(process.cwd(), 'apps', 'backend', 'server.js');
      app = require(backendPath);
    }
    
    // Let Express handle the request
    return app(req, res);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      code: error.code
    });
  }
};
