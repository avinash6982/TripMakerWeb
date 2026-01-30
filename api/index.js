// Vercel serverless function wrapper for Express backend
module.exports = async (req, res) => {
  try {
    // Import the Express app from backend
    const app = require('../apps/backend/server');
    
    // Let Express handle the request
    return app(req, res);
  } catch (error) {
    console.error('Error loading backend:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
