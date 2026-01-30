// Vercel serverless function that loads Express backend
let app = null;

module.exports = (req, res) => {
  try {
    // Lazy load the Express app on first request
    if (!app) {
      app = require('../apps/backend/server');
    }
    
    // Let Express handle the request
    return app(req, res);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Backend failed to load',
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};
