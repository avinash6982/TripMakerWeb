// Import the Express app from backend
const app = require('../apps/backend/server');

// Export as Vercel serverless function handler
module.exports = (req, res) => {
  // Let Express handle the request
  return app(req, res);
};
