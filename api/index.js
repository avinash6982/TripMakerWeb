// Load Express app from backend
let app;

module.exports = (req, res) => {
  try {
    // Lazy load the Express app (only once)
    if (!app) {
      app = require('../apps/backend/server');
    }
    
    // Let Express handle the request
    return app(req, res);
  } catch (error) {
    console.error('Error in API function:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};
