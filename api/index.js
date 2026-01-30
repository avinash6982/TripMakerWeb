// Debug: Try to load backend and report specific error
module.exports = (req, res) => {
  try {
    // Test if we can access the backend file
    const path = require('path');
    const backendPath = path.join(process.cwd(), 'apps', 'backend', 'server.js');
    
    // Try to require it
    const app = require(backendPath);
    
    // If we get here, it loaded!
    return res.status(200).json({
      success: true,
      message: 'Backend loaded successfully!',
      appType: typeof app
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to load backend',
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
};
