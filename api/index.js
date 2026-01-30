// Vercel serverless function for Express backend
const path = require('path');

let app = null;
let appError = null;

function getApp() {
  if (!app && !appError) {
    try {
      const backendPath = path.join(process.cwd(), 'apps', 'backend', 'server.js');
      app = require(backendPath);
    } catch (error) {
      appError = error;
    }
  }
  return { app, error: appError };
}

module.exports = async (req, res) => {
  const { app, error } = getApp();
  
  if (error) {
    return res.status(500).json({
      error: 'Failed to initialize backend',
      message: error.message
    });
  }
  
  try {
    // Call Express app and wait for it to finish
    await new Promise((resolve, reject) => {
      // Wrap res.end to know when Express is done
      const originalEnd = res.end;
      res.end = function(...args) {
        res.end = originalEnd;
        const result = originalEnd.apply(this, args);
        resolve();
        return result;
      };
      
      // Let Express handle the request
      app(req, res);
      
      // Timeout after 10 seconds
      setTimeout(() => reject(new Error('Request timeout')), 10000);
    });
  } catch (error) {
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Request handling failed',
        message: error.message
      });
    }
  }
};
