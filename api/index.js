// Vercel serverless function that loads Express backend
let app = null;
let loadError = null;

// Try to load the Express app once
try {
  app = require('../apps/backend/server');
} catch (error) {
  loadError = error;
  console.error('Failed to load Express backend:', error.message);
}

module.exports = (req, res) => {
  // If loading failed, return the error
  if (loadError) {
    return res.status(500).json({
      error: 'Backend initialization failed',
      message: loadError.message,
      code: loadError.code,
      stack: process.env.NODE_ENV !== 'production' ? loadError.stack : undefined
    });
  }
  
  // If app loaded successfully, use it to handle the request
  if (app) {
    return app(req, res);
  }
  
  // Fallback
  return res.status(500).json({ error: 'Backend not available' });
};
