// Test loading the backend module
module.exports = (req, res) => {
  try {
    // Try to load the backend server
    const fs = require('fs');
    const path = require('path');
    
    // Check if the backend file exists
    const backendPath = path.join(__dirname, '..', 'apps', 'backend', 'server.js');
    const exists = fs.existsSync(backendPath);
    
    res.status(200).json({ 
      message: 'Testing backend path',
      backendPath,
      exists,
      cwd: process.cwd(),
      dirname: __dirname
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};
